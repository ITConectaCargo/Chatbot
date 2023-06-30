import express from 'express'
import mensagemController from '../controllers/mensagemController.js'

const router = express.Router()

router
    .get("/mensagem/template/:modelo", mensagemController.buscaMensagemTemplate)

export default router