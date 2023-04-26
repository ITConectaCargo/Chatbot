import express from "express"
import botController from "../controllers/botController.js"

const router = express.Router()

router
    .post("/bot", botController.Mensagens)

export default router