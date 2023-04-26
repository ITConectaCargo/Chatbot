import express from "express"
import bodyParser from "body-parser";
import routes from "./routes/routes.js"
import db from "./config/dbConfig.js"

db.on("error", console.log.bind(console, 'Erro de conexao'))
db.once("open", () => {
    console.log("conexao com o banco feita com sucesso")
})

const app = express();  //instância do express
app.use(bodyParser.json()) //interpretação em json
routes(app);            //chamando a rota

export default app