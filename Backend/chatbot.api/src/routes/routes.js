import express from "express";
import whatsapp from "./whatsappRoutes.js"
import contato from "./contatoRoutes.js"
import fila from "./filaRoutes.js"
import usuario from "./usuarioRoutes.js"
import coleta from "./coletaRoutes.js"

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send({titulo: "Pagina Home"})
    })

    app.use(
        express.json(),
        whatsapp,
        contato,
        fila,
        usuario,
        coleta
    )
}

export default routes