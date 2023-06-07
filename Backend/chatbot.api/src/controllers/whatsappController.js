import Fila from "./filaController.js"
import Mensagens from "../models/mensagem.js"
import Contatos from "../models/contato.js"
import Filas from "../models/fila.js"
import io from "socket.io-client";
import dotenv from 'dotenv'
import Coleta from "./coletasController.js";
import Mensagem from "./mensagemController.js"
dotenv.config()

const socket = io.connect(process.env.BASEURL);
const mytoken = process.env.MYTOKEN


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
        let body_param = req.body
        //console.log(JSON.stringify(body_param, null, 2))

        //trata mensagem recebida
        //verifica se é uma mensagem normal
        try {
            if (body_param.object) {
                //Texto normal
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
                    res.sendStatus(200) //responde para o whats que recebeu
                }
            }
        } catch (error) {
            //console.log(JSON.stringify(body_param, null, 2))
            res.sendStatus(200)
        }
        //verifica se é um botao
        try {
            //Botao respondido
            if (body_param.entry[0].changes[0].value.messages[0].interactive.button_reply.id) {
                console.log("botao encontrado")
                let name = body_param.entry[0].changes[0].value.contacts[0].profile.name
                let telefone = body_param.entry[0].changes[0].value.messages[0].from
                let phoneId = body_param.entry[0].changes[0].value.metadata.phone_number_id
                let timestamp = body_param.entry[0].changes[0].value.messages[0].timestamp
                let text = body_param.entry[0].changes[0].value.messages[0].interactive.button_reply.id
                let context = body_param.entry[0].changes[0].value.messages[0].context.id
                const mensagem = {
                    phoneId,
                    to: "5511945718427",
                    context,
                    timestamp,
                    text
                }
                console.log(`Cliente respondeu nome: ${name}, telefone: ${telefone}, id: ${phoneId}, timestamp: ${timestamp}, texto: ${text}`)
                this.verificaContato(name, telefone, mensagem)
            }
        } catch (error) {
        }
        //verifica se é um botao
        try {
            //template respondido
            if (body_param.entry[0].changes[0].value.messages[0].button.payload) {
                console.log("botao encontrado")
                let name = body_param.entry[0].changes[0].value.contacts[0].profile.name
                let telefone = body_param.entry[0].changes[0].value.messages[0].from
                let phoneId = body_param.entry[0].changes[0].value.metadata.phone_number_id
                let timestamp = body_param.entry[0].changes[0].value.messages[0].timestamp
                let text = body_param.entry[0].changes[0].value.messages[0].button.text
                const mensagem = {
                    phoneId,
                    to: "5511945718427",
                    timestamp,
                    text
                }
                console.log(`Cliente respondeu nome: ${name}, telefone: ${telefone}, id: ${phoneId}, timestamp: ${timestamp}, texto: ${text}`)
                this.verificaContato(name, telefone, mensagem)
            }
        } catch (error) {
        }
    }

    static async verificaContato(nome, telefone, mensagem) {
        let contato = ""
        let fila = ""
        let novaMensagem = ""
        let dadosSql = ""

        //verifica se telefone esta no BD Mongo
        try {
            contato = await Contatos.findOne({ tel: telefone })
        } catch (error) {
            console.log(error)
        }

        //verifica se telefone esta fila
        try {
            fila = await Filas.findOne({ from: contato._id })
                .sort({ date: -1 }) // Ordena por data em ordem decrescente
                .exec()
        } catch (error) {
            console.log(error)
        }

        if (!fila || fila.status === "finalizado") { //se nao existir fila ou status for finalizado
            console.log("verificando SQL")
            //verifica se telefone esta no BD SQL
            try {
                dadosSql = await Coleta.consultaByTelefone(telefone)
            } catch (error) {
                console.log(error)
            }

            if (dadosSql.length === 0) {
                try {
                    dadosSql = await Coleta.consultaByCpfCnpj(contato.cpfCnpj)
                } catch (error) {
                    console.log(error)
                }
            }

            console.log(`itens em dados ${dadosSql.length}`)

            //se existir dados no Sql
            if (dadosSql.length !== 0) {
                console.log("encontrou dados no SQL")
                let contador = dadosSql.length

                try {
                    contato = await Coleta.verificaMongo(dadosSql[0], telefone) //verifica se existe os dados no mongo
                } catch (error) {
                    console.log(error)
                }

                if (contador > 1) {
                    console.log(`Achei ${contador} Nfs`)
                    dadosSql.forEach(element => {
                        Coleta.verificaMongo(element, telefone)
                    });
                }
            }
            else {
                //adiciona o contato no mongo com os dados do whatsapp
                console.log("nao encontrou nada no BD")
                let newContato = new Contatos({
                    "name": nome,
                    "nameWhatsapp": nome,
                    "tel": telefone,
                })

                contato = await newContato.save()
            }

            if (contato) {
                //Salva a mensagem
                let resposta = await this.salvaMensagem(contato, mensagem)
                novaMensagem = resposta

                Fila.verificaAtendimento(novaMensagem) //Verifica a fila
            }
        }
        else {
            console.log("Esta na fila")
            let resposta = await this.salvaMensagem(contato, mensagem)
            novaMensagem = resposta

            if (novaMensagem == "respostaDuplicada") {
                return "vazio"
            } else {
                Fila.verificaAtendimento(novaMensagem) //Verifica a fila
            }
        }
    }

    static async salvaMensagem(contato, mensagem) {
        console.log("salvando mensagem")
        let room = ''
        let existeContexto = ''
        if (mensagem.to === '5511945718427') {
            room = contato.tel
            try {
                existeContexto = await Mensagens.findOne({ from: contato._id, context: mensagem.context })
                    .sort("date" - 1)
                    .exec()
            } catch (error) {

            }
        }
        else {
            room = mensagem.to
        }

        if (!existeContexto) {
            try {
                const msg = new Mensagens({
                    from: contato._id,
                    to: mensagem.to,
                    room: room,
                    phoneId: mensagem.phoneId,
                    timestamp: mensagem.timestamp * 1000, //transforma timestamp em milisegundos
                    context: mensagem.context,
                    text: mensagem.text
                });
                const novaMensagem = await msg.save();

                if (novaMensagem.to === '5511945718427') {
                    await socket.emit("chat.sala", novaMensagem.to);
                    await socket.emit("chat.mensagem", novaMensagem);
                }

                return novaMensagem
            } catch (error) {
                console.log(error)
            }
        }
        else {
            return "respostaDuplicada"
        }
    }

    static preparaMensagem = async (req, res) => {
        console.log("preparando mensagem")
        try {
            let resposta = await this.salvaMensagem(req.body.from, req.body)
            Mensagem.identificaMensagem(req.body)
            res.status(200).json(resposta)
        } catch (error) {
            res.sendStatus(500)
        }
    }

    static listaMensagensByTelefone = async (req, res) => {
        const telefone = req.params.telefone;
        try {
            const contato = await Contatos.findOne({ tel: telefone })
            const filter = { $or: [{ from: contato._id }, { to: telefone }] };

            const result = await Mensagens.find(filter)
                .populate('from')
                .sort('date')
                .exec();

            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

export default whatsapp