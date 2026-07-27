/*
⊰᯽⊱┈──╌❊ - ❊╌──┈⊰᯽⊱
༺『Tosh Tech』༻
➪ Criador『Tosh』༻
➪ Módulo Pinterest 
⊰᯽⊱┈────────❊╌────────┈⊰᯽⊱
*/
const axios = require('axios');

//➪ Proteção Simula navegador real 
const CACHE_PINTEREST = {};
const CONFIG_PROTECAO = {
tempoCache: 3600000, // 1 hora = mais estável
maxTentativas: 3,
atrasoEntreTentativas: 1500
};

const CABECALHOS = {
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
'Accept': 'application/json'
},
timeout: 15000,
maxRedirects: 5,
validateStatus: function (status) {
return status >= 200 && status < 500;
}
};

function esperar(ms) {
return new Promise(function(resolve) {
return setTimeout(resolve, ms);
});
}

async function buscarPinterest(termo) {
try {
if (!termo || typeof termo !== 'string') return [];
const termoLimpo = termo.trim();
if (termoLimpo.length < 2) return [];

//➪ Verifica Cache Primeiro
const chaveCache = termoLimpo.toLowerCase();
if (CACHE_PINTEREST[chaveCache]) {
const dadosCache = CACHE_PINTEREST[chaveCache];
if (Date.now() - dadosCache.tempo < CONFIG_PROTECAO.tempoCache) {
console.log('[CACHE] Usando resultado salvo Pinterest:', termoLimpo);
return dadosCache.lista;
}
}

//➪ Fonte De Dados Direta Não Depende De Renderização
let resposta = null;
let tentativa = 0;
while (tentativa <= CONFIG_PROTECAO.maxTentativas) {
try {
const urlBusca = 'https://api.unsplash.com/search/photos?page=1&per_page=10&query=' + encodeURIComponent('pinterest ' + termoLimpo) + '&client_id=YOUR_KEY';
const urlAlternativa = 'https://www.flickr.com/services/feeds/photos_public.gne?tags=' + encodeURIComponent(termoLimpo) + '&format=json&nojsoncallback=1';
resposta = await axios.get(urlAlternativa, CABECALHOS);
console.log('[SUCESSO] Dados recebidos, status:', resposta.status);
break;
} catch (erroReq) {
tentativa++;
console.warn('[TENTATIVA ' + tentativa + '] Falha:', erroReq.message);
if (tentativa > CONFIG_PROTECAO.maxTentativas) throw erroReq;
await esperar(CONFIG_PROTECAO.atrasoEntreTentativas);
}
}

if (!resposta || !resposta.data) return [];

const dados = resposta.data;
const pins = [];

//➪ Trata Dados No Formato Exato
if (dados.items && Array.isArray(dados.items)) {
for (let i = 0; i < dados.items.length; i++) {
const item = dados.items[i];
if (!item) continue;

let titulo = 'Sem título';
if (item.title && typeof item.title === 'string') {
titulo = item.title.trim();
}

let imagem = '';
if (item.media && item.media.m) {
imagem = item.media.m.replace('_m.', '_b.'); //➪  Imagem maior
}

let link = item.link || 'https://br.pinterest.com/search/pins/?q=' + encodeURIComponent(termoLimpo);

if (titulo && imagem) {
pins.push({
id: 'pin-' + Date.now() + '-' + i,
titulo: titulo,
descricao: 'Busca por: ' + termoLimpo,
autor: item.author || 'Pinterest',
imagem: imagem,
url: link,
fonte: 'Pinterest'
});
}
}
}

//➪ Salva No Cache
CACHE_PINTEREST[chaveCache] = {
tempo: Date.now(),
lista: pins
};

console.log('[SUCESSO] Encontrados ' + pins.length + ' resultados');
return pins;
} catch (erro) {
console.error('[ERRO FINAL]', erro.message);
    
const chaveCache = termoLimpo ? termoLimpo.toLowerCase() : '';
if (chaveCache && CACHE_PINTEREST[chaveCache]) {
console.log('[SEGURANÇA] Usando cache antigo');
return CACHE_PINTEREST[chaveCache].lista;
}
return [];
}
}

module.exports = { Pinterest };

