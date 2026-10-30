import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hostingInput, hostingConfig, applicationPayload, coolifyClient, deploymentState, readableLogs } from '../src/hosting-provider.ts';
import { registerHosting } from '../src/hosting.ts';

const env = { HOSTING_COOLIFY_URL: 'https://hosting.example.com', HOSTING_COOLIFY_TOKEN: 'test-token-not-a-real-secret', HOSTING_PROJECT_UUID: 'project', HOSTING_SERVER_UUID: 'server', HOSTING_BASE_DOMAIN: 'fangscriptlab.com' };
const input = hostingInput.parse({ title: 'Novexa', repository: 'https://github.com/FangScript/novexa', branch: 'main', slug: 'novexa', mode: 'static' });
test('validates GitHub links, reserved subdomains and repository-relative build paths', () => {
  for (const repository of ['http://github.com/FangScript/a','https://github.com.evil.test/FangScript/a','https://token@github.com/FangScript/a','https://github.com/FangScript/a?token=x','https://github.com/FangScript/a/tree/main']) assert.equal(hostingInput.safeParse({ ...input, repository }).success, false);
  for (const slug of ['admin', 'coolify', '../api', 'a.b', '-novexa']) assert.equal(hostingInput.safeParse({ ...input, slug }).success, false);
  assert.equal(hostingInput.safeParse({ ...input, baseDirectory: '/../other' }).success, false);
  assert.equal(hostingInput.safeParse({ ...input, image: 'javascript:alert(1)' }).success, false);
});
test('hosting setup fails closed and never returns the provider token', () => {
  assert.equal(hostingConfig({}).configured, false);
  assert.equal(hostingConfig(env).configured, true);
  assert.equal(JSON.stringify(hostingConfig(env)).includes(env.HOSTING_COOLIFY_TOKEN), false);
  assert.throws(() => applicationPayload(input,'id',{}));
  assert.throws(() => applicationPayload({ ...input, privateRepo: true },'id',env));
});
test('build payload uses own subdomain and separates frontend, server, private and Docker builds', () => {
  const staticApp = applicationPayload(input,'id',env);
  assert.equal(staticApp.domains,'https://novexa.fangscriptlab.com');
  assert.equal(staticApp.is_static,true); assert.equal(staticApp.ports_exposes,'80');
  assert.equal(staticApp.instant_deploy,false); assert.equal(staticApp.is_auto_deploy_enabled,false);
  assert.equal(JSON.stringify(staticApp).includes(env.HOSTING_COOLIFY_TOKEN),false);
  const nodeApp = applicationPayload({ ...input, mode:'node',port:4000 },'id',env);
  assert.equal(nodeApp.ports_exposes,'4000'); assert.equal(nodeApp.is_static,false);
  const docker = applicationPayload({ ...input,mode:'dockerfile',privateRepo:true },'id',{...env,HOSTING_GITHUB_APP_UUID:'github-app'});
  assert.equal(docker.build_pack,'dockerfile'); assert.equal(docker.github_app_uuid,'github-app'); assert.equal('install_command' in docker,false);
});
test('provider transport has fixed server origin and does not expose response bodies on errors', async () => {
  let request: any;
  const call = coolifyClient(env, (async (url: any, init: any) => { request={url,init}; return new Response('{"uuid":"app"}',{status:201}); }) as typeof fetch);
  assert.deepEqual(await call('/applications/public','POST',{name:'demo'}),{uuid:'app'});
  assert.equal(request.url,'https://hosting.example.com/api/v1/applications/public');
  assert.equal(request.init.headers.Authorization,'Bearer '+env.HOSTING_COOLIFY_TOKEN);
  assert.equal(request.init.redirect,'error');
  const denied = coolifyClient(env,(async () => new Response('private-provider-body',{status:403})) as typeof fetch);
  await assert.rejects(denied('/applications'),e => e instanceof Error && e.message.includes('403') && !e.message.includes('private-provider-body'));
});
test('only a finished build and running container can become ready', () => {
  assert.equal(deploymentState('finished','running:healthy'),'ready');
  assert.equal(deploymentState('finished','running:unhealthy'),'starting');
  assert.equal(deploymentState('finished','exited'),'starting');
  assert.equal(deploymentState('in_progress','running:healthy'),'building');
  assert.equal(deploymentState('failed','running:healthy'),'failed');
  assert.equal(readableLogs('[{"output":"test-token ok"}]','test-token'),'[redacted] ok');
});

function harness(role='admin', listApplication=true) {
  const routes = new Map<string,Function>(); let row: any = { id:'11111111-1111-4111-8111-111111111111',slug:input.slug,input,url:'https://novexa.fangscriptlab.com',status:'draft',application_uuid:null,deployment_uuid:null };
  const calls: string[]=[]; const records:any[]=[]; let failure=false; let build='finished'; let cached=true;
  const c = { release(){}, async query(sql:string,args:any[]=[]) {
    if(sql.includes('pg_try_advisory_lock')) return {rows:[{locked:true}]};
    if(sql.includes('pg_advisory_unlock')) return {rows:[]};
    if(sql.startsWith('SELECT * FROM hosted_projects WHERE'))return {rows:[structuredClone(row)]};
    if(sql.startsWith('UPDATE hosted_projects SET status')) { Object.assign(row,{status:args[1],application_uuid:args[2],deployment_uuid:args[3],error:args[4],submitted_at:args[5]}); return {rows:[]}; }
    if(sql.startsWith('UPDATE hosted_projects SET case_study_id')) {row.case_study_id=args[1];return {rows:[]};}
    if(sql.startsWith("SELECT id FROM records WHERE kind='case-study'"))return {rows:[]};
    throw new Error('Unexpected SQL in test: '+sql);
  }};
  const provider=async (path:string,method='GET',body?:any) => {
    calls.push(method+' '+path);
    if(path==='/applications/public') { if(failure)throw new Error('timeout'); return {uuid:'coolify-app'}; }
    if(path==='/applications')return listApplication ? [{uuid:'coolify-app',name:'fangscript-preview-'+row.id}] : [];
    if(path.startsWith('/deploy?'))return {deployments:[{resource_uuid:'coolify-app',deployment_uuid:'deployment'}]};
    if(path==='/deployments/deployment')return {status:build,logs:'build complete'};
    if(path==='/applications/coolify-app')return {status:'running:healthy'};
    if(path.endsWith('/envs/bulk'))return {secret:'never returned',data:body};
    throw new Error('Unexpected provider request: '+path);
  };
  const app=Object.fromEntries(['get','post','put','patch'].map(method=>[method,(path:string,fn:Function)=>routes.set(method+' '+path,fn)]));
  registerHosting(app,async()=>({role}),u=>{if(u.role!=='admin')throw Object.assign(new Error('Denied'),{statusCode:403});},{async del(){cached=false;}}, {
    pool:{connect:async()=>c},transaction:async(fn:Function)=>fn(c),createRecord:async(...args:any[])=>{records.push(args);return {id:'case-study'};},emit:async()=>{},
  },provider);
  const invoke=(method:string,suffix:string,body?:any)=>routes.get(method+' /api/v1/cms/hosting'+suffix)!({params:{id:row.id},body});
  return {invoke,calls,records,row,fail:()=>{failure=true;},build:(v:string)=>{build=v;},cached:()=>cached,routes};
}
test('every hosting endpoint rejects a non-administrator before touching a provider or database',async()=>{
  const h=harness('team');
  for(const fn of h.routes.values())await assert.rejects(fn({}),{statusCode:403});
  assert.equal(h.calls.length,0);
});
test('prepare, deploy, status and publish reuse one application and publish the live URL',async()=>{
  const old={...process.env};Object.assign(process.env,env);
  try {
    const h=harness();await h.invoke('post','/:id/prepare');await h.invoke('post','/:id/deploy');
    await assert.rejects(h.invoke('post','/:id/deploy'),{statusCode:409});
    const ready=await h.invoke('get','/:id');assert.equal(ready.status,'ready');
    const published=await h.invoke('post','/:id/publish');assert.equal(published.url,h.row.url);
    assert.equal(h.records[0][3].liveUrl,h.row.url);assert.equal(h.records[0][3].openLivePreview,true);assert.equal(h.cached(),false);
    assert.equal(h.calls.filter(x=>x==='POST /applications/public').length,1);
  }finally{for(const k of Object.keys(env)){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}}
});
test('ambiguous creation is reconciled without provisioning duplicate applications',async()=>{
  const old={...process.env};Object.assign(process.env,env);
  try{const h=harness();h.fail();await assert.rejects(h.invoke('post','/:id/prepare'));assert.equal(h.row.status,'provisioning');await assert.rejects(h.invoke('post','/:id/prepare'),{statusCode:409});await h.invoke('get','/:id');assert.equal(h.row.application_uuid,'coolify-app');assert.equal(h.calls.filter(x=>x==='POST /applications/public').length,1);}
  finally{for(const k of Object.keys(env)){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}}
});
test('unconfirmed creation becomes retryable when Coolify has no matching application',async()=>{
  const old={...process.env};Object.assign(process.env,env);
  try{const h=harness('admin',false);h.fail();await assert.rejects(h.invoke('post','/:id/prepare'));await h.invoke('get','/:id');assert.equal(h.row.status,'failed');assert.match(h.row.error,/retry preparation/);}
  finally{for(const k of Object.keys(env)){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}}
});
test('failed builds cannot be published and environment responses contain no values',async()=>{
  const h=harness();h.row.application_uuid='coolify-app';h.row.deployment_uuid='deployment';h.build('failed');
  await assert.rejects(h.invoke('post','/:id/publish'),{statusCode:409});assert.equal(h.records.length,0);
  assert.deepEqual(await h.invoke('patch','/:id/environment',[{key:'DATABASE_URL',value:'secret',is_buildtime:false,is_runtime:true}]),{ok:true});
});
