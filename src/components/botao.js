/** Cria um botão com nome acessível e texto seguro, sem interpretar HTML. */
export function criarBotao(rotulo,{onClick,disabled=false,ariaLabel}={},doc=globalThis.document){
 if(typeof rotulo!=='string'||!rotulo.trim())throw new TypeError('Rótulo obrigatório.');
 const button=doc.createElement('button');
 button.type='button';button.textContent=rotulo;button.disabled=Boolean(disabled);
 if(ariaLabel)button.setAttribute('aria-label',ariaLabel);
 if(onClick)button.addEventListener('click',onClick);
 return button;
}
