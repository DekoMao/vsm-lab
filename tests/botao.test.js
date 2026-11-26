import {test} from 'node:test';
import assert from 'node:assert/strict';
import {criarBotao} from '../src/components/botao.js';
function documento(){return {createElement(tag){return {tagName:tag,attributes:{},events:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.events[k]=v;}};}};}
test('botão oferece rótulo, tipo seguro e ação acessível',()=>{
 let called=0;const b=criarBotao('Exportar',{ariaLabel:'Exportar mapa SVG',onClick:()=>called++},documento());
 assert.equal(b.type,'button');assert.equal(b.attributes['aria-label'],'Exportar mapa SVG');b.events.click();assert.equal(called,1);
});
test('texto do usuário não é interpretado como HTML e estado desabilitado é mantido',()=>{
 const b=criarBotao('<img src=x>',{disabled:true},documento());assert.equal(b.textContent,'<img src=x>');assert.equal(b.disabled,true);
});
test('rótulo vazio é recusado',()=>assert.throws(()=>criarBotao(' ',{},documento()),TypeError));
