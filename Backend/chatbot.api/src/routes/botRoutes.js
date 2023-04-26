import express from "express"
import botController from "../controllers/botController.js"

const router = express.Router()

router
    .get("/bot", botController.listaMensagens)
    .post("/bot", botController.criaMensagens)

export default router