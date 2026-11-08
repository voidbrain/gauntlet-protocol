import {writeFileSync} from 'node:fs';
import {run,validateRegistry,defaults} from '../../dist/index.js';
const [runner,pidFile,output]=process.argv.slice(2);
const registry=validateRegistry({schemaVersion:1,runners:{sleeper:{command:'node',args:[runner,pidFile],cwd:'.',layers:['system'],allowModels:false}}},process.cwd());
const pack={schemaVersion:1,id:'cancel',version:'1.0.0',cases:['active','later'].map(id=>({id,layer:'system',split:'regression',capabilities:['fixture'],critical:true,expensive:false,runner:'sleeper'}))};
const report=await run(pack,null,{...defaults,caseMs:10000},{execute:true,registry});
writeFileSync(output,JSON.stringify(report));
