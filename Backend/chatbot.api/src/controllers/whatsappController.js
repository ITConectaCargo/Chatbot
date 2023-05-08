import axios from "axios"
//import Mensagem from "../models/mensagem.js"
import Fila from "./filaController.js"
import Mensagens from "../models/mensagem.js"
const token = "EAAK36iZBViigBADg38d6buI9MIUS3Q8AvUZAjZAZChX2C3ujxpQ2FJGHVESyPy3nQjx6iirnzQH2HodnSX7yk0E4luNhpmaGSWxaDTCcVnOEBI9hDCCoQuqpD8fRO2LelwuHZCekMNnCht2LzaFXIL4IscUaeZB81ybVWller0ZCpGAtYXCZAF8AnxmtqOlsUwCsZBFLOgn77vmi22orKo3lb"
const mytoken = "ConectaCargo"
const baseURL = "http://localhost:9000/"

class whatsapp {

    static validacao = (req, res) => {
        //faz a validação com o Whatsapp api 
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

    static recebeMensagem = async (req, res) => {
        //trata mensagem recebida
        let body_param = req.body

        try {
            if (body_param.object) {
                if (body_param.entry[0].changes[0].value.messages[0].text.body) {
                    let name = body_param.entry[0].changes[0].value.contacts[0].profile.name
                    let telefone = body_param.entry[0].changes[0].value.messages[0].from
                    let phoneId = body_param.entry[0].changes[0].value.metadata.phone_number_id
                    let timestamp = body_param.entry[0].changes[0].value.messages[0].timestamp
                    let text = body_param.entry[0].changes[0].value.messages[0].text.body
                    const mensagem = {
                        phoneId,
                        to: "5511945718427",
                        timestamp,
                        text
                    }
                    console.log(`Encontrei nome: ${name}, telefone: ${telefone}, id: ${phoneId}, timestamp: ${timestamp}, texto: ${text}`)

                    this.verificaContato(name, telefone, mensagem)
                    res.sendStatus(200)
                }
            }
        } catch (error) {
            console.log(JSON.stringify(body_param, null, 2))
            res.status(500)
        }
    }
    // -------------------------------------------------------------------------------------------
    static async verificaContato(nome, telefone, mensagem) {
        let contato = ""
        let novaMensagem = ""

        //verifica se telefone esta no BD
        try {
            let resposta = await axios.get(`${baseURL}contato/${telefone}`)
            contato = resposta.data
            console.log(`Encontrei o contato ${contato.tel}`)
        } catch (error) {
            console.log(error)
        }

        //verifica se contato esta vazio ou nao
        if (contato) {
            console.log(`possui contato`)
            //Salva a mensagem
            let resposta = await this.salvaMensagem(contato, mensagem)
            novaMensagem = resposta
        }
        else {
            console.log(`contato esta vazio`)
            //cria contato no BD
            try {
                let resposta = await axios.post(`${baseURL}contato/`, {
                    nameWhatsapp: nome,
                    tel: telefone
                })
                contato = resposta.data
            } catch (error) {
                console.log(error)
            }
            //Salva a mensagem
            let resposta = await this.salvaMensagem(contato, mensagem)
            novaMensagem = resposta
        }

        Fila.verificaAtendimento(novaMensagem)
    }

    static async salvaMensagem(contato, mensagem) {
        console.log("salvando mensagem")
        try {
            const msg = new Mensagens({
                from: contato._id,
                to: mensagem.to,
                phoneId: mensagem.phoneId,
                timestamp: mensagem.timestamp * 1000, //transforma timestamp em milisegundos
                text: mensagem.text
            });
            const novaMensagem = await msg.save();
            return novaMensagem
        } catch (error) {
            console.log(error)
        }
    }

    static enviaMensagem(mensagem) {
        console.log("enviando mensagem")
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const texto = mensagem.text
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
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
        } catch (error) {
            console.log(error)
        }
    }

    static preparaMensagem = async (req, res) => {
        console.log("preparando mensagem")
        try {
            this.salvaMensagem(req.body.from, req.body)
            this.enviaMensagem(req.body)
            res.sendStatus(200)
        } catch (error) {
            res.sendStatus(500)
        }
    }

    static listaMensagensByTelefone = async (req, res) => {
        const telefone = req.params.telefone;
        try {
            const mensagem = await Mensagens.find({ from: telefone })
                .populate("from")
                .exec();
            res.status(200).json(mensagem);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }


}

export default whatsapp