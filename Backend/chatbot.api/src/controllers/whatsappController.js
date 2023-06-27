import Fila from "./filaController.js"
import Mensagens from "../models/mensagem.js"
import Contatos from "../models/contato.js"
import Filas from "../models/fila.js"
import io from "socket.io-client";
import Mensagem from "./mensagemController.js"
import Coleta from "./coletasController.js";
import dotenv from 'dotenv'
import Contato from "./contatoController.js";
import axios from "axios";
dotenv.config()

const socket = io.connect(process.env.BASEURL);
const mytoken = process.env.MYTOKEN
const baseUrl = process.env.BASEURL


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
                let text = body_param.entry[0].changes[0].value.messages[0].interactive.button_reply.title
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
            console.log("Nao esta na fila")
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
                    dadosSql.forEach(async (element) => {
                        await Coleta.verificaMongo(element, telefone)
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
                //cria Fila
                fila = await Fila.adicionaNaFila(contato, "0", "ura")
                //Salva a mensagem
                let resposta = await this.salvaMensagem(contato, mensagem, fila.protocol)
                Fila.verificaAtendimento(fila) //Verifica a fila
            }
        }
        else {
            console.log("Esta na fila")
            let resposta = await this.salvaMensagem(contato, mensagem, fila.protocol)

            if (resposta == "respostaDuplicada") {
                // Pessoa clicou em mais de uma opcao
                return ""
            } else {
                Fila.verificaAtendimento(fila) //Verifica a fila
            }
        }
    }

    static async salvaMensagem(contato, mensagem, protocol) {
        console.log("salvando mensagem")
        let protocolo = protocol
        let room = ''
        let ultimaMensagem = null
        if (mensagem.to === '5511945718427') {
            room = contato.tel //define a sala para enviar a mensagem
            //busca ultima mensagem
            try {
                ultimaMensagem = await Mensagens.findOne({ from: contato._id })
                    .sort({ date: -1 })
                    .exec()
            } catch (error) {

            }
        }
        else {
            protocolo = mensagem.protocol //coloca o protocolo da mensagem
            room = mensagem.to //define a sala para enviar a mensagem
        }


        if (ultimaMensagem === null || ultimaMensagem.context == undefined || ultimaMensagem.context != mensagem.context) {
            //salva mensagem
            try {
                const msg = new Mensagens({
                    protocol: protocolo,
                    from: contato._id,
                    to: mensagem.to,
                    room: room,
                    phoneId: mensagem.phoneId,
                    timestamp: mensagem.timestamp * 1000, //transforma timestamp em milisegundos
                    context: mensagem.context,
                    text: mensagem.text
                });
                const novaMensagem = await msg.save();

                //envia mensagem via socket.io
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

    static enviaMensagemAtivo = async (req, res) => {
        const tel = req.params.tel
        const destinatario = await Contato.consultaContatoByTelefoneApi(tel)
        const remetente = await Contato.consultaContatoByTelefoneApi("5511945718427")

        let msg = ""

        if(destinatario){
            msg = {
                protocol: "",
                from: remetente,
                to: tel,
                room: tel,
                phoneId: "105378582538953",
                timestamp: "1682542640000",
                text: "*Olá, tudo bem?* 🙂\n\nFiz uma breve busca em nosso banco de dados e infelizmente não encontramos devolução registrada com este telefone.\n\nPoderia digitar o número de *CPF* ou *CNPJ* do consumidor para eu realizar mais uma consulta? *(digite apenas números)*",
                date: "2023-06-23T12:45:43.566Z",
                __v: 0,
                template: "agendar_devolucao",
                parameters: {
                    name: destinatario.name,
                    product: "Produto circular",
                    shipper: "Mex Shop"
                },
            }
        }else{
            msg = {
                protocol: "",
                from: remetente,
                to: tel,
                room: tel,
                phoneId: "105378582538953",
                timestamp: "1682542640000",
                text: "*Olá, tudo bem?* 🙂\n\nFiz uma breve busca em nosso banco de dados e infelizmente não encontramos devolução registrada com este telefone.\n\nPoderia digitar o número de *CPF* ou *CNPJ* do consumidor para eu realizar mais uma consulta? *(digite apenas números)*",
                date: "2023-06-23T12:45:43.566Z",
                __v: 0,
                template: "agendar_devolucao",
                parameters: {
                    name: "Fulano",
                    product: "Produto circular",
                    shipper: "Mex Shop"
                },
            }
        }

        try {
            axios.post(`${baseUrl}whatsapp/mensagem`, msg)
        } catch (error) {
            console.log(error)
        }

    }
}

export default whatsapp