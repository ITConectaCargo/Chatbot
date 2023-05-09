import express from "express"
import filaController from "../controllers/filaController.js"

const router = express.Router()

router
    .get("/fila", filaController.consutaStatus)
    .get("/filaespera", filaController.consutaEspera)
    .put("/fila", filaController.alteraStatus)


export default router