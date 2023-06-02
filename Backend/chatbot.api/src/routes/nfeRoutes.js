import express from 'express'
import nfeController from '../controllers/nfeController.js'

const router = express.Router()

router
    .get("/nfe", nfeController.consultaNfe)
    .put("/nfe/:id", nfeController.atualizaNfById)

export default router