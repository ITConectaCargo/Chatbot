import Contatos from "../models/contato.js"
import Mensagem from "../models/mensagem.js"
import Nfs from '../models/nfe.js'
import Fila from './filaController.js'
import axios from 'axios'
const baseURL = 'http://localhost:9000/'

class ura {
    static async verificaDadosUra(fila) {
        console.log("tratando dados para a ura")
        let ultimaMensagem = ""
        let botMensagem = ""
        let nf = ""

        //Prepara a mensagem que o Bot vai enviar
        try {
            ultimaMensagem = await Mensagem.findOne({ from: fila.from }) //Busca ultima Mensagem do contato
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

        //Verifica se existe NF deste cliente
        try {
            nf = await Nfs.findOne({ client: fila.from }) //busca NF
                .populate("client")
                .exec()
            console.log("encontrou NF na ura")
            console.log(nf)

            botMensagem.parameters = {
                name: nf.client.name,
                product: nf.product,
                shipper: nf.shipper
            }

            this.uraAtendimentoNf(fila, ultimaMensagem, botMensagem, nf)
        } catch (error) {
            console.log(error)
            console.log("nao encontrou NF na ura")
            
            this.uraAtendimento(fila, ultimaMensagem, botMensagem)
        }
    }

    static async uraAtendimentoNf(fila, ultimaMensagem, botMensagem, nf) {
        console.log("cheguei na ura")
        //Inicia o Bot
        if (fila.botStage == 0) {
            console.log("ura 0")
            let texto =
                `*Olá ${botMensagem.parameters.name}*, 😊\n\n`
                + `Localizei aqui que voce quer devolver o(s) produto(s)\n\n *${botMensagem.parameters.product}*\n\n`
                + `Nos somos transportadores autorizados: \n\n*${botMensagem.parameters.shipper}*\n\n`
                + `Gostaria de agendar a devolução?\n\n`
                + `1 - sim\n`
                + `2 - nao\n`

            //coloca mensagem no Bot
            botMensagem.text = texto
            botMensagem.template = "agendar_devolucao"
            console.log(botMensagem)
            //fila.botStage = 1
            this.preparaMensagemBot(botMensagem, fila)

        }
    }

    //--------------------------------------------------

    static async uraAtendimento(fila, ultimaMensagem, botMensagem) {
        console.log("ura sem NF")
        if (fila.botStage == 0) {
            console.log("ura 0")
            let texto = `Olá, tudo bem?\n`
            + `Não encontramos nenhuma coleta a agendar com base neste telefone\n`
            + `Com qual setor você gostaria de conversar?`
            botMensagem.text = texto
            botMensagem.template = "setores"
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