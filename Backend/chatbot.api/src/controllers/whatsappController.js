import axios from "axios"
import mensagens from "../models/mensagem.js"
const token = "EAAK36iZBViigBACPyjZAgRg0x9mEzKMGEAz4hAXFhqDL5PUvJrZCNFtHWhk54kqdzhjSeu3ZCSXOKxWx8F0Be5d3JoqHYVKyll6DnwiRQTLqZBwOBq01qijrDnRUfLgdUZCudnqyf99xqfQu5DmCgZBr7cmyozv6TYg1lPyvU9qhYuPSzUJnhnsMYfvA1bAdfGKHoikaXWXcP8viK7Ob3Rb"
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
        let timestamp = body_param.entry[0].changes[0].value.messages[0].timestamp
        let texto = body_param.entry[0].changes[0].value.messages[0].text.body

        console.log(JSON.stringify(body_param, null, 2))
        console.log(`Encontrei o nome: ${nome} e o telefone ${telefone} timestamp ${timestamp} com o seguinte texto ${texto}`)
        this.salvaMensagem(nome, telefone, timestamp, texto)
        this.enviaMensagem(telefone, texto)

        res.sendStatus(200)

        /*
        console.log(JSON.stringify(body_param, null, 2))

        if (body_param.object) {
            if (body_param.entry &&
                body_param.entry[0].changes[0] &&
                body_param.entry[0].changes[0].value.message &&
                body_param.entry[0].changes[0].value.message[0]
            ) {
                let phoneNumberID = body_param.entry[0].changes[0].value.metadata.phone_number_id
                let from = body_param.entry[0].changes[0].value.messages[0].from
                let msgBody = body_param.entry[0].changes[0].value.messages[0].text.body

                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v13.0/" + phoneNumberID + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: "Hi... I'm Wesley"
                        }
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                res.sendStatus(200)
            }
            else {
                res.sendStatus(404)
            }
        }
        */
    }

    static listaMensagensByTelefone = async (req, res) =>{
        const numero = req.params.numero;
        try {
            const mensagem = await mensagens.find({ from: numero });
            res.status(200).json(mensagem);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async salvaMensagem(name, from, timestamp, text) {

        const mensagem = new mensagens({
            name,
            from,
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