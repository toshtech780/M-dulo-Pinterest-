/*
⊰᯽⊱┈──╌❊ - ❊╌──┈⊰᯽⊱
༺『Tosh Tech』༻
➪ Criador『Tosh』༻
⊰᯽⊱┈────────❊╌────────┈⊰᯽⊱
*/
//➪ Força o site a procura em todas partes do seu ambiente sem precisar do padrão statico 
global.Raiz_Tech = process.cwd();



//➪ Caminho para o módulo ajustar para o seu caminho de acordo com seu projeto 
const caminhoPinterest = path.join(Raiz_Tech, 'banco_dados', 'downloads',  'pinterest');
const { Pinterest } = require(caminhoPinterest);


//➪ essa variável buscarUsuarioPorApiKey é do sistema de verificação de usuários modificar pelo padrão do seu site ©Tosh Tech

//➪ Rota Pinterest Por Nome
app.get('/api/download/pinterest', async (req, res) => {
const { apikey, nome } = req.query;
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await buscarUsuarioPorApiKey(apikey);
if (erro) return res.status(403).json({ erro });
if (!nome) return res.status(400).json({ status: false, resultado: 'Cade o parametro nome??' });
try {
const lista = await Pinterest(nome);
res.json({
status: true,
criador: 'tosh',
quantidade: lista.length,
dados: lista
});
} catch (e) {
res.status(500).json({ status: false, erro: 'Falha na busca' });
}
});
