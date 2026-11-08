import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,realpathSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {setTimeout as delay} from 'node:timers/promises';
for(const signal of ['SIGTERM','SIGINT'] as const)test(`owner ${signal} kills active runner and leaves later cases unrun`,async()=>{
 const root=mkdtempSync(join(realpathSync(tmpdir()),'gauntlet-cancel-'));const pidFile=join(root,'runner.pid'),output=join(root,'report.json');let runnerPid:number|undefined;
 const host=spawn(process.execPath,['test/fixtures/cancel-host.mjs',resolve('test/fixtures/sleeper.mjs'),pidFile,output],{stdio:'ignore'});
 const closed=new Promise<void>(resolve=>host.once('close',()=>resolve()));
 try{const until=Date.now()+5000;while(!existsSync(pidFile)&&Date.now()<until)await delay(10);assert.equal(existsSync(pidFile),true,'Runner started');runnerPid=Number(readFileSync(pidFile,'utf8'));host.kill(signal);await Promise.race([closed,delay(3000).then(()=>{throw Error('Host failed to stop');})]);let alive=true;try{process.kill(runnerPid,0);}catch{alive=false;}assert.equal(alive,false,'Detached runner must not outlive owner cancellation');const report=JSON.parse(readFileSync(output,'utf8'));assert.equal(report.passed,false);assert.equal(report.results[0].status,'error');assert.equal(report.results[1].status,'not-run');}
 finally{host.kill('SIGKILL');if(runnerPid)try{process.kill(-runnerPid,'SIGKILL');}catch{}rmSync(root,{recursive:true,force:true});}
});
