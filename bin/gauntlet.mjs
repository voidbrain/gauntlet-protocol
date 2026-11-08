#!/usr/bin/env node
import {resolve,dirname} from 'node:path';
import {readJSON,validatePack,validateProfile,validateRegistry,validateLimits,defaults,plan,run,writeEvidence,compare,exportProfile} from '../dist/index.js';
const [command,...args]=process.argv.slice(2),options={};
try{
 const allowed={validate:['pack','profile','registry'],plan:['pack','profile','registry','limits','allow-models','allow-expensive'],run:['pack','profile','registry','limits','out','execute','allow-models','allow-expensive'],compare:['reports'],qualify:['report','review','requirements','out']};if(!allowed[command])throw Error('Use validate, plan, run, compare or qualify');
 for(const arg of args){const m=/^--([a-z-]+)(?:=(.+))?$/.exec(arg);if(!m||!allowed[command].includes(m[1])||Object.hasOwn(options,m[1]))throw Error('Unknown or duplicate argument');const boolean=['execute','allow-models','allow-expensive'].includes(m[1]);if(boolean===!!m[2])throw Error('Invalid argument value');options[m[1]]=boolean?true:m[2];}
 const load=k=>{if(typeof options[k]!=='string')throw Error('Missing --'+k);return readJSON(resolve(options[k]));};
 if(command==='compare'){const result=compare(String(options.reports??'').split(',').filter(Boolean).map(p=>readJSON(resolve(p))));if(!result.length)throw Error('Reports required');console.log(JSON.stringify(result,null,2));}
 else if(command==='qualify'){writeEvidence(options.out,exportProfile(load('report'),load('review'),load('requirements')));console.log('Reviewed profile evidence exported; production permissions unchanged.');}
 else {const pack=validatePack(load('pack')),profile=options.profile?validateProfile(load('profile')):null,registry=options.registry?validateRegistry(load('registry'),dirname(resolve(options.registry))):undefined,limits=options.limits?validateLimits(load('limits')):defaults,flags={allowModels:!!options['allow-models'],allowExpensive:!!options['allow-expensive']};
  if(command==='validate')console.log(JSON.stringify({valid:true,pack:pack.id,cases:pack.cases.length,profile:profile?.id??null}));
  else if(command==='plan')console.log(JSON.stringify(plan(pack,profile,limits,flags),null,2));
  else {if(!options.execute||!options.out)throw Error('Execution and new output path are explicit: --execute --out=file.json');const report=await run(pack,profile,limits,{...flags,execute:true,registry});writeEvidence(options.out,report);console.log(JSON.stringify({id:report.id,passed:report.passed,complete:report.complete,out:options.out}));if(!report.passed)process.exitCode=1;}
 }
}catch(e){console.error(e instanceof Error?e.message:'Gauntlet failed');process.exitCode=1;}
