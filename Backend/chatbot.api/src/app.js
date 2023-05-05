import express from "express"
import bodyParser from "body-parser"
import routes from "./routes/routes.js"
import db from "./config/dbConfig.js"

db.on("error", console.log.bind(console, 'Erro de conexao'))
db.once("open", () => {
    console.log("conexao com o banco feita com sucesso")
})

const app = express();  //instância do express

//habilita Cors para todas as rotas
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
app.use(bodyParser.json()) //interpretação em json
routes(app);            //chamando a rota

export default app