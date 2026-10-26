import { test, expect } from '@playwright/test';

test('admin imports, prepares, configures, deploys and publishes a GitHub project', async ({ page }) => {
  await page.route('**/api/v1/auth/me', r => r.fulfill({json:{name:'Owner',role:'admin'}}));
  await page.route('**/api/v1/*/records?*', r => r.fulfill({json:{items:[]}}));
  let project: any; let published=false; let environmentSaved=false; let deployed=false;
  await page.route('**/api/v1/cms/hosting**', async r => {
    const path = new URL(r.request().url()).pathname;
    if(path.endsWith('/hosting') && r.request().method()==='GET') return r.fulfill({json:{configured:true,missing:[],domain:'fangscriptlab.com',privateRepositories:false,items:project?[project]:[]}});
    if(path.endsWith('/hosting') && r.request().method()==='POST') {project={id:'11111111-1111-4111-8111-111111111111',input:r.request().postDataJSON(),status:'draft',url:'https://novexa.fangscriptlab.com'};return r.fulfill({json:project});}
    if(path.endsWith('/prepare')) {project.application_uuid='hosting-app';return r.fulfill({json:project});}
    if(path.endsWith('/environment')) {const data=r.request().postDataJSON();expect(data[0].key).toBe('PUBLIC_API_URL');expect(data[0].is_buildtime).toBe(true);environmentSaved=true;return r.fulfill({json:{ok:true}});}
    if(path.endsWith('/deploy')) {deployed=true;project.status='building';return r.fulfill({json:project});}
    if(path.endsWith('/publish')) {published=true;return r.fulfill({json:{url:project.url,caseStudyId:'case'}});}
    if(deployed){project.status='ready';project.logs='Build completed successfully';}
    return r.fulfill({json:project});
  });
  await page.goto('/admin/');
  await page.getByRole('button',{name:'Project hosting',exact:true}).click();
  await page.getByRole('button',{name:'Import from GitHub'}).click();
  await page.getByLabel('Project name', {exact:true}).fill('Novexa Retail');
  await page.getByLabel('GitHub repository', {exact:true}).fill('https://github.com/FangScript/novexa');
  await page.getByLabel('Project address', {exact:true}).fill('novexa');
  await page.getByRole('button',{name:'Save project',exact:true}).click();
  await expect(page.getByRole('button',{name:'Publish to Work'})).toHaveCount(0);
  await page.getByRole('button',{name:'Prepare environment'}).click();
  await page.getByText('Environment variables',{exact:true}).click();
  await page.getByLabel('Variable name',{exact:true}).fill('PUBLIC_API_URL');
  await page.getByLabel('Variable value',{exact:true}).fill('https://api.example.com');
  await page.getByRole('combobox',{name:'Available during build',exact:true}).selectOption('yes');
  await page.getByRole('button',{name:'Save variable'}).click();
  await expect(page.getByRole('status')).toContainText('Variable saved');
  expect(environmentSaved).toBe(true);
  await page.getByRole('button',{name:'Redeploy project'}).click();
  await page.getByRole('button',{name:'Refresh status & logs'}).click();
  await expect(page.getByRole('link',{name:'Open live preview'})).toHaveAttribute('href','https://novexa.fangscriptlab.com');
  await expect(page.locator('.hosting-logs')).toContainText('Build completed successfully');
  await page.getByRole('button',{name:'Publish to Work'}).click();
  await expect(page.getByRole('status').filter({hasText:'Published to Work'})).toBeVisible();
  expect(published).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({path:'artifacts/hosting-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.sidebar')).toHaveCSS('left', '-250px');
  await page.screenshot({path:'artifacts/hosting-mobile.png',fullPage:true,animations:'disabled'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('hosting clearly reports missing configuration and blocks importing',async({page})=>{
  await page.route('**/api/v1/auth/me',r=>r.fulfill({json:{name:'Owner',role:'admin'}}));
  await page.route('**/api/v1/*/records?*',r=>r.fulfill({json:{items:[]}}));
  await page.route('**/api/v1/cms/hosting',r=>r.fulfill({json:{configured:false,missing:['HOSTING_COOLIFY_URL'],domain:'',items:[]}}));
  await page.goto('/admin/');await page.getByRole('button',{name:'Project hosting',exact:true}).click();
  await expect(page.getByText('Connect your hosting server first.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Import from GitHub'})).toBeDisabled();
});

test('published hosted project opens its live preview from Work',async({page})=>{
  await page.route('**/api/v1/cms/public**',r=>r.fulfill({json:{items:[{id:'project',kind:'case-study',slug:'novexa',title:'Novexa Retail',data:{category:'technology',liveUrl:'https://novexa.fangscriptlab.com',openLivePreview:true}}]}}));
  await page.goto('/work');
  const card=page.locator('.project-card').filter({hasText:'Novexa Retail'});
  await expect(card).toHaveAttribute('href','https://novexa.fangscriptlab.com');
  await expect(card).toHaveAttribute('target','_blank');
  await expect(card).toHaveAttribute('rel','noopener noreferrer');
});
