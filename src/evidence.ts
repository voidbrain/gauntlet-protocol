import {engineIdentity} from './engine.ts';
import {readdirSync,existsSync,mkdirSync,lstatSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {arch,platform,hostname,totalmem,cpus,homedir} from 'node:os';
import {hash,run,validatePack,validateProfile,validateLimits,evidenceProfile,evidenceDestination,readJSON,writeEvidence,validateReport,type Pack,type Profile,type Limits,type Registry,type Report} from './index.ts';
import {inspectRuntime,boundedJSON,type RuntimeIdentity} from './runtimes.ts';
import {serverProcess} from './telemetry.ts';
export interface EvidenceOptions {
 execute:boolean;allowModels?:boolean;allowExpensive?:boolean;registry?:Registry;fetch?:typeof fetch;telemetry?:boolean;sampleMs?:number;
 output:string;cacheDirectory:string;maxAgeMs?:number;forceFresh?:boolean;sourceKey?:string;
 /** Trusted owner-supplied environment attestation; primarily for controlled adapters and fixtures. */
 environmentKey?:string;
}
export interface EvidenceResult {kind:'executed'|'reused';report:Report;reportHash:string;evidenceFile:string;reason:string;performanceMeasuredNow:boolean}
export function reuseValid(report:Report,expected:{pack:Pack;profile:Profile|null;limits:Limits;registry?:Registry;identity?:RuntimeIdentity},maxAgeMs:number,now=Date.now()):boolean {
 try{validateReport(report);}catch{return false;}
 const age=now-Date.parse(report.finished);
 const cases=new Map(expected.pack.cases.map(c=>[c.id,c]));
 const manifestMatches=report.caseCount===expected.pack.cases.length&&report.results.length===expected.pack.cases.length*expected.limits.repeat&&report.results.every(r=>{const c=cases.get(r.id);return !!c&&r.layer===c.layer&&r.split===c.split&&r.critical===c.critical&&hash(r.capabilities)===hash(c.capabilities)&&r.iteration>=1&&r.iteration<=expected.limits.repeat&&(!c.messages||r.fixtureHash===hash(c.messages));});
 return manifestMatches&&report.engineHash===engineIdentity()&&report.protocolVersion==='0.2.0'&&report.passed&&report.complete&&report.sourceStable&&report.usage.outputTokens!==null&&age>=0&&age<=maxAgeMs&&report.packHash===hash(expected.pack)&&report.profileHash===(expected.profile?hash(evidenceProfile(expected.profile)):null)&&hash(report.limits)===hash(expected.limits)&&report.registryHash===(expected.registry?hash(expected.registry):null)&&(!expected.profile||!!expected.identity&&hash(report.identity)===hash(expected.identity));
}
export async function executeWithEvidence(pack:Pack,profile:Profile|null,limits:Limits,options:EvidenceOptions):Promise<EvidenceResult>{
 validatePack(pack);if(profile)validateProfile(profile);validateLimits(limits);
 if(!options.execute)throw Error('Execution must be explicit');
 const output=evidenceDestination(options.output);
 const maxAge=options.maxAgeMs??7*86400000;if(!Number.isSafeInteger(maxAge)||maxAge<0||maxAge>30*86400000)throw Error('Evidence age must be 0–30 days');
 const hasRunner=pack.cases.some(c=>!!c.runner);if(hasRunner&&(!options.sourceKey||!/^[a-f0-9]{64}$/.test(options.sourceKey)))throw Error('System/agent runner reuse requires a current source fingerprint');
 let identity:RuntimeIdentity|undefined;
 if(profile){const request=async(path:string,body?:unknown)=>boundedJSON(await (options.fetch??fetch)(new URL(path,profile.endpoint),{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(5000)}),limits.maxBytes);identity=await inspectRuntime(profile,request);}
 const server=profile?serverProcess(new URL(profile.endpoint).port||'80'):null;
 const environment=options.environmentKey??(!profile||server?hash({host:hostname(),platform:platform(),arch:arch(),memory:totalmem(),cpu:cpus()[0]?.model??'unknown',server,node:process.version}):null);
 const key=hash({engineHash:engineIdentity(),protocol:'0.2.0',grader:'exact-v1',pack,profile,limits,registry:options.registry??null,source:options.sourceKey??null,identity:identity??null,environment,telemetry:options.telemetry??false,sampleMs:options.sampleMs??500});
 const directory=resolve(options.cacheDirectory);
 if(directory.split(/[\\/]/).includes('.git'))throw Error('Git metadata cannot be an evidence cache');
 if(existsSync(directory)){const stat=lstatSync(directory);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Invalid evidence cache directory');if(process.platform!=='win32'&&((stat.mode&0o077)!==0||stat.uid!==process.getuid?.()))throw Error('Evidence cache must be private and owned by the current user');}
 if(!options.forceFresh&&environment&&existsSync(directory)){
  const files=readdirSync(directory).filter(n=>/^evidence-[a-f0-9-]+\.json$/.test(n)).sort().reverse().slice(0,200);
  for(const file of files)try{
   const raw=readJSON(join(directory,file));if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;const cached=raw as Record<string,unknown>;
   if(Object.keys(cached).some(k=>!['schemaVersion','key','reportHash','report'].includes(k))||cached.schemaVersion!==1||cached.key!==key||cached.reportHash!==hash(cached.report))continue;
   const report=validateReport(cached.report);if(!reuseValid(report,{pack,profile,limits,registry:options.registry,identity},maxAge))continue;
   // A reference is not a freshly executed report; preserve the original timestamp and timings.
   const result:EvidenceResult={kind:'reused',report,reportHash:hash(report),evidenceFile:join(directory,file),reason:'Exact fresh passing evidence; no generation/test runner executed',performanceMeasuredNow:false};
   writeEvidence(output,{schemaVersion:1,kind:'evidence-reference',reportHash:result.reportHash,evidenceFile:result.evidenceFile,originalFinished:report.finished,performanceMeasuredNow:false,report});return result;
  }catch{/* Malformed, missing, stale or incompatible evidence never authorizes a skip. */}
 }
 const report=await run(pack,profile,limits,options);
 // Preflight identity must survive actual execution before evidence enters the cache.
 const serverAfter=profile?serverProcess(new URL(profile.endpoint).port||'80'):null;
 if(server&&hash(server)!==hash(serverAfter)){report.sourceStable=false;report.passed=false;}
 if(identity&&hash(report.identity)!==hash(identity)){report.sourceStable=false;report.passed=false;}
 writeEvidence(output,report);
 if(report.passed&&report.complete&&environment){mkdirSync(directory,{recursive:true,mode:0o700});writeEvidence(join(directory,'evidence-'+Date.parse(report.finished)+'-'+report.id+'.json'),{schemaVersion:1,key,reportHash:hash(report),report});}
 return {kind:'executed',report,reportHash:hash(report),evidenceFile:output,reason:options.forceFresh?'Explicit fresh run':environment?'No valid matching evidence':'Daemon identity unavailable; automatic reuse disabled',performanceMeasuredNow:!!report.resources};
}

export function readEvidence(path:string):Report {
 const input=readJSON(path);if(input&&typeof input==='object'&&!Array.isArray(input)&&Object.hasOwn(input,'key')){const value=input as Record<string,unknown>;if(Object.keys(value).some(k=>!['schemaVersion','key','reportHash','report'].includes(k))||value.schemaVersion!==1||typeof value.key!=='string'||value.reportHash!==hash(value.report))throw Error('Invalid cached evidence');return validateReport(value.report);}
 if(input&&typeof input==='object'&&!Array.isArray(input)&&(input as Record<string,unknown>).kind==='evidence-reference'){const value=input as Record<string,unknown>;if(value.reportHash!==hash(value.report)||value.performanceMeasuredNow!==false)throw Error('Invalid evidence reference');const report=validateReport(value.report);if(value.originalFinished!==report.finished)throw Error('Reference changes original timestamp');return report;}return validateReport(input);
}

export function defaultEvidenceDirectory():string{return join(homedir(),'.cache','gauntlet-protocol','evidence');}
