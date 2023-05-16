import express from "express"
import usuarioController from "../controllers/usuarioController.js"

const router = express.Router()

router
    .get("/usuario", usuarioController.consultaUsuario)
    .get("/usuario/:id", usuarioController.consultaUsuarioById)
    .post("/usuario/novo", usuarioController.criarUsuario)
    .post("/usuario/autenticacao", usuarioController.autenticaUsuario)
    .put("/usuario", usuarioController.atualizaUsuario)

export default router