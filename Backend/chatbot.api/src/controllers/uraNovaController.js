import Contatos from "../models/contato.js"
import Mensagem from "../models/mensagem.js"
import Nfs from '../models/nfe.js'
import Nfe from '../controllers/nfeController.js'
import Coleta from "./coletasController.js"
import Fila from './filaController.js'
import Contato from "../controllers/contatoController.js"
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const baseURL = process.env.BASEURL

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
            nf = await Nfs.findOne({ client: fila.from, status: { $in: ['114', '308', "112"] } }) //busca NF status114(a Agendar) ou 308(reagendar)
                .populate("client")
                .exec()
            console.log("encontrou NF na ura")

            botMensagem.parameters = {
                name: nf.client.name,
                product: nf.product,
                shipper: nf.shipper
            }

            this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, nf)
        } catch (error) {
            console.log("nao encontrou NF na ura")
            this.uraAtendimento(fila, ultimaMensagem, botMensagem)
        }
    }

    static async uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, nf) {
        console.log("cheguei na ura Agendamento")
        //Inicia o Bot
        if (fila.botStage == 0) {
            console.log("ura NF Inicio")
            let texto =
                `*Olá ${botMensagem.parameters.name}, tudo bem?*\n\n`
                + `Localizei aqui que voce quer devolver o(s) produto(s)\n\n *${botMensagem.parameters.product}*\n\n`
                + `Nos somos transportadores autorizados: \n\n*${botMensagem.parameters.shipper}*\n\n`
                + `Gostaria de agendar a devolução?\n\n`

            //coloca mensagem no Bot
            botMensagem.text = texto
            botMensagem.template = "agendar_devolucao"
            fila.botStage = "NF aceitaTermos"
            this.preparaMensagemBot(botMensagem, fila)
        }

        else if (fila.botStage == "NF aceitaTermos") {
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
                botMensagem.template = "BotaoEditavel"
                botMensagem.parameters = {
                    opcao1: "Concordo",
                    opcao2: "Discordo"
                }
                fila.botStage = "NF confirmaEndereco"
                await this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
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

        else if (fila.botStage == "NF confirmaEndereco") {
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

        else if (fila.botStage == "NF produtoDesmontado") {
            //Caso Confirma endereço positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF produtoDesmontado")
                let texto = `O produto que você está devolvendo está desmontado?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF apartamento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso Confirma endereço negativo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
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

        else if (fila.botStage == "NF apartamento") {
            //Caso produto desmontado positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF apartamento")
                let texto = `Você mora em apartamento?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF andar"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso produto desmontado negativo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
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

        else if (fila.botStage == "NF andar") {
            //Caso mora em apartamento positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
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
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
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

        else if (fila.botStage == "NF elevador") {
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

        else if (fila.botStage == "NF aceitaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
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
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
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

        else if (fila.botStage == "NF confirmaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
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
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
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

        else if (fila.botStage == "confirmaCpfCnpj") {
            //consulta CPF CNPJ positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                fila.botStage = 0
                this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, nf)
            }

            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                let contato = ""
                let dados = ""
                //apaga dados do contato
                try {
                    dados = await Contatos.findOne({tel: botMensagem.to})
                } catch (error) {
                    console.log(error)
                }
                try {
                    contato = await Contatos.findByIdAndUpdate(
                        dados.id,
                        {
                            name: "",
                            nameWhatsapp: "",
                            cpfCnpj: "",
                            address: {
                                street: "",
                                district: "",
                                city: "",
                                state: "",
                                cep: "",
                                complement: "",
                            }
                        },
                        { new: true } //retorna o valor atualizado
                    )
                } catch (error) {
                    console.log(error)
                }

                //apaga Nfs geradas na data de hoje 
                await Nfe.deletaNfeHoje(contato._id)

                let texto = `Me Desculpe, as vezes eu me confundo 😕\n\n`
                    + `Gostaria de tentar novamente?`

                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "invalidoCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }
    }

    static async uraAtendimento(fila, ultimaMensagem, botMensagem, nf) {
        console.log("ura sem NF")
        if (fila.botStage == 0) {
            //inicio
            console.log("ura 0")
            let texto = `Olá, tudo bem? 🙂\n`
                + `Fiz uma breve busca em nosso banco de dados, e infelizmente não encontramos devolução em seu nome.\n`
                + `Poderia digitar o seu número de CPF ou CNPJ para eu realizar mais uma consulta?`;

            botMensagem.text = texto
            botMensagem.template = ""
            fila.botStage = "consultaCpfCnpj"
            this.preparaMensagemBot(botMensagem, fila)
        }

        else if (fila.botStage == "consultaCpfCnpj") {
            console.log("ura consultaCpfCnpj")
            let dadosSql = ""
            let contato = ""

            let cpfCnpjValido = Nfe.validacaoCpfCnpj(ultimaMensagem.text) //veriica se o CPF ou CNPJ esta valido

            //cpf é valido
            if (cpfCnpjValido === true) {
                try {
                    dadosSql = await Coleta.consultaByCpfCnpj(ultimaMensagem.text) //Busca CPF ou CNPJ no banco SQL
                } catch (error) {
                    console.log("Nao encontrou dados")
                }

                //se existir dados do Sql
                if (dadosSql.length !== 0) {
                    //atualiza dados do contato
                    contato = await Contato.atualizaDadosContatoBySql(dadosSql[0], fila.from._id) //Atualiza contato com os dados vindo do SQL
                    await Nfe.criaNfBySql(dadosSql, fila.from._id) //Cria as NFs no banco Mongo

                    let texto =
                        `Olha o que eu encontrei com este CPF/CNPJ\n\n`
                        + `*${contato.name}*\n\n`
                        + `Seria você ou a pessoa/empresa que gostaria de tratar sobre algum assunto?`

                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "confirmaCpfCnpj"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
                else {
                    let texto = `Desculpe 😕\n\n`
                        + `Mas não consegui localizar este CPF/CNPJ em nosso Sistema\n`
                        + `\nPosso tentar localizar via Nota Fiscal ou preferir eu posso te transferir para um de nossos atendentes?`

                    botMensagem.text = texto
                    botMensagem.template = "BotaoEditavel"
                    botMensagem.parameters = {
                        opcao1: "Nota Fiscal",
                        opcao2: "Atendente"
                    }
                    fila.botStage = 0
                    return this.preparaMensagemBot(botMensagem, fila)
                }
            }
            else {
                let texto = `Poxa 😕\n\n`
                    + `Parece que tem algo errado com este CPF ou CNPJ\n\n`
                    + `*${ultimaMensagem.text}*\n\n`
                    + `Gostaria de tentar novamente?`

                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "invalidoCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "invalidoCpfCnpj") {
            console.log("ura invalidoCpfCnpj")
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                let texto = `Legal!\n\n`
                    + `Digite novamente o CPF ou CNPJ`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Nâo") {
                let texto = `Sem problemas!\n\n`
                    + `Posso tentar localizar via Nota Fiscal ou se preferir eu posso te transferir para um de nossos atendentes?`

                botMensagem.text = texto
                botMensagem.template = "BotaoEditavel"
                botMensagem.parameters = {
                    opcao1: "Nota Fiscal",
                    opcao2: "Atendente"
                }
                fila.botStage = "0"
                return this.preparaMensagemBot(botMensagem, fila)
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
}

export default ura