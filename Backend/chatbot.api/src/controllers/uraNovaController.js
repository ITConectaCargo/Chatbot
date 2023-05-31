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

    //---------------------------------------------------------------------

    static async uraAtendimentoNf(fila, ultimaMensagem, botMensagem, nf) {
        console.log("cheguei na ura")
        //Inicia o Bot
        if (fila.botStage == 0) {
            console.log("ura NF Inicio")
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
            fila.botStage = "NF confirmaEndereco"
            this.preparaMensagemBot(botMensagem, fila)
        }
        if (fila.botStage == "NF confirmaEndereco") {
            //caso Inicio positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "sim") {
                console.log("ura NF confirmaEndereco")
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
                fila.botStage = "NF produtoDesmontado"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso Inicio negativo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "nao") {
                console.log("ura NF Inicio negativo")
                let texto = `Ok, sem problemas\n`
                    + `Com qual setor você gostaria de conversar?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                botMensagem.parameters = {
                    opcao1: "SAC",
                    opcao2: "Comercial",
                    opcao3: "Motorista"
                }
                console.log(botMensagem)
                fila.botStage = "NF departamentos"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF produtoDesmontado") {
            //Caso Confirma endereço positivo
            if (ultimaMensagem.text == "1") {
                console.log("ura NF produtoDesmontado")
                let texto = `O produto que você está devolvendo está desmontado?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                console.log(botMensagem)
                fila.botStage = "NF apartamento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso Confirma endereço negativo
            if (ultimaMensagem.text == "2") {
                console.log("ura NF confirmaEndereco negativo")
                let texto = `Entendi\n`
                    + `Vou te transferir para um de nossos atendentes\n`
                    + `Aguarde que em breve voce sera atendido`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                console.log(botMensagem)
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF apartamento") {
            //Caso produto desmontado positivo
            if (ultimaMensagem.text == "1") {
                console.log("ura NF apartamento")
                let texto = `Você mora em apartamento?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                console.log(botMensagem)
                fila.botStage = "NF andar"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso produto desmontado negativo
            if (ultimaMensagem.text == "2") {
                console.log("ura NF produtoDesmontado negativo")
                let texto = `Entendi\n`
                    + `Vou te transferir para um de nossos atendentes\n`
                    + `Aguarde que em breve voce sera atendido`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                console.log(botMensagem)
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF andar") {
            //Caso mora em apartamento positivo
            if (ultimaMensagem.text == "1") {
                console.log("ura NF andar")
                let texto = `Em qual andar você mora?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "opcoes"
                botMensagem.parameters = {
                    opcao1: "Até o 3º Andar",
                    opcao2: "Entre 4º e 10º Andar",
                    opcao3: "Acima do 10º"
                }
                console.log(botMensagem)
                fila.botStage = "NF elevador"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso mora em apartamento negativo
            if (ultimaMensagem.text == "2") {
                console.log("ura NF apartamento negativo")
                let texto = `Aceita Data?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"

                console.log(botMensagem)
                fila.botStage = "NF confirmaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
        if (fila.botStage == "NF elevador") {
            //Caso andar acima do 4 andar positivo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "3") {
                console.log("ura NF elevador")
                let texto = `Possui elevador de serviço e é permitido o seu uso?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                console.log(botMensagem)
                fila.botStage = "NF aceitaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso ate 3º andar
            if (ultimaMensagem.text == "1") {
                console.log("ura NF Até o 3º Andar")
                let texto = `Aceita Data?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"

                console.log(botMensagem)
                fila.botStage = "NF confirmaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        if (fila.botStage == "NF aceitaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1") {
                console.log("ura NF aceitaData")
                let texto = `aceita data?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                console.log(botMensagem)
                fila.botStage = "0"
                fila.status = "NF confirmaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso confirma data negativo
            if (ultimaMensagem.text == "2") {
                console.log("ura NF confimaData Negativo")
                let texto = `Entendi\n`
                    + `Vou te transferir para um de nossos atendentes\n`
                    + `Aguarde que em breve voce sera atendido`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                console.log(botMensagem)
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        if (fila.botStage == "NF confirmaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1") {
                console.log("ura NF Enviando pra o ESL")
                let texto = `Enviando para a quipe de agendamento`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                console.log(botMensagem)
                fila.botStage = "0"
                fila.status = "finalizado"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso confirma data negativo
            if (ultimaMensagem.text == "2") {
                console.log("ura NF confimaData Negativo")
                let texto = `Entendi\n`
                    + `Vou te transferir para um de nossos atendentes\n`
                    + `Aguarde que em breve voce sera atendido`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                console.log(botMensagem)
                fila.botStage = "0"
                fila.status = "espera"
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
            botMensagem.parameters = {
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
}

export default ura