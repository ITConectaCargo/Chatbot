import express from "express"
import bodyParser from "body-parser";
import routes from "./routes/routes.js"

const app = express();  //instância do express
app.use(bodyParser.json()) //interpretação em json
routes(app);            //chamando a rota

export default app