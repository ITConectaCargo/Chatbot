import express from "express"
import usuarioController from "../controllers/usuarioController.js"
import autenticacao from '../middleware/atenticacao.js'

const router = express.Router()

router
    .get("/usuario", autenticacao, usuarioController.consultaUsuario)
    .get("/usuario/:id", autenticacao, usuarioController.consultaUsuarioById)
    .post("/usuario/novo", usuarioController.criarUsuario)
    .post("/usuario/autenticacao", usuarioController.autenticaUsuario)

export default router