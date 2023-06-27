import express from "express"
import whatsappController from "../controllers/whatsappController.js"

const router = express.Router()

router
    .get("/whatsapp", whatsappController.validacao)
    .get("/whatsapp/:telefone", whatsappController.listaMensagensByTelefone)
    .get("/whatsapp/protocolo/:protocolo", whatsappController.listaMensagensByProtocolo)
    .post("/whatsapp", whatsappController.recebeMensagem)
    .post("/whatsapp/mensagem", whatsappController.preparaMensagem)
    .post("/whatsapp/mensagem/ativo/:tel", whatsappController.enviaMensagemAtivo)


export default router