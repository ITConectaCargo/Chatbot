import Mensagem from "../models/mensagem.js"
import Contato from "../models/contato.js"
import Fila from "./filaController.js"
import axios from "axios"
const baseURL = "http://localhost:9000/"
class ura {

    static async uraAtendimento(fila) {
        console.log("Ura de atendimento")
        let ultimaMensagem = ""
        let botMensagem = ""

        //Busca ultima Mensagem e contato
        try {
            ultimaMensagem = await Mensagem.findOne({ from: fila.from })
                .sort({ date: 'desc' })
                .populate('from')
                .exec()

            //prepara mensagem do bot
            //puxa os dados da empresa no banco
            let resposta = await Contato.findOne({ tel: ultimaMensagem.to })

            //prepara padrao de mensagem
            botMensagem = ultimaMensagem

            //altera o destinatario e remetente
            botMensagem.to = ultimaMensagem.from.tel
            botMensagem.from = resposta
        } catch (error) {
            console.log(error)
        }

        //Inicia o Bot
        if (fila.botStage == 0) {
            console.log("ura 0")
            let texto = `Ola, Seja bem vindo(a) a Conecta Cargo\n`
                + `Sou sua Assistente virtual\n`
                + `Digite a opção desejada\n`
                + `1 - SAC\n`
                + `2 - Comercial\n`
                + `3 - Motorista\n`

            //coloca mensagem no Bot
            botMensagem.text = texto
            fila.botStage = 1
            this.preparaMensagemBot(botMensagem, fila)
        }

        //Opcoes
        else if (fila.botStage == 1) {
            console.log(ultimaMensagem)
            if (ultimaMensagem.text == "1") {
                console.log("ura 1.1")
                let texto = `Para agilizar o nosso atendimento me informe o CPF ou CNPJ da NFe\n`
                    + `digite apenas numeros`

                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = "1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2") {
                console.log("ura 1.2")
                let texto = `Aguarde enquanto te tranfiro para um dos nossos atendendentes`

                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = 0
                this.preparaMensagemBot(botMensagem, fila)
                this.adicionaFilaEspera(fila)
            }
            else if (ultimaMensagem.text == "3") {
                console.log("ura 1.3")
                let texto = `Aguarde enquanto te tranfiro para um dos nossos atendendentes`

                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = 0
                this.preparaMensagemBot(botMensagem, fila)
                this.adicionaFilaEspera(fila)
            }
            else {
                console.log("nao entendi")
                let texto = `Desculpe nao entendi\n`
                    + `Digite a opção desejada\n`
                    + `1 - SAC\n`
                    + `2 - Comercial\n`
                    + `3 - Motorista\n`

                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = 0
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        //SAC confirma CPF CNPJ
        else if (fila.botStage == "1.1") {
            console.log("ura 1.1")
            let count = 0

            for (let i = 0; i < ultimaMensagem.text.length; i++) {
                count++
            }

            if (count == 11 || count == 14) {
                let texto = `Fiz uma busca em meu sistema e encontrei os seguintes dados\n\n`
                    + `NF: 0000000\n`
                    + `CPF / CNPJ\n`
                    + `Produtos: 5x Bolacha\n\n`
                    + `Voce confirma os dados acima?\n`
                    + `1 - Sim\n`
                    + `2 - Nao\n`
                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = "1.1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
            else {
                let texto = `O CPF ou CNPJ ${ultimaMensagem.text} esta Invalido`
                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = "1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        //SAC Valida se as informações estao corretas
        else if (fila.botStage == "1.1.1") {
            if (ultimaMensagem.text == "sim" || ultimaMensagem.text == 1) {
                console.log("ura 1.1.1")
                let texto = `Perfeito\n`
                    + `Aguarde enquanto te tranfiro para um dos nossos atendendentes\n`
                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = 0
                this.preparaMensagemBot(botMensagem, fila)
                this.adicionaFilaEspera(fila)
            }
            else if (ultimaMensagem.text == "nao" || ultimaMensagem.text == 2) {
                console.log("ura 1.1.2")
                let texto = `Entendi!\n Pelo visto tem algo errado com sua coleta\n`
                    + `Aguarde enquanto te tranfiro para um dos nossos atendendentes\n`
                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = 0
                this.preparaMensagemBot(botMensagem, fila)
                this.adicionaFilaEspera(fila)
            }
            else {
                console.log("nao entendi")
                let texto = `Desculpe nao entendi\n`
                    + `Fiz uma busca em meu sistema e encontrei os seguintes dados\n`
                    + `NF: 0000000\n`
                    + `CPF / CNPJ\n`
                    + `Produtos: 5x Bolacha\n`
                    + `Voce confirma os dados acima?\n`
                    + `1 - Sim\n`
                    + `2 - Nao\n`
                //coloca mensagem no Bot
                botMensagem.text = texto
                fila.botStage = "1.1.1"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
    }

    static async preparaMensagemBot(mensagem, fila) {
        //altera o estagio do Bot
        Fila.alteraBotStage(fila, fila.botStage)
        try {
            axios.post(`${baseURL}whatsapp/mensagem`, mensagem)
        } catch (error) {
            console.log(error)
        }
    }

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