import axios from "axios"
import Mensagem from "../models/mensagem.js"
import Fila from "./filaController.js"
const token = "EAAK36iZBViigBABdhynNeLXn3F3WRCY7SqnyQnU5nbuHTwmWpoRrZA5DleCqqgBdDjPZCziKYY5if4InfCwo1apYZAmC0pBg26cDDnr12xwtvrXZCt8i0v0gypu91qMpAYVkkeHTZCHb32n9E3PRsmtnOq2yotIIrxWwtoPjOK0MIw4ZBOZBxwvsuwkXW1rqiXFZA7SGqMCAiNbpe1itdjkE1"
const mytoken = "ConectaCargo"

class whatsapp {

    static validacao = (req, res) => {
        let mode = req.query["hub.mode"]
        let challenge = req.query["hub.challenge"]
        let token = req.query["hub.verify_token"]

        if (mode && token) {
            if (mode === "subscribe" && token === mytoken) {
                res.status(200).send(challenge)
            }
            else {
                res.status(403)
            }
        }
    }

    static recebeMensagem = (req, res) => {
        let body_param = req.body
        let nome = body_param.entry[0].changes[0].value.contacts[0].profile.name
        let telefone = body_param.entry[0].changes[0].value.messages[0].from
        let telefoneId = body_param.entry[0].changes[0].value.metadata.phone_number_id
        let timestamp = body_param.entry[0].changes[0].value.messages[0].timestamp
        let texto = body_param.entry[0].changes[0].value.messages[0].text.body

        console.log(JSON.stringify(body_param, null, 2))
        console.log(`Encontrei nome: ${nome} e o telefone ${telefone} id ${telefoneId} timestamp ${timestamp} com o seguinte texto ${texto}`)
        this.salvaMensagem(nome, telefone, telefoneId, timestamp, texto)
        Fila.verificaAtendimento(telefone, timestamp)
        //this.enviaMensagem(telefone, texto)

        res.sendStatus(200)
    }

    static listaMensagensByTelefone = async (req, res) =>{
        const telefone = req.params.telefone;
        try {
            const mensagem = await Mensagens.find({ from: telefone });
            res.status(200).json(mensagem);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async salvaMensagem(name, from, phoneId, timestamp, text) {
        const mensagem = new Mensagem({
            name,
            from,
            phoneId,
            timestamp,
            text
        });

        try {
            const newMensagem = await mensagem.save();
            return newMensagem
        } catch (err) {
            return console.log(err)
        }
    }

    static enviaMensagem(para, texto) {
        axios({
            method: "POST",
            url: "https://graph.facebook.com/v16.0/105378582538953/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                to: para,
                text: {
                    body: texto
                }
            },
            headers: {
                "Authorization": "Bearer",
                "Content-Type": "application/json"
            }
        })
    }
}

export default whatsapp