import Contatos from "../models/contato.js"
import Mensagem from "../models/mensagem.js"
import Nfs from '../models/nfe.js'
import Coleta from "./coletasController.js"
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
            nf = await Nfs.findOne({ client: fila.from, status: { $in: ['300', '114', '308'] } }) //busca NF status 300 ou 114
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
            console.log("ura NF Inicio")
            let texto =
                `*Olá ${botMensagem.parameters.name}*, tudo bem?\n\n`
                + `Localizei aqui que voce quer devolver o(s) produto(s)\n\n *${botMensagem.parameters.product}*\n\n`
                + `Nos somos transportadores autorizados: \n\n*${botMensagem.parameters.shipper}*\n\n`
                + `Gostaria de agendar a devolução?\n\n`

            //coloca mensagem no Bot
            botMensagem.text = texto
            botMensagem.template = "botao"
            fila.botStage = "NF aceitaTermos"
            this.preparaMensagemBot(botMensagem, fila)
        }

        if (fila.botStage == "NF aceitaTermos") {
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                // Instruções
                console.log("ura NF aceitaTermos")
                let instrucoes = 
                "*Instruções*\n\n" 
                + "Nosso horário de coleta é das 08h às 18h, de segunda à sexta.\n" 
                + "Seu produto deve estar desmontado.\n" 
                + "Se possível, embalado, caso contrário faremos a coleta de forma que seu produto esteja protegido.\n\n" 
                + "Os produtos a serem coletados serão conferidos pelo responsável da coleta:\n" 
                + " - Modelo;\n" 
                + " - Marca;\n" 
                + " - Número de série;\n" 
                + " - IMEI, em caso de celulares e smartwatches;\n" 
                + " - Tamanho;\n" 
                + " - Outros detalhes de acordo com cada produto;\n" 
                + "A coleta só poderá ser realizada se um responsável maior de 18 anos estiver presente.\n\n" 
                + "Para sua segurança:\n" 
                + "Você receberá um documento assinado pelo responsável da coleta, comprovando a realização da mesma.\n" 
                + "Você deverá assinar uma via do comprovante, precisamos de seu nome completo e documento (RG ou CPF).\n"

                botMensagem.text = instrucoes;
                botMensagem.template = "concordo";
                fila.botStage = "NF confirmaEndereco"
                await this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "nao") {
                console.log("ura NF Inicio negativo")
                let texto = `Ok, sem problemas\n`
                    + `Com qual setor você gostaria de conversar?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "opcoes"
                botMensagem.parameters = {
                    opcao1: "SAC",
                    opcao2: "Comercial",
                    opcao3: "Motorista"
                }
                fila.botStage = "0"
                fila.status = "finalizado"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        if (fila.botStage == "NF confirmaEndereco") {
            //caso Inicio positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Concordo") {
                console.log("ura NF confirmaEndereco");
                let texto =
                    "Encontrei este endereço em meu banco de dados:\n\n" +
                    "Rua: " + nf.client.address.street + "\n" +
                    "Bairro: " + nf.client.address.district + "\n" +
                    "Cidade: " + nf.client.address.city + " - " + nf.client.address.state + "\n" +
                    "Cep: " + nf.client.address.cep + "\n" +
                    "Complemento: " + nf.client.address.complement + "\n" +
                    "\nAs informações acima estão corretas?";

                // Coloca mensagem no Bot
                botMensagem.text = texto;
                botMensagem.template = "botao";;
                fila.botStage = "NF produtoDesmontado";
                this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Discordo") {
                console.log("ura NF aceitaTermos negativo")
                let texto = `Ok, sem problemas\n`
                    + `Vou te transferir para um de nossos atendentes\n`
                    + `Aguarde que em breve voce sera atendido`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "espera"
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
                    opcao3: "Acima do 10º Andar"
                }
                fila.botStage = "NF elevador"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso mora em apartamento negativo
            if (ultimaMensagem.text == "2") {
                let dataAgendamento = Coleta.calculaDataAgendamento(nf.freightDate) //Calcula data de agendamento
                axios.put(`${baseURL}nfe/${nf._id}`, { //salva data no banco
                    appointmentDate: dataAgendamento
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                dataAgendamento = dataAgendamento.format('DD/MM/YYYY')

                console.log("ura NF apartamento negativo")
                let texto = `Data em que iremos coletar o produto: \n\n`
                    + `*${dataAgendamento}*`
                    + `\n\nConcorda com a data de coleta ?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
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
                fila.botStage = "NF aceitaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso ate 3º andar
            if (ultimaMensagem.text == "1") {
                let dataAgendamento = Coleta.calculaDataAgendamento(nf.freightDate) //Calcula data de agendamento
                axios.put(`${baseURL}nfe/${nf._id}`, { //salva data no banco
                    appointmentDate: dataAgendamento
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                dataAgendamento = dataAgendamento.format('DD/MM/YYYY')

                console.log("ura NF apartamento negativo")
                let texto = `Data em que iremos coletar o produto: \n\n`
                    + `*${dataAgendamento}*`
                    + `\n\nConcorda com a data de coleta ?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF confirmaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        if (fila.botStage == "NF aceitaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1") {
                let dataAgendamento = Coleta.calculaDataAgendamento(nf.freightDate) //Calcula data de agendamento
                axios.put(`${baseURL} nfe / ${nf._id} `, { // salva data no banco
                    appointmentDate: dataAgendamento
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                dataAgendamento = dataAgendamento.format('DD/MM/YYYY')

                console.log("ura NF apartamento negativo")
                let texto = `Data em que iremos coletar o produto: \n\n`
                    + `*${dataAgendamento}*`
                    + `\n\nConcorda com a data de coleta ? `
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF confirmaData"
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
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        if (fila.botStage == "NF confirmaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1") {
                console.log("ura NF Enviando pra o ESL")
                let texto = `Agendado com sucesso`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "finalizado"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso confirma data negativo
            if (ultimaMensagem.text == "2") {
                axios.put(`${baseURL}nfe/${nf._id}`, { //salva data no banco
                    appointmentDate: ""
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                console.log("ura NF confimaData Negativo")
                let texto = `Entendi\n`
                    + `Vou te transferir para um de nossos atendentes\n`
                    + `Aguarde que em breve voce sera atendido`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }
    }

    static async uraAtendimento(fila, ultimaMensagem, botMensagem) {
        console.log("ura sem NF")
        if (fila.botStage == 0) {
            console.log("ura 0")
            let texto = `Olá, tudo bem ?\n`
                + `Não encontramos nenhuma coleta a agendar em nosso banco de dados com base deste telefone\n`
                + `Com qual setor você gostaria de conversar ? `
            botMensagem.text = texto
            botMensagem.template = "opcoes"
            botMensagem.parameters = {
                opcao1: "SAC",
                opcao2: "Comercial",
                opcao3: "Motorista"
            }
            fila.botStage = 0
            fila.status = "finalizado"
            this.preparaMensagemBot(botMensagem, fila)
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
}

export default ura