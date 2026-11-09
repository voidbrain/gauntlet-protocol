import {mkdirSync,lstatSync,realpathSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname,relative,isAbsolute,sep,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import type {Report} from './index.ts';
import {createHash} from 'node:crypto';
export const FAILURE_FILE_BYTES=16384, FAILURE_TOTAL_BYTES=131072, FAILURE_FILES=10;
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
/** Preflight only. Captures require a new canonical private directory outside a checkout. */
export function failureDestination(value:unknown):string {
 if(process.platform==='win32')throw Error('Private failure capture permission verification unavailable on Windows');
 if(typeof value!=='string'||!isAbsolute(value)||value.split(/[\\/]/).includes('.git'))throw Error('Failure capture needs a new absolute private directory');
 const path=resolve(value);try{lstatSync(path);throw Error('Failure capture directory already exists');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const parent=dirname(path);
 for(let a=parent;;a=dirname(a)){if(lstatSync(a).isSymbolicLink())throw Error('Failure capture ancestors must not be symlinks');if(a===dirname(a))break;}
 if(!lstatSync(parent).isDirectory())throw Error('Failure capture parent must exist');
 let checkout:string|null=null;try{checkout=realpathSync(execFileSync('git',['-C',parent,'rev-parse','--show-toplevel'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim());}catch{}
 if(checkout){const rel=relative(checkout,path);if(rel===''||rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel))throw Error('Failure captures must be outside a checkout');}
 return path;
}
interface Capture {reportId:string;caseId:string;iteration:number;fixtureHash:string;responseHash:string;reason:'invalid-json'|'acceptance-mismatch'|'truncated-output';response:string;finishReason:string|null}
export class FailureCapture {
 readonly directory:string;private files:{file:string;sha256:string;bytes:number}[]=[];private bytes=0;private skipped=0;private errors=0;private finished=false;
 constructor(path:string){this.directory=failureDestination(path);mkdirSync(this.directory,{mode:0o700});const s=lstatSync(this.directory);if((s.mode&0o077)!==0||s.uid!==process.getuid?.())throw Error('Failure directory must be private and owned');}
 add(value:Capture):void {
  if(this.finished)throw Error('Capture already finished');
  if(this.files.length>=FAILURE_FILES){this.skipped++;return;}
  // Reserve room for the bounded manifest. Captured content never includes prompts/expected answers/thinking.
  const bound=Math.min(FAILURE_FILE_BYTES,FAILURE_TOTAL_BYTES-16384-this.bytes);if(bound<1024){this.skipped++;return;}
  const {response,...metadata}=value;let text=Buffer.from(response).subarray(0,bound).toString('utf8');let body='';
  for(;;){body=JSON.stringify({schemaVersion:1,...metadata,finishReason:value.finishReason?.slice(0,40)??null,response:text,originalResponseBytes:Buffer.byteLength(response),truncated:text!==response})+'\n';if(Buffer.byteLength(body)<=bound)break;if(!text){this.skipped++;return;}text=text.slice(0,Math.floor(text.length/2));}
  const file='failure-'+String(this.files.length+1).padStart(4,'0')+'.json';
  try{writeFileSync(join(this.directory,file),body,{flag:'wx',mode:0o600});this.bytes+=Buffer.byteLength(body);this.files.push({file,sha256:digest(body),bytes:Buffer.byteLength(body)});}catch{this.errors++;}
 }
 finish():void {if(this.finished)return;this.finished=true;const body=JSON.stringify({schemaVersion:1,files:this.files,skipped:this.skipped,errors:this.errors,bytes:this.bytes,limits:{fileBytes:FAILURE_FILE_BYTES,totalBytes:FAILURE_TOTAL_BYTES,files:FAILURE_FILES},note:'Private untrusted final responses only. Captures do not change grading or reconstruct old replies.'})+'\n';try{writeFileSync(join(this.directory,'index.json'),body,{flag:'wx',mode:0o600});}catch{/* Missing manifest means unavailable capture evidence, not a successful capture. */}}
}
/** Explicit local inspection, bounded and hash checked; output contains private untrusted response text. */
export function inspectFailures(path:string,report?:Report):unknown {
 const root=resolve(path),s=lstatSync(root);if(s.isSymbolicLink()||!s.isDirectory()||(process.platform!=='win32'&&((s.mode&0o077)!==0||s.uid!==process.getuid?.())))throw Error('Invalid private capture directory');
 const read=(file:string,limit:number)=>{const p=join(root,file),st=lstatSync(p);if(st.isSymbolicLink()||!st.isFile()||st.size>limit)throw Error('Unsafe capture file');return readFileSync(p,'utf8');};
 const index=JSON.parse(read('index.json',16384)) as {schemaVersion:unknown;files:unknown;skipped:unknown;errors:unknown};
 if(index.schemaVersion!==1||!Array.isArray(index.files)||index.files.length>FAILURE_FILES||!Number.isSafeInteger(index.skipped)||Number(index.skipped)<0||!Number.isSafeInteger(index.errors)||Number(index.errors)<0)throw Error('Invalid capture manifest');let bytes=0;
 const failures=index.files.map((entry:unknown)=>{if(!entry||typeof entry!=='object')throw Error('Invalid capture entry');const v=entry as Record<string,unknown>;if(typeof v.file!=='string'||!/^failure-\d{4}\.json$/.test(v.file)||typeof v.sha256!=='string')throw Error('Invalid capture identity');const text=read(v.file,FAILURE_FILE_BYTES);bytes+=Buffer.byteLength(text);if(bytes>FAILURE_TOTAL_BYTES-16384||digest(text)!==v.sha256)throw Error('Capture integrity mismatch');const capture=JSON.parse(text) as Record<string,unknown>;if(capture.schemaVersion!==1||typeof capture.response!=='string'||typeof capture.responseHash!=='string'||typeof capture.truncated!=='boolean')throw Error('Invalid failure capture');if(!capture.truncated&&digest(JSON.stringify(capture.response))!==capture.responseHash)throw Error('Captured response hash mismatch');if(report){const r=report.results.find(r=>r.id===capture.caseId&&r.iteration===capture.iteration);if(capture.reportId!==report.id||!r||r.status==='passed'||r.responseHash!==capture.responseHash||r.fixtureHash!==capture.fixtureHash)throw Error('Capture does not match report');}return capture;});
 if(readdirSync(root).length>FAILURE_FILES+1)throw Error('Unexpected capture directory entries');
 return {schemaVersion:1,private:true,untrusted:true,skipped:index.skipped,errors:index.errors,failures};
}
