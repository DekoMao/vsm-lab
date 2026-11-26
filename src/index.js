import {criarBotao} from './components/botao.js';
import {demo,calculate,validateDocument,svgMap,csvRows,fmt,xml} from './domain/vsm.js';
const $=id=>document.getElementById(id);let state=demo(),loaded=false;
try{const saved=localStorage.getItem('vsm-lab-v1');if(saved){state=validateDocument(JSON.parse(saved));loaded=true;}}catch{}
const active=()=>state[state.active];const val=s=>s.trim()===''?null:Number(s);
const say=t=>$('notice').textContent=t;
function make(tag,attrs={},text){const el=document.createElement(tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;}
function download(name,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=make('a',{href:url,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function valid(all=false){if(all){try{validateDocument(state);}catch(err){say('Corrija os cenários antes de salvar o projeto: '+err.message);return false;}}const c=calculate(active());if(c.errors.length){say('Corrija os campos indicados antes de exportar ou salvar.');return false;}return true;}
function drawOutputs(){
 const s=active(),c=calculate(s);$('errors').replaceChildren();
 if(c.errors.length){const ul=make('ul');c.errors.forEach(e=>ul.append(make('li',{},e)));$('errors').append(ul);$('metrics').replaceChildren();$('map').replaceChildren(make('p',{class:'empty'},'Mapa e cálculos suspensos até corrigir os dados.'));$('diagnostic').textContent='Há dados pendentes.';drawComparison();return;}
 const metrics=[['Takt',fmt(c.takt)+' s/un.','Tempo líquido ÷ demanda'],['Estoque registrado',fmt(c.wip,0)+' un.','Antes dos processos + estoque final'],['Cobertura de estoque',fmt(c.coverage,2)+' dias','Dias equivalentes de demanda'],['Processamento / unidade',fmt(c.pt)+' s',s.lead===null?'Lead time observado: não informado':'Lead time observado: '+fmt(s.lead)+' min']];
 $('metrics').replaceChildren(...metrics.map(([label,v,note])=>{const box=make('div',{class:'metric'});box.append(make('span',{},label),make('strong',{},v),make('span',{},note));return box;}));
 $('map').innerHTML=svgMap(s,state.active==='future');
 $('diagnostic').textContent=c.ctAbove.length?`${c.ctAbove.length} processo(s) com CT acima do takt: ${c.ctAbove.map(i=>s.stages[i].name).join(', ')}. Investigue as condições e as perdas.`:'Nenhum CT informado está acima do takt. Isso não comprova capacidade efetiva.';
 drawComparison();
}
function drawComparison(){
 const box=$('compare');box.replaceChildren();if(!state.future)return;
 box.append(make('h3',{},'Comparação de cenários — hipótese, não resultado obtido'));
 const a=calculate(state.current),b=calculate(state.future);if(a.errors.length||b.errors.length){box.append(make('p',{},'Comparação indisponível: corrija os dados dos dois cenários.'));return;}
 const table=make('table'),head=make('tr');['Medida','Atual','Futuro proposto'].forEach(v=>head.append(make('th',{},v)));table.append(head);
 for(const [label,va,vb]of [['Takt (s/un.)',a.takt,b.takt],['Estoque (un.)',a.wip,b.wip],['Cobertura (dias de demanda)',a.coverage,b.coverage],['Processamento (s/un.)',a.pt,b.pt]]){const r=make('tr');[label,fmt(va,2),fmt(vb,2)].forEach(v=>r.append(make('td',{},v)));table.append(r);}box.append(table,make('p',{class:'hint'},'A ferramenta não calcula ganho percentual, economia, capacidade ou redução comprovada de lead time. Compare a mesma família, fronteira e período.'));
}
function controlOptions(){const s=active();$('control').replaceChildren(make('option',{value:'all'},'Todos os processos'));s.stages.forEach((p,i)=>$('control').append(make('option',{value:i},p.name)));$('control').value=s.control;}
function drawStages(){
 $('stages').replaceChildren();active().stages.forEach((p,i)=>{
  const card=make('div',{class:'process'}),top=make('div',{class:'process-top'}),name=make('label',{},'Processo '+(i+1)),inp=make('input',{value:p.name,maxlength:'36','aria-label':`Nome do processo ${i+1}`});name.append(inp);top.append(name);
  inp.addEventListener('input',()=>{p.name=inp.value;controlOptions();drawOutputs();});
  const tools=make('div',{class:'rowtools'});
  for(const [txt,delta]of [['Antes',-1],['Depois',1],['Remover',0]]){const b=criarBotao(txt,{ariaLabel:`${txt} processo ${i+1}`});b.disabled=delta===0?active().stages.length<=2:(i+delta<0||i+delta>=active().stages.length);b.onclick=()=>{const s=active();if(delta===0){s.stages.splice(i,1);}else{[s.stages[i],s.stages[i+delta]]=[s.stages[i+delta],s.stages[i]];}s.control='all';drawAll();};tools.append(b);}top.append(tools);card.append(top);
  const grid=make('div',{class:'process-grid'});
  const fields=[['ct','CT (s/un.)','number'],['pt','PT (s/un.)','number'],['setup','Setup (min)','number'],['availability','Disponibilidade (%)','number'],['wip','Estoque anterior (un.)','number'],['source','Origem dos dados','select'],['evidence','Referência da coleta / evidência','text'],['action','Hipótese / ação a verificar','textarea']];
  for(const [key,label,type]of fields){const wrap=make('label',{class:['evidence','action'].includes(key)?'full':''},label);let el;
   if(type==='select'){el=make('select');['Simulado','Coletado','Estimado'].forEach(v=>el.append(make('option',{value:v},v)));el.value=p[key];}
   else if(type==='textarea'){el=make('textarea',{rows:'2',maxlength:'500'});el.value=p[key];}
   else{el=make('input',{type,value:p[key]??'',...(type==='number'?{min:'0',step:key==='wip'?'1':'any'}:{maxlength:'180'})});}
   el.setAttribute('aria-label',label+' — processo '+(i+1));el.addEventListener('input',()=>{p[key]=type==='number'?val(el.value):el.value;drawOutputs();});wrap.append(el);grid.append(wrap);
  }card.append(grid);$('stages').append(card);
 });
}
function drawAll(){
 const s=active();for(const id of ['family','minutes','demand','finished','lead','note'])$(id).value=s[id]??'';
 for(const k of ['current','future']){$(k).classList.toggle('selected',state.active===k);$(k).setAttribute('aria-pressed',String(state.active===k));}
 $('mapname').textContent=state.active==='future'?'Mapa do futuro proposto':'Mapa do estado atual';controlOptions();drawStages();drawOutputs();$('add').disabled=s.stages.length>=8;
}
for(const id of ['family','minutes','demand','finished','lead','note'])$(id).addEventListener('input',()=>{active()[id]=['family','note'].includes(id)?$(id).value:val($(id).value);drawOutputs();});
$('control').onchange=()=>{active().control=$('control').value==='all'?'all':Number($('control').value);drawOutputs();};
$('current').onclick=()=>{state.active='current';drawAll();say('Estado atual. A origem de cada dado permanece identificada.');};
$('future').onclick=()=>{if(!state.future){if(!valid())return;state.future=JSON.parse(JSON.stringify(state.current));state.future.note='HIPÓTESE DE ESTADO FUTURO. '+state.future.note;say('Cópia do atual criada. Altere as hipóteses e registre as ações necessárias; nenhum ganho foi realizado.');}else say('Estado futuro proposto. Dados e resultados representam hipóteses.');state.active='future';drawAll();};
$('demo').onclick=()=>{if(!confirm('Substituir o projeto aberto pelo exemplo simulado? Exporte seu projeto antes se precisar guardá-lo.'))return;state=demo();drawAll();say('Exemplo simulado carregado. O projeto salvo no navegador não foi alterado.');};
$('add').onclick=()=>{if(active().stages.length>=8)return;active().stages.push({name:'Novo processo',ct:null,pt:null,setup:0,availability:100,wip:0,source:'Estimado',evidence:'',action:''});drawAll();};
$('save').onclick=()=>{if(!valid(true))return;try{localStorage.setItem('vsm-lab-v1',JSON.stringify(state));say('Projeto salvo neste navegador. Exporte JSON para ter uma cópia independente.');}catch{say('Não foi possível salvar neste navegador. Use Exportar projeto JSON.');}};
$('json').onclick=()=>{if(valid(true)){download('Projeto_VSM_Lab.json',JSON.stringify(state,null,2),'application/json');say('Projeto JSON exportado.');}};
$('svg').onclick=()=>{if(valid()){download(`Mapa_VSM_${state.active==='future'?'Futuro_Proposto':'Atual'}.svg`,svgMap(active(),state.active==='future'),'image/svg+xml');say('Mapa SVG exportado.');}};
$('csv').onclick=()=>{if(valid()){download('Processos_VSM.csv',csvRows(active()),'text/csv;charset=utf-8');say('CSV de processos exportado. Use o JSON para preservar todo o projeto.');}};
$('print').onclick=()=>{if(valid())window.print();};
$('import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw Error('Arquivo maior que 100 KB.');const d=validateDocument(JSON.parse(await f.text()));state=d;drawAll();say('Projeto importado. A cópia salva no navegador não foi alterada.');}catch(err){say('Importação recusada: '+err.message);}finally{e.target.value='';}};
drawAll();
if(loaded)say('Projeto recuperado deste navegador. Confira a origem e as premissas de cada cenário.');
