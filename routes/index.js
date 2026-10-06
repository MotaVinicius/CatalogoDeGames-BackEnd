const express = require('express')
const mongoose = require('mongoose');
var logger = require('morgan');
var cors = require('cors');
var router = express.Router();

const app = express()

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
const port = process.env.PORT || 3333 ;

mongoose.connect('key_mongodb_connection');

const Game = mongoose.model('Game', {
     name: String,
     description: String,
     image_url: String,
     genero: String,
     ratings: Number,
     lancamento: Number});

app.get('/', async (req,res) => {
    try{
    const games = await Game.find({}).sort({ratings: -1}).limit(16)
    res.status(200).json(games)
    }catch(erro){
        console.log(erro);
        res.status(500).json({message: "Algo de errado aconteceu. Falha ao listar nossa biblioteca de games."})
    }
})

app.get('/full', async (req,res) => {
    try{
    const games = await Game.find({}).sort({name: +1})
    res.status(200).json(games)
    }catch(erro){
        console.log(erro);
        res.status(500).json({message: "Algo de errado aconteceu. Falha ao listar nossa biblioteca de games."})
    }
})

app.get('/lancamento', async (req,res) => {
    try{
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const games = await Game.find({lancamento: { $in: [anoAtual, anoAtual -1]}}).sort({lancamento: -1}).limit(15)
    res.status(200).json(games)
    }catch(erro){
        console.log(erro);
        res.status(500).json({message: "Algo de errado aconteceu. Falha ao listar nossa biblioteca de games."})
    }
})

app.get('/busca', async (req, res) => {
    const { query } = req.query;
  
    try {
      const results = await Game.find({ name: { $regex: query, $options: 'i' } }); // Use regex para buscar parcialmente e case-insensitive
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

app.get('/detalhes/:id', async(req,res) => {
    const id =req.params.id;
    try{
        const registro = await Game.findById(id);
        if (registro) {
            res.status(200).json(registro);
          } else {
            res.status(404).json({ message: "Registro não encontrado" });
          }
    }catch(erro){
        console.log(erro);
        res.status(500).json({message: "erro ao buscar o registro"})
    }
});

app.post('/add', async (req,res) => {
    const game = new Game({
        name: req.body.name,
        description: req.body.description,
        image_url: req.body.image_url,
        genero: req.body.genero,
        ratings: parseInt(req.body.ratings),
        lancamento: parseInt(req.body.lancamento)
    })
    const anoAtual = new Date().getFullYear();
    if(game.name !== undefined && game.name && game.lancamento !== undefined && !isNaN(game.lancamento) && (game.lancamento >= 1972 && game.lancamento <= anoAtual) && (game.ratings >= 0 && game.ratings <= 10)){
        try{
            await game.save()
            res.status(200).json({message: `O Game ${game.name} foi adicionado com sucesso`});
        }catch(erro){
            console.log(erro);
            res.status(500).json({message: `Erro ao adicionar ${game.name}. Tente novamente`})
        }
    }else{
        res.status(400).json({message: "Dados não foram preenchidos corretamente. Verifique e tente novamente"});
    }
    
})

app.put('/editar/:id', async(req, res) => {
    const id = req.params.id;
    const game = await Game.findByIdAndUpdate(id, {
        name: req.body.name,
        description: req.body.description,
        image_url: req.body.image_url,
        genero: req.body.genero,
        ratings: req.body.ratings,
        lancamento: req.body.lancamento
    })
    try{
        if(game)
        res.status(200).json({message: `O jogo ${game.name} foi atualizado com sucesso`})
        else 
        res.status(200).json({message: "Registro não encontrado para edição."});
    }catch(erro){
        console.log(erro);
        res.status(500).json({message: "Erro ao editar registro"})
    }})



app.delete("/remover/:id", async (req, res) => {
    const id = req.params.id
    try{
        const game = await Game.findByIdAndRemove(id)
        if(game)
        res.status(200).json({message: `O Jogo foi removido com sucesso`});
    else 
    res.status(200).json({message: "Registro não encontrado para remoção."});
} catch(erro){
  console.log(erro);
  res.status(500).json({message: "Erro ao remover o registro solicitado."});
}

})

app.listen(port, () => {
    console.log(`App running on port ${port}`)
}) 
//Em desenvolvimento
module.exports = router;
