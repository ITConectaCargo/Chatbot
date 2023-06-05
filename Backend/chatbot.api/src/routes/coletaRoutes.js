import express from 'express'
import coletaController from '../controllers/coletasController.js'

const router = express.Router()

router
    .get("/coleta/:cpfCnpj", coletaController.consultaByCpfCnpj)
    .get("/coleta/agendamento/:chaveNfe", coletaController.consultaAgendamento)

export default router