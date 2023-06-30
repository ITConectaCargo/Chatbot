import express from "express";
import whatsapp from "./whatsappRoutes.js"
import contato from "./contatoRoutes.js"
import fila from "./filaRoutes.js"
import usuario from "./usuarioRoutes.js"
import coleta from "./coletaRoutes.js"
import nfe from "./nfeRoutes.js"
import embarcador from "./embarcadorRoutes.js";
import mensagem from "./mensagemRoutes.js";

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send({titulo: "Pagina Home"})
    })

    app.use(
        express.json(),
        whatsapp,
        contato,
        embarcador,
        usuario,
        fila,
        coleta,
        nfe,
        mensagem,
    )
}

export default routes