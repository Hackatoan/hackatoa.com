/* Volcano Protocol — vault helper. AES-256-GCM, PBKDF2-SHA256. The ciphertext is public; only the phrase opens it. */
window.VP={open:async function(pass,blob){
  var raw=Uint8Array.from(atob(blob),function(c){return c.charCodeAt(0);});
  var km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  var k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:raw.slice(0,16),iterations:600000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:raw.slice(16,28)},k,raw.slice(28)));
},norm:function(s){return String(s||'').replace(/[^a-z]/gi,'').toUpperCase();},
sha:async function(s){var h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');}};
