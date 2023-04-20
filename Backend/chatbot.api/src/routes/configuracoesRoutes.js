import  express  from "express"
import configuracoesController from "../controllers/configuracoesController.js"

const router = express.Router()

router
    .get("/configuracoes", configuracoesController.ajustes)

export default router