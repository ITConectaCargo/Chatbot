import Contatos from "../models/contato.js"
import Mensagem from "../models/mensagem.js"
import Nfs from '../models/nfe.js'
import Fila from './filaController.js'
import axios from 'axios'
const baseURL = 'http://localhost:9000/'

class ura {
    static async uraAtendimento(fila) {
        console.log("cheguei na ura")
        let ultimaMensagem = ""
        let botMensagem = ""
        let nf = ""

        try {
            nf = await Nfs.findOne({ client: fila.from }) //busca produtos
                .populate("client")
                .exec()

        } catch (error) {
            console.log(error)
        }

        try {
            ultimaMensagem = await Mensagem.findOne({ from: fila.from }) //Busca ultima Mensagem e contato
                .sort({ date: 'desc' })
                .populate('from')
                .exec()

            //prepara mensagem do bot
            let resposta = await Contatos.findOne({ tel: ultimaMensagem.to })//puxa os dados da empresa no banco

            botMensagem = ultimaMensagem //prepara padrao de mensagem
            botMensagem.template = "" //adiciona o template para a mensagem do bot
            botMensagem.parameters = "" //adiciona os parametros do template para a mensagem do bot

            //altera o destinatario e remetente
            botMensagem.to = ultimaMensagem.from.tel
            botMensagem.from = resposta
        } catch (error) {
            console.log(error)
        }

        //Inicia o Bot
        if (fila.botStage == 0) {
            console.log("ura 0")
            let texto =
                `*Olá ${nf.client.name}*, 😊\n\n`
                + `Localizei aqui que voce quer devolver o(s) produto(s)\n\n *${nf.product}*\n\n`
                + `Nos somos transportadores autorizados: \n\n*${nf.shipper}*\n\n`
                + `Gostaria de agendar a devolução?\n\n`
                + `1 - sim\n`
                + `2 - nao\n`

            //coloca mensagem no Bot
            botMensagem.text = texto
            botMensagem.template = "agendar_devolucao"
            botMensagem.parameters = {
                name: nf.client.name,
                product: nf.product,
                shipper: nf.shipper
            }
            console.log(botMensagem)
            //fila.botStage = 1
            this.preparaMensagemBot(botMensagem, fila)
        }
    }

    //--------------------------------------------------

    static async preparaMensagemBot(mensagem, fila) {
        //altera o estagio do Bot
        Fila.alteraBotStage(fila, fila.botStage)
        try {
            axios.post(`${baseURL}whatsapp/mensagem`, mensagem)
        } catch (error) {
            console.log(error)
        }
    }

    //------------------------------------------------

    static async adicionaFilaEspera(fila) {
        fila.status = "espera"
        try {
            axios.put(`http://localhost:9000/fila/`, fila)
        } catch (error) {
            console.log(error)
        }
    }
}

export default ura