import express from 'express'
import coletaController from '../controllers/coletasController.js'

const router = express.Router()

router
    .get("/coleta/:telefone", coletaController.consultaByTelefone)
    .get("/coleta/agendamento/:chaveNfe", coletaController.consultaAgendamento)

export default router