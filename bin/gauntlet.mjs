#!/usr/bin/env node
import {resolve,dirname,relative} from 'node:path';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {readJSON,readEvidence,validatePack,validateProfile,validateRegistry,validateLimits,defaults,plan,executeWithEvidence,defaultEvidenceDirectory,writeEvidence,compare,exportProfile,catalog,catalogMarkdown} from '../dist/index.js';
const [command,...args]=process.argv.slice(2),options={};
try{
 const allowed={validate:['pack','profile','registry'],index:['packs','reports','out','check'],plan:['pack','profile','registry','limits','allow-models','allow-expensive'],run:['pack','profile','registry','limits','out','execute','allow-models','allow-expensive','telemetry','sample-ms','fresh','cache-dir','max-age-hours','source-key'],compare:['reports'],qualify:['report','review','requirements','out']};
 if(!allowed[command])throw Error('Use validate, index, plan, run, compare or qualify');
 for(const arg of args){const m=/^--([a-z-]+)(?:=(.+))?$/.exec(arg);if(!m||!allowed[command].includes(m[1])||Object.hasOwn(options,m[1]))throw Error('Unknown or duplicate argument');const boolean=['execute','allow-models','allow-expensive','check','fresh','telemetry'].includes(m[1]);if(boolean===!!m[2])throw Error('Invalid argument value');options[m[1]]=boolean?true:m[2];}
 const required=k=>{if(typeof options[k]!=='string')throw Error('Missing --'+k);return options[k];};
 const load=k=>readJSON(resolve(required(k)));
 if(command==='index'){
  const entries=catalog(required('packs').split(',').map(p=>validatePack(readJSON(resolve(p)))),options.reports?options.reports.split(',').map(p=>readEvidence(resolve(p))):[]);
  const sourcePaths=required('packs').split(',');const sources=Object.fromEntries(sourcePaths.map(path=>{const pack=validatePack(readJSON(resolve(path)));return [pack.id,relative(options.out?dirname(resolve(options.out)):process.cwd(),resolve(path)).replaceAll('\\','/')];}));const rendered=catalogMarkdown(entries,sources);if(!options.out)console.log(rendered);else{const out=resolve(options.out);if(!out.endsWith('.md')||out.split(/[\\/]/).includes('.git'))throw Error('Index requires Markdown outside git metadata');if(options.check){if(!existsSync(out)||readFileSync(out,'utf8')!==rendered)throw Error('Generated test index is stale');console.log('Test index current');}else{if(existsSync(out)&&!readFileSync(out,'utf8').startsWith('<!-- Generated from executable packs;'))throw Error('Refusing to overwrite a non-generated file');mkdirSync(dirname(out),{recursive:true});writeFileSync(out,rendered);console.log(JSON.stringify({index:out,cases:entries.length}));}}
 }else if(command==='compare')console.log(JSON.stringify(compare(required('reports').split(',').map(p=>readEvidence(resolve(p)))),null,2));
 else if(command==='qualify'){writeEvidence(required('out'),exportProfile(readEvidence(required('report')),load('review'),load('requirements')));console.log('Reviewed profile evidence exported; production permissions unchanged.');}
 else{
  const pack=validatePack(load('pack')),profile=options.profile?validateProfile(load('profile')):null,registry=options.registry?validateRegistry(load('registry'),dirname(resolve(options.registry))):undefined,limits=options.limits?validateLimits(load('limits')):defaults,flags={allowModels:!!options['allow-models'],allowExpensive:!!options['allow-expensive']};
  if(command==='validate')console.log(JSON.stringify({valid:true,pack:pack.id,cases:pack.cases.length,profile:profile?.id??null}));
  else if(command==='plan')console.log(JSON.stringify(plan(pack,profile,limits,flags),null,2));
  else{
   if(!options.execute)throw Error('Execution is explicit: --execute --out=new.json');
   const result=await executeWithEvidence(pack,profile,limits,{...flags,execute:true,registry,output:required('out'),cacheDirectory:options['cache-dir']??defaultEvidenceDirectory(),maxAgeMs:options['max-age-hours']?Number(options['max-age-hours'])*3600000:undefined,forceFresh:!!options.fresh,sourceKey:options['source-key'],telemetry:!!options.telemetry,sampleMs:options['sample-ms']?Number(options['sample-ms']):undefined});
   console.log(JSON.stringify({id:result.report.id,kind:result.kind,passed:result.report.passed,complete:result.report.complete,out:options.out,reason:result.reason,performanceMeasuredNow:result.performanceMeasuredNow}));if(!result.report.passed)process.exitCode=1;
  }
 }
}catch(error){console.error(error instanceof Error?error.message:'Gauntlet failed');process.exitCode=1;}
