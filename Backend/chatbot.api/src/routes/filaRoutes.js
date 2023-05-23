import express from "express"
import filaController from "../controllers/filaController.js"

const router = express.Router()

router
    .get("/fila", filaController.consutaFila)
    .get("/fila/:status", filaController.consutaByStatus)
    .post("/fila/", filaController.consutaByEspera)
    .put("/fila/", filaController.alteraStatus)


export default router