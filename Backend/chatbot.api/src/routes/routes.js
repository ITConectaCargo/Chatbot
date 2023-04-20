import express from "express";
import whatsapp from "./whatsappRoutes.js"
import configuracoes from "./configuracoesRoutes.js"

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send({titulo: "Pagina Home"})
    })

    app.use(
        express.json(),
        whatsapp,
        configuracoes
    )
}

export default routes