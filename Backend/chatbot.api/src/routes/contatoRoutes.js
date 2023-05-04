import express from "express"
import contatoController from "../controllers/contatoController.js"

const router = express.Router()

router
    .get("/contato", contatoController.consultaContato)
    .get("/contato/:telefone", contatoController.consultaContatoById)
    .post("/contato", contatoController.criarContato)

export default router