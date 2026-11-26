import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT deve ser inteiro de 1 a 65535.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.json':'application/json'};
export function resolverCaminho(raw){
 const pathname=decodeURIComponent(new URL(raw,'http://localhost').pathname);
 const resolved=path.resolve(root,'.'+pathname);
 if(resolved!==root&&!resolved.startsWith(root+path.sep))return null;
 return resolved;
}
http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let file=resolverCaminho(req.url);if(!file){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end('Arquivo não encontrado.');}
}).listen(port,'127.0.0.1',()=>console.log(`VSM Lab: http://127.0.0.1:${port}/`));
