import express from "express"
import routes from "./routes/routes.js"

const app = express();  //instância do express
app.use(express.json()) //interpretação em json
routes(app);            //chamando a rota

export default app