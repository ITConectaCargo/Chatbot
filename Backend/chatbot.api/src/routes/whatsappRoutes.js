import express from "express"
import whatsappController from "../controllers/whatsappController.js"

const router = express.Router()

router
    .get("/whatsapp", whatsappController.Validacao)
    .post("/whatsapp", whatsappController.Mensagem)


export default router