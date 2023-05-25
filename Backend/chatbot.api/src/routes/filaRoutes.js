import express from "express"
import filaController from "../controllers/filaController.js"

const router = express.Router()

router
    .get("/fila", filaController.consutaFila)
    .get("/fila/:contato", filaController.consutaByContato)
    .get("/fila/status/:status", filaController.consutaByStatus)
    .post("/fila/", filaController.consutaByEspera)
    .put("/fila/", filaController.alteraFila)


export default router