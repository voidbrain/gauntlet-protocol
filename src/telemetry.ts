import {execFileSync,execFile} from 'node:child_process';
import {totalmem,freemem,loadavg,platform} from 'node:os';
export interface ResourceSample {
 elapsedMs:number;systemFreeBytes:number;systemLoad1:number;
 processRssBytes:number|null;processCpuPercent:number|null;
 gpuDevicePercent:number|null;gpuDeviceMemoryBytes:number|null;modelAllocatedBytes:number|null;
}
export interface Resources {
 intervalMs:number;samples:ResourceSample[];sampleErrors:number;samplingTimeMs:number;
 peakProcessRssBytes:number|null;peakGpuDevicePercent:number|null;peakGpuDeviceMemoryBytes:number|null;peakModelAllocatedBytes:number|null;
 scope:string;gpuSource:string;memoryTotalBytes:number;
}
function command(name:string,args:string[]):string{return execFileSync(name,args,{encoding:'utf8',timeout:800,maxBuffer:1024*1024,stdio:['ignore','pipe','ignore']});}
export function serverProcess(port:string):{pid:number;started:string}|null {
 try{const ids=command('lsof',['-nP','-iTCP:'+port,'-sTCP:LISTEN','-t']).trim().split(/\s+/);if(ids.length!==1||!/^\d+$/.test(ids[0]))return null;const pid=Number(ids[0]);const started=command('ps',['-p',String(pid),'-o','lstart=']).trim();return started?{pid,started}:null;}catch{return null;}
}
const asyncCommand=(name:string,args:string[]):Promise<string>=>new Promise((done,fail)=>execFile(name,args,{encoding:"utf8",timeout:250,maxBuffer:1024*1024},(error,stdout)=>error?fail(error):done(stdout)));
export async function hostSample(elapsedMs:number,pid:number|null,modelAllocatedBytes:number|null):Promise<ResourceSample> {
 let processRssBytes:number|null=null,processCpuPercent:number|null=null,gpuDevicePercent:number|null=null,gpuDeviceMemoryBytes:number|null=null;
 if(pid&&platform()!=='win32')try{
  const rows=(await asyncCommand('ps',['-axo','pid=,ppid=,rss=,%cpu='])).trim().split('\n').map(line=>line.trim().split(/\s+/).map(Number));
  const members=new Set([pid]);let changed=true;while(changed){changed=false;for(const row of rows)if(members.has(row[1])&&!members.has(row[0])){members.add(row[0]);changed=true;}}
  const selected=rows.filter(row=>members.has(row[0])&&row.length===4&&row.every(Number.isFinite));
  if(selected.length){processRssBytes=selected.reduce((n,row)=>n+row[2]*1024,0);processCpuPercent=selected.reduce((n,row)=>n+row[3],0);}
 }catch{/* Unsupported host process metadata stays unknown. */}
 if(platform()==='darwin')try{
  const statistics=(await asyncCommand('ioreg',['-r','-c','IOAccelerator','-l'])).split('\n').filter(line=>line.includes('"PerformanceStatistics"'));
  const utilization=statistics.flatMap(line=>[...line.matchAll(/"Device Utilization %"=(\d+)/g)].map(m=>Number(m[1])));
  const allocation=statistics.flatMap(line=>[...line.matchAll(/"In use system memory"=(\d+)/g)].map(m=>Number(m[1])));
  if(utilization.length)gpuDevicePercent=Math.max(...utilization);
  if(allocation.length)gpuDeviceMemoryBytes=allocation.reduce((a,b)=>a+b,0);
 }catch{/* GPU instrumentation is optional and never escalates privileges. */}
 return {elapsedMs,systemFreeBytes:freemem(),systemLoad1:loadavg()[0],processRssBytes,processCpuPercent,gpuDevicePercent,gpuDeviceMemoryBytes,modelAllocatedBytes};
}
export function summarizeResources(samples:ResourceSample[],intervalMs:number,sampleErrors:number,samplingTimeMs:number):Resources {
 const peak=(key:keyof ResourceSample)=>{const values=samples.map(x=>x[key]).filter((x):x is number=>typeof x==='number');return values.length?Math.max(...values):null;};
 return {intervalMs,samples,sampleErrors,samplingTimeMs,peakProcessRssBytes:peak('processRssBytes'),peakGpuDevicePercent:peak('gpuDevicePercent'),peakGpuDeviceMemoryBytes:peak('gpuDeviceMemoryBytes'),peakModelAllocatedBytes:peak('modelAllocatedBytes'),scope:'Sampled peaks, not guaranteed maxima. RSS sums daemon plus descendants and can count shared pages twice; CPU is ps moving-average percent. GPU counters are whole-device and include desktop/other apps. Apple unified-memory allocations overlap RAM and must not be added to it.',gpuSource:platform()==='darwin'?'ioreg IOAccelerator; null when unavailable':'unavailable',memoryTotalBytes:totalmem()};
}
export async function monitorResources(options:{port:string;intervalMs:number;allocation:()=>Promise<number|null>}){
 const start=performance.now(),pid=serverProcess(options.port)?.pid??null,samples:ResourceSample[]=[];let sampleErrors=0,samplingTimeMs=0,active:Promise<void>|null=null;
 const capture=async()=>{if(samples.length>=10000){sampleErrors++;return;}const begin=performance.now();try{const allocation=await options.allocation();samples.push(await hostSample(Math.round(performance.now()-start),pid,allocation));}catch{sampleErrors++;}samplingTimeMs+=performance.now()-begin;};
 await capture();
 const timer=setInterval(()=>{if(!active&&samples.length<10000){active=capture().finally(()=>{active=null;});}},options.intervalMs);timer.unref();
 return {sample:async()=>{if(active)await active;active=capture().finally(()=>{active=null;});await active;},stop:async()=>{clearInterval(timer);if(active)await active;await capture();return summarizeResources(samples,options.intervalMs,sampleErrors,Math.round(samplingTimeMs));}};
}
