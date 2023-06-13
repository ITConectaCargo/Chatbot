import express from "express"
import embarcadorController from "../controllers/embarcadorController.js"

const router = express.Router()

router
    .post("/embarcador", embarcadorController.criaEmbarcadorSql)

export default router