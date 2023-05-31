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
            console.log("ura NF 0")
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
            fila.botStage = "NF 1"
            this.preparaMensagemBot(botMensagem, fila)
        }
        if (fila.botStage == "NF 1") {
            if (ultimaMensagem.text == "1") {
                console.log("ura NF 1")
                let texto = `Encontrei este endereço em meu banco de dados:\n\n`
                    + `Rua: ${nf.client.address.street}\n`
                    + `Bairro: ${nf.client.address.district}\n`
                    + `Cidade: ${nf.client.address.city} - ${nf.client.address.state}\n`
                    + `Cep: ${nf.client.address.cep}\n`
                    + `Complemento: ${nf.client.address.complement}\n`
                    + `\nAs informações acima estão corretas?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                console.log(botMensagem)
                fila.botStage = "NF 1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF 1.1") {
            if (ultimaMensagem.text == "1") {
                console.log("ura NF 1.1")
                let texto = `O produto que você está devolvendo está desmontado?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                console.log(botMensagem)
                fila.botStage = "NF 1.1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF 1.1.1") {
            if (ultimaMensagem.text == "1") {
                console.log("ura NF 1.1.1")
                let texto = `Você mora em apartamento?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                console.log(botMensagem)
                fila.botStage = "NF 1.1.1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF 1.1.1.1") {
            if (ultimaMensagem.text == "1") {
                console.log("ura NF 1.1.1.1")
                let texto = `Em qual andar você mora?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "opcoes"
                botMensagem.parameters ={ 
                    opcao1: "Até o 3º Andar",
                    opcao2: "Entre 4º e 10º Andar",
                    opcao3: "Acima do 10º"
                }
                console.log(botMensagem)
                fila.botStage = "0"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
    }

    //--------------------------------------------------

    static async uraAtendimento(fila, ultimaMensagem, botMensagem) {
        console.log("ura sem NF")
        if (fila.botStage == 0) {
            console.log("ura 0")
            let texto = `Olá, tudo bem?\n`
                + `Não encontramos nenhuma coleta a agendar em nosso banco de dados com base deste telefone\n`
                + `Com qual setor você gostaria de conversar?`
            botMensagem.text = texto
            botMensagem.template = "opcoes"
            botMensagem.parameters ={ 
                opcao1: "SAC",
                opcao2: "Comercial",
                opcao3: "Motorista"
            }
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