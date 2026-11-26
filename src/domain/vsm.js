export const demo=()=>({version:1,active:'current',current:{family:'Módulo de montagem para monitor — SIMULADO',minutes:420,demand:360,lead:null,finished:0,control:'all',note:'Uma família, uma rota sequencial, uma unidade por ciclo e um recurso por processo. Sem paralelismo. Demanda e período comuns. Dados idealizados, não descrevem as fotos de referência.',stages:[['Preparação de kits',40,40,12,98,180],['Montagem',55,55,18,95,90],['Teste funcional',80,80,10,92,360],['Embalagem',35,35,8,97,90]].map(([name,ct,pt,setup,availability,wip],i)=>({name,ct,pt,setup,availability,wip,source:'Simulado',evidence:`SIM-0${i+1}`,action:''}))},future:null});
export const numeric=(v)=>typeof v==='number'&&Number.isFinite(v);
export function validateScenario(s){
 const e=[];if(!s||typeof s!=='object')return ['Cenário ausente.'];
 if(typeof s.family!=='string'||!s.family.trim()||s.family.length>120)e.push('Informe a família, até 120 caracteres.');
 if(!numeric(s.minutes)||s.minutes<=0)e.push('Tempo disponível deve ser maior que zero.');
 if(!numeric(s.demand)||s.demand<=0||!Number.isInteger(s.demand))e.push('Demanda deve ser um inteiro maior que zero.');
 if(s.lead!==null&&(!numeric(s.lead)||s.lead<0))e.push('Lead time observado deve ser vazio ou não negativo.');
 if(!numeric(s.finished)||s.finished<0||!Number.isInteger(s.finished))e.push('Estoque final deve ser um inteiro não negativo.');
 if(!Array.isArray(s.stages)||s.stages.length<2||s.stages.length>8)return [...e,'Use de dois a oito processos.'];
 if(s.control!=='all'&&(!Number.isInteger(s.control)||s.control<0||s.control>=s.stages.length))e.push('Ponto de programação inválido.');
 s.stages.forEach((p,i)=>{
  const label=`Processo ${i+1}: `;
  if(!p||typeof p!=='object'){e.push(label+'dados inválidos.');return;}
  if(typeof p.name!=='string'||!p.name.trim()||p.name.length>36)e.push(label+'nome obrigatório (até 36 caracteres).');
  for(const k of ['ct','pt'])if(!numeric(p[k])||p[k]<=0)e.push(label+'CT e PT devem ser maiores que zero.');
  if(!numeric(p.setup)||p.setup<0)e.push(label+'setup não pode ser negativo.');
  if(!numeric(p.availability)||p.availability<0||p.availability>100)e.push(label+'disponibilidade deve estar entre 0 e 100%.');
  if(!numeric(p.wip)||p.wip<0||!Number.isInteger(p.wip))e.push(label+'estoque anterior deve ser um inteiro não negativo.');
  if(!['Simulado','Coletado','Estimado'].includes(p.source))e.push(label+'origem dos dados inválida.');
  if(typeof p.evidence!=='string'||!p.evidence.trim()||p.evidence.length>180)e.push(label+'informe referência da coleta (até 180 caracteres).');
  if(typeof p.action!=='string'||p.action.length>500)e.push(label+'ação deve ter até 500 caracteres.');
 });
 if(typeof s.note!=='string'||s.note.length>2000)e.push('Premissas devem ter até 2.000 caracteres.');
 return e;
}
export function calculate(s){
 const errors=validateScenario(s);if(errors.length)return {errors};
 const takt=s.minutes*60/s.demand;
 const wip=s.stages.reduce((a,p)=>a+p.wip,s.finished);
 const pt=s.stages.reduce((a,p)=>a+p.pt,0);
 return {errors:[],takt,wip,coverage:wip/s.demand,pt,ctAbove:s.stages.map((p,i)=>p.ct>takt?i:-1).filter(i=>i>=0)};
}
export function validateDocument(d){
 if(!d||d.version!==1||!['current','future'].includes(d.active))throw Error('Arquivo VSM Lab v1 inválido.');
 for(const k of ['current','future'])if(d[k]!==null){const e=validateScenario(d[k]);if(e.length)throw Error(e.join(' '));}
 if(!d.current||d.active==='future'&&!d.future)throw Error('Cenário ativo ausente.');
 return JSON.parse(JSON.stringify({version:1,active:d.active,current:d.current,future:d.future}));
}
export const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const fmt=(v,d=1)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:d}).format(v);
export function svgMap(s,future=false){
 const c=calculate(s);if(c.errors.length)return '';
 const n=s.stages.length,W=360+n*300,last=220+(n-1)*300;
 const text=(x,y,v,size=16,color='#dce7e7',anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" text-anchor="${anchor}">${xml(v)}</text>`;
 const factory=(x,label)=>`<path d="M${x} 275v-40l25-18v18l25-18v18h40v40Z" fill="#233d46" stroke="#95aaa9" stroke-width="2"/>${text(x+45,301,label,15,'#dce7e7','middle')}`;
 let a=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="655" viewBox="0 0 ${W} 655" role="img" aria-label="Mapa VSM ${future?'futuro proposto':'atual'}"><defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#34505a" stroke-opacity=".3"/></pattern><marker id="mat" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#eebd75"/></marker><marker id="info" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#a4cdbb"/></marker></defs><rect width="100%" height="100%" fill="#142b35"/><rect width="100%" height="100%" fill="url(#grid)"/>${text(30,35,future?'ESTADO FUTURO PROPOSTO — HIPÓTESES':'ESTADO ATUAL — DADOS INFORMADOS',20,'#eebd75')}${text(30,63,s.family,17)}${text(30,90,'Fluxo de informação esquemático; ligações de materiais indicam sequência, não um sistema puxado.',15,'#b0c0c5')}`;
 const cx=W/2;
 a+=`<rect x="${cx-100}" y="112" width="200" height="60" rx="5" fill="#29474f" stroke="#a4cdbb"/>${text(cx,137,'PCP / programação',18,'#eff3eb','middle')}${text(cx,159,s.control==='all'?'Instruções aos processos':'Ponto selecionado',14,'#a4cdbb','middle')}<path d="M${W-80} 218V130H${cx+105}" fill="none" stroke="#a4cdbb" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#info)"/>${text(W-250,115,'Demanda: '+fmt(s.demand,0)+' un./dia',15,'#a4cdbb')}`;
 a+=factory(35,'Fornecedor')+factory(W-125,'Cliente');
 s.stages.forEach((p,i)=>{
  const x=220+i*300,before=x-40,prev=i===0?125:x-80;
  if(s.control==='all'||s.control===i)a+=`<path d="M${cx} 172V190H${x+110}V226" fill="none" stroke="#a4cdbb" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#info)"/>`;
  a+=`<path d="M${prev} 260H${x-8}" stroke="#eebd75" stroke-width="3" marker-end="url(#mat)"/>`;
  a+=`<path d="M${before} 283l-18 30h36Z" fill="#eebd75"/>${text(before,307,'I',15,'#142b35','middle')}${text(before,338,fmt(p.wip,0)+' un.',14,'#eebd75','middle')}${text(before,358,fmt(p.wip/s.demand,2)+' d',14,'#a8bec4','middle')}`;
  const label=p.name.length>23?p.name.slice(0,22)+'…':p.name;
  a+=`<g><title>${xml(p.name)}</title><rect x="${x}" y="232" width="220" height="207" rx="4" fill="#203c47" stroke="${p.ct>c.takt?'#eebd75':'#718f96'}" stroke-width="2"/><path d="M${x} 278h220" stroke="#718f96"/>${text(x+12,259,label,16)}${text(x+12,307,'CT  '+fmt(p.ct)+' s/un.',16,p.ct>c.takt?'#ffd48f':'#dce7e7')}${text(x+12,334,'PT  '+fmt(p.pt)+' s/un.',16)}${text(x+12,361,'Setup  '+fmt(p.setup)+' min',16)}${text(x+12,388,'Disponib.  '+fmt(p.availability)+'%',16)}${text(x+12,417,p.source,14,'#a4cdbb')}</g>`;
 });
 a+=`<path d="M${last+220} 260H${W-136}" stroke="#eebd75" stroke-width="3" marker-end="url(#mat)"/>${text(W-170,338,'Final: '+fmt(s.finished,0)+' un.',14,'#eebd75','middle')}`;
 a+=text(30,487,'LINHA DO TEMPO — COBERTURA DE ESTOQUE E PROCESSAMENTO',17,'#eebd75');
 s.stages.forEach((p,i)=>{let x=165+i*300;a+=`<path d="M${x} 520h55v40h220v-40h25" fill="none" stroke="#a4cdbb" stroke-width="2"/>${text(x+5,510,fmt(p.wip/s.demand,2)+' d de cobertura',14,'#eebd75')}${text(x+80,586,fmt(p.pt)+' s de PT',15)}`;});
 a+=text(30,625,'Dias = dias equivalentes de demanda. Cobertura não é espera medida. PT não é automaticamente valor agregado.',15,'#b0c0c5');return a+'</svg>';
}
export function csvRows(s){const esc=v=>{let t=String(v??'');if(/^[=+\-@]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};const rows=[['Processo','CT_s_un','PT_s_un','Setup_min','Disponibilidade_pct','Estoque_anterior_un','Origem','Evidencia','Acao'],...s.stages.map(p=>[p.name,p.ct,p.pt,p.setup,p.availability,p.wip,p.source,p.evidence,p.action])];return '\ufeff'+rows.map(r=>r.map(esc).join(';')).join('\r\n');}
