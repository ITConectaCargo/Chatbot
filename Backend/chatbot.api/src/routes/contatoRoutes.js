import express from "express"
import contatoController from "../controllers/contatoController.js"
import autenticacao from '../middleware/atenticacao.js'

const router = express.Router()

router
    .get("/contato", contatoController.consultaContato)
    .get("/contato/:telefone", autenticacao, contatoController.consultaContatoByTelefone)
    .post("/contato", contatoController.criarContato)
    .put("/contato", contatoController.atualizaContato)

export default router