import express from 'express'
import coletaController from '../controllers/coletasController.js'

const router = express.Router()

router
    .get("/coleta/agendamento/:chaveNfe", coletaController.consultaAgendamentoEsl)

export default router