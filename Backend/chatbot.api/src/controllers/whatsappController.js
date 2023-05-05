import axios from "axios"
//import Mensagem from "../models/mensagem.js"
import Fila from "./filaController.js"
import Mensagens from "../models/mensagem.js"
const token = "EAAK36iZBViigBAONZBPE7PZBPtnnTDe9NaPQQJZBRNWBMYXk2EplF0yuIFZBpetfY0ExZCICNlUXcZCYogd98m4NfphnJUjALHZCOCBHD2F5ZBZA3FbH7Q4TiJsBQmMDcFQw8ZCBD1VZBNIeA7GU4I9iir1L9ZCFLlrtjJzqK9CsDuSGrtq6vqDNgSh3TX42Q0ZBp0v664dEbeZCjdeO78F6wlJza0u"
const mytoken = "ConectaCargo"

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
        let nome = body_param.entry[0].changes[0].value.contacts[0].profile.name
        let telefone = body_param.entry[0].changes[0].value.messages[0].from
        let telefoneId = body_param.entry[0].changes[0].value.metadata.phone_number_id
        let timestamp = body_param.entry[0].changes[0].value.messages[0].timestamp
        let texto = body_param.entry[0].changes[0].value.messages[0].text.body
        const mensagem = {
            telefoneId,
            timestamp,
            texto
        }

        //console.log(JSON.stringify(body_param, null, 2))
        console.log(`Encontrei nome: ${nome}, telefone: ${telefone}, id: ${telefoneId}, timestamp: ${timestamp}, texto: ${texto}`)

        this.verificaContato(nome, telefone, mensagem)
        res.sendStatus(200)
    }

    static async verificaContato(nome, telefone, mensagem) {
        let contato = ""
        let novaMensagem = ""

        //verifica se telefone esta no BD
        try {
            let resposta = await axios.get(`http://localhost:9000/contato/${telefone}`)
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
                let resposta = await axios.post(`http://localhost:9000/contato/`, {
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
        console.log(contato)
        try {
            const msg = new Mensagens({
                from: contato._id,
                phoneId: mensagem.telefoneId,
                timestamp: mensagem.timestamp * 1000, //transforma timestamp em milisegundos
                text: mensagem.texto
            });
            const novaMensagem = await msg.save();
            return novaMensagem
        } catch (error) {
            console.log(error)
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

    static enviaMensagem(para, texto) {
        console.log("Enviando Mensagem")
        try {
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
        } catch (error) {
            console.log(error)
        }
    }
}

export default whatsapp