import { test } from 'node:test';import assert from 'node:assert/strict';import {canRead,invoiceTotals,leadInput,safeURL,recordInput} from '../src/domain.ts';
test('client cannot read another company or internal records',()=>{assert.equal(canRead({role:'client',tenantId:'a'},{tenant_id:'b'}),false);assert.equal(canRead({role:'client',tenantId:'a'},{tenant_id:'a',data:{clientVisible:false}}),false);assert.equal(canRead({role:'client',tenantId:'a'},{tenant_id:'a'}),true);assert.equal(canRead({role:'client'},{tenant_id:undefined}),false);});
test('invoice math uses minor units and validates quantities',()=>{assert.deepEqual(invoiceTotals([{quantity:3,unitPrice:10.1}],5),{subtotal:3030,tax:152,total:3182});assert.throws(()=>invoiceTotals([{quantity:-1,unitPrice:10}],0));assert.throws(()=>invoiceTotals([{quantity:1,unitPrice:NaN}],0));});
test('lead submission requires explicit consent and a real email',()=>{assert.equal(leadInput.safeParse({name:'A',email:'invalid',message:'A valid project description',consent:true}).success,false);assert.equal(leadInput.safeParse({name:'A',email:'a@example.com',message:'A valid project description',consent:false}).success,false);});
test('unsafe links and unknown record fields rejected',()=>{assert.throws(()=>safeURL('javascript:alert(1)'));assert.equal(recordInput.safeParse({kind:'post',title:'T',role:'admin'}).success,false);});

test('decimal half-cent prices round consistently before quantity multiplication',()=>{
 assert.deepEqual(invoiceTotals([{quantity:3,unitPrice:1.005}],0),{subtotal:303,tax:0,total:303});
 assert.deepEqual(invoiceTotals([{quantity:1,unitPrice:10.075}],5),{subtotal:1008,tax:50,total:1058});
 assert.deepEqual(invoiceTotals([{quantity:1,unitPrice:0.0000001}],0),{subtotal:0,tax:0,total:0});
});
test('tax rounding is exact and the complete total must remain a safe integer',()=>{
 assert.deepEqual(invoiceTotals([{quantity:1,unitPrice:0.1}],5),{subtotal:10,tax:1,total:11});
 assert.throws(()=>invoiceTotals(Array.from({length:10},()=>({quantity:100000,unitPrice:100000000})),100),/too large/);
});
