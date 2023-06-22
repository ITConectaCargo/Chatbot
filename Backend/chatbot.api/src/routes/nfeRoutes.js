import express from 'express'
import nfeController from '../controllers/nfeController.js'

const router = express.Router()

router
    .put("/nfe/:id", nfeController.atualizaNfById)

export default router