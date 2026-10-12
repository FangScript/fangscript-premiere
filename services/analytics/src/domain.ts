import { z } from 'zod';
export const recordInput=z.object({kind:z.string().min(1).max(50),title:z.string().min(1).max(300),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200).nullable().optional(),status:z.enum(['draft','published','new','qualified','disqualified','converted','open','won','lost','active','complete','pending','approved','sent','accepted','rejected','expired','paid','overdue','cancelled','posted','disabled']).default('draft'),tenantId:z.string().uuid().nullable().optional(),data:z.record(z.unknown()).default({}),version:z.number().int().positive().optional()}).strict();
export const leadInput=z.object({name:z.string().trim().min(1).max(150),email:z.string().trim().email().max(250),company:z.string().max(200).optional(),serviceCategory:z.string().max(200).optional(),budget:z.string().max(100).optional(),message:z.string().trim().min(10).max(6000),consent:z.literal(true),honeypot:z.string().max(200).optional(),source:z.enum(['website','chatbot','booking']).default('website'),utm:z.record(z.string().max(300)).optional()});
export function canRead(user:{role:string;tenantId?:string},record:{tenant_id?:string;data?:any}){return user.role==='admin'||user.role==='team'||(user.role==='client'&&!!user.tenantId&&user.tenantId===record.tenant_id&&record.data?.clientVisible!==false);}
function invalid(message:string):never {throw Object.assign(new Error(message),{statusCode:400});}
// Convert the submitted decimal representation to a rational before rounding.
// Binary floating-point multiplication can turn 1.005 into 100.499999 cents.
function roundedProduct(value:number,multiplier:bigint,divisor=1n):bigint {
 const [mantissa,exponent='0']=String(value).toLowerCase().split('e');
 const [whole,fraction='']=mantissa!.split('.');
 const shift=Number(exponent)-fraction.length;
 let numerator=BigInt(whole!+fraction)*multiplier;
 let denominator=divisor;
 if(shift>=0)numerator*=10n**BigInt(shift);else denominator*=10n**BigInt(-shift);
 return (numerator+denominator/2n)/denominator;
}
export function invoiceTotals(lines:{quantity:number;unitPrice:number}[],taxPercent:number=0){
 if(!lines.length||lines.length>100||!Number.isFinite(taxPercent)||taxPercent<0||taxPercent>100)invalid('Invalid invoice');
 let subtotal=0n;
 for(const line of lines){
  if(!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>100000||!Number.isFinite(line.unitPrice)||line.unitPrice<0||line.unitPrice>100000000)invalid('Invalid line item');
  subtotal+=BigInt(line.quantity)*roundedProduct(line.unitPrice,100n);
 }
 const tax=roundedProduct(taxPercent,subtotal,100n);
 const total=subtotal+tax;
 if(total>BigInt(Number.MAX_SAFE_INTEGER))invalid('Invoice amount is too large');
 return {subtotal:Number(subtotal),tax:Number(tax),total:Number(total)};
}
export function safeURL(value:unknown){if(typeof value!=='string')return;const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)invalid('Only HTTP(S) links are supported');return u.toString();}
export function sanitize(kind:string,data:Record<string,any>){const result={...data};for(const key of ['image','liveUrl','linkedin','github'])if(result[key])result[key]=safeURL(result[key]);if(kind==='invoices'||kind==='proposals'){const schema=z.object({lines:z.array(z.object({description:z.string().max(500),quantity:z.number().int().positive(),unitPrice:z.number().nonnegative()})).min(1).max(100),currency:z.string().regex(/^[A-Z]{3}$/).default('PKR'),taxPercent:z.number().min(0).max(100).default(0),dueDate:z.string().optional()}).passthrough();const parsed=schema.parse(data);return {...parsed,...invoiceTotals(parsed.lines,parsed.taxPercent)};}if(kind==='category'){z.object({services:z.array(z.string().min(1).max(200)).min(1),summary:z.string(),shortTitle:z.string(),headline:z.string(),eyebrow:z.string()}).passthrough().parse(data);}return result;}
