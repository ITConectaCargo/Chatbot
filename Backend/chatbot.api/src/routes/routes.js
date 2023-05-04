import express from "express";
import whatsapp from "./whatsappRoutes.js"
import contato from "./contatoRoutes.js"

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send({titulo: "Pagina Home"})
    })

    app.use(
        express.json(),
        whatsapp,
        contato
    )
}

export default routes