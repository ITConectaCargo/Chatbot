import Contatos from "../models/contato.js"
import Agendamentos from "../models/agendamento.js"
import Mensagem from "../models/mensagem.js"
import Embarcador from '../controllers/embarcadorController.js'
import Nfe from '../controllers/nfeController.js'
import Coleta from "./coletasController.js"
import Fila from './filaController.js'
import Contato from "../controllers/contatoController.js"
import diacritics from 'diacritics'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const baseURL = process.env.BASEURL

class ura {
    static async verificaDadosUra(fila) {
        console.log("tratando dados para a ura")
        let ultimaMensagem = ""
        let botMensagem = ""

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
            let agendamento = await Agendamentos.findOne({ client: fila.from, status: { $in: ['114', '308'] } }) //busca NF status 114 (a Agendar) ou 308(reagendar)
                .populate("client")
                .populate("nfe")
                .populate("shipper")
                .exec()

            botMensagem.parameters = {
                name: agendamento.client.name,
                product: agendamento.nfe.product,
                shipper: agendamento.shipper.name
            }

            this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
        } catch (error) {
            console.log("nao agendamento na ura")
            this.uraAtendimento(fila, ultimaMensagem, botMensagem)
        }
    }

    static async uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, agendamento) {
        console.log("cheguei na ura Agendamento")
        //Inicia o Bot
        if (fila.botStage == 0) {
            if (botMensagem.parameters.product != "Produto nao cadastrado") {
                console.log("ura NF Inicio")
                let texto =
                    `*Olá ${botMensagem.parameters.name}, tudo bem?*\n\n`
                    + `Localizei aqui que você quer devolver:\n\n*${botMensagem.parameters.product}*\n\n`
                    + `Nós somos transportadores autorizados: \n\n*${botMensagem.parameters.shipper}*\n\n`
                    + `Gostaria de agendar a devolução?\n\n`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF aceitaTermos"
                this.preparaMensagemBot(botMensagem, fila)
            } else {
                console.log("ura NF Inicio")
                let texto =
                    `Ola *${agendamento.client.name}*, tudo bem?\n\n`
                    + `Fiz uma busca porem no meu sistema porem nao encontrei o produto 😕\n\n`
                    + `Vou transferir para um dos nossos atendentes\n\n`
                    + `Aguarde um momento e em breve você sera atendido`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "ura"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF aceitaTermos") {
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                // Instruções
                console.log("ura NF aceitaTermos")
                let instrucoes =
                    "*Instruções*\n\n"
                    + "Nosso horário de coleta é das *08h* às *18h*, de segunda à sexta.\n"
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
                fila.botStage = "NF checklist"
                await this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura NF Inicio negativo")
                let texto = `Ok, sem problemas 😉\n\n`
                    + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF aceitaTermos"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF checklist") {
            //caso Inicio positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Concordo") {
                let checklist = false
                console.log("ura NF confirmaEndereco");
                if (agendamento.checklist.statusPackaging == undefined || agendamento.checklist.reason == undefined || agendamento.checklist.details == undefined) {
                    let dadosCheklist = await Coleta.consultaChecklist(agendamento.nfe.key)
                    if (dadosCheklist) {
                        agendamento.checklist.details = dadosCheklist.detalhes
                        agendamento.checklist.statusPackaging = dadosCheklist.estadoPacote
                        agendamento.checklist.reason = dadosCheklist.motivo
                        await Coleta.atualizaAgendamento(agendamento)

                        checklist = true
                    }
                }
                else {
                    checklist = true
                }

                if (checklist === true) {
                    let texto =
                        `Perfeito! 😉\n\n`
                        + `Olha o que eu encontrei:\n\n`
                        + `Estado da embalagem:\n*${agendamento.checklist.statusPackaging}*\n\n`
                        + `Motivo da Devolução:\n*${agendamento.checklist.reason}*\n\n`
                        + `Detalhes:\n*${agendamento.checklist.details}*\n\n`
                        + `Os dados que você informou estão corretos?`

                    // Coloca mensagem no Bot
                    botMensagem.text = texto;
                    botMensagem.template = "botao";;
                    fila.botStage = "NF confirmaEndereco";
                    this.preparaMensagemBot(botMensagem, fila);
                }
                else {
                    let texto =
                        `Huuum... 🤔\n\n`
                        + `Acho que esta faltando algumas informações\n\n`
                        + `Para evitar problemas, vou te tranferir para um dos nossos atendentes\n`
                        + `Aguarde um momento, embreve você será atendido! 😉`

                    // Coloca mensagem no Bot
                    botMensagem.text = texto;
                    botMensagem.template = "";
                    fila.botStage = "0"
                    fila.status = "finalizado"
                    this.preparaMensagemBot(botMensagem, fila)
                }
            }
            //caso Inicio negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Discordo") {
                console.log("ura NF aceitaTermos negativo")
                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF checklist"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF confirmaEndereco") {
            //caso Inicio positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF confirmaEndereco");
                let texto =
                    `Legal! 🙂\n\n` +
                    "Encontrei este endereço em meu banco de dados:\n\n" +
                    `Rua:\n*${agendamento.client.address.street}*\n\n`+
                    `Bairro:\n*${agendamento.client.address.district}*\n\n` +
                    `Cidade:\n*${agendamento.client.address.city}* - *${agendamento.client.address.state}*\n\n` +
                    `Cep:\n*${agendamento.client.address.cep}*\n\n` + 
                    `Complemento:\n*${agendamento.client.address.complement}*\n\n` +
                    "As informações acima estão corretas?";

                // Coloca mensagem no Bot
                botMensagem.text = texto;
                botMensagem.template = "botao";
                fila.botStage = "NF produtoDesmontado";
                this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura NF aceitaTermos negativo")
                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF confirmaEndereco"
                return this.preparaMensagemBot(botMensagem, fila)
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
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura NF confirmaEndereco negativo")
                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF produtoDesmontado"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF apartamento") {
            //Caso produto desmontado positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                agendamento.protocol.push(fila.protocol)
                agendamento.disassembledProduct = true
                Coleta.atualizaAgendamento(agendamento)
                console.log("ura NF apartamento")
                let texto = `Você mora em apartamento?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF andar"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso produto desmontado negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura NF produtoDesmontado negativo")
                agendamento.disassembledProduct = false
                Coleta.atualizaAgendamento(agendamento)
                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF apartamento"
                return this.preparaMensagemBot(botMensagem, fila)
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
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                agendamento.residence.type = "casa"
                agendamento.residence.floor = ""
                agendamento.residence.elevator = ""
                Coleta.atualizaAgendamento(agendamento)

                fila.botStage = "NF calculaData"
                this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF andar"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF elevador") {
            //Caso andar acima do 4 andar positivo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "3" || ultimaMensagem.text == "Entre 4º e 10º Andar" || ultimaMensagem.text == "Acima do 10º Andar") {
                console.log("ura NF elevador")
                agendamento.residence.type = "apartamento"
                agendamento.residence.floor = ultimaMensagem.text
                Coleta.atualizaAgendamento(agendamento)

                let texto = `Possui elevador de serviço e é permitido o seu uso?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF confirmaElevador"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso ate 3º andar
            else if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Até o 3º Andar") {
                agendamento.residence.type = "apartamento"
                agendamento.residence.floor = ultimaMensagem.text
                agendamento.residence.elevator = true
                Coleta.atualizaAgendamento(agendamento)

                fila.botStage = "NF calculaData"
                this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF elevador"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF confirmaElevador") {
            //Caso andar acima do 4 andar positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF confirmaElevador")
                agendamento.residence.elevator = true
                Coleta.atualizaAgendamento(agendamento)

                fila.botStage = "NF calculaData"
                this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            //Caso ate 3º andar
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                agendamento.residence.elevator = false
                Coleta.atualizaAgendamento(agendamento)

                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF elevador"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF aceitaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                fila.botStage = "NF calculaData"
                this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, nf)
            }
            //Caso confirma data negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura NF elevador Negativo")
                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF aceitaData"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF calculaData") {
            // busca uma data 
            let dataAgendamento = await Coleta.calculaDataAgendamento(agendamento.freightDate, agendamento.shipper, agendamento.client.address.cep) //Calcula data de agendamento

            if (dataAgendamento !== "Fora de SP") {
                axios.put(`${baseURL}nfe/${agendamento.nfe._id}`, { // salva data no banco
                    appointmentDate: dataAgendamento
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                agendamento.appointmentDate = dataAgendamento
                Coleta.atualizaAgendamento(agendamento)

                dataAgendamento = dataAgendamento.format('DD/MM/YYYY')

                console.log("ura NF apartamento negativo")
                let texto = `Data em que iremos coletar o produto: \n\n`
                    + `*${dataAgendamento}*`
                    + `\n\nConcorda com a data de coleta?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF confirmaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
            else {
                let texto = `Poxa... 😣\n\n`
                    + `Não possuo datas disponiveis para a coleta no momento\n\n`
                    + `Gostaria de falar diretamente com um atendente?`
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }

        }

        else if (fila.botStage == "NF confirmaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF confirmaData")
                let texto = `Agendado com sucesso ☺️\n\n`
                    + `Seu numero de protocolo é:\n`
                    + `*${fila.protocol}*\n\n`
                    + `Agradecemos seu contato!`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "finalizado"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso confirma data negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                axios.put(`${baseURL}nfe/${agendamento.nfe._id}`, { //salva data no banco
                    appointmentDate: ""
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                console.log("ura NF confimaData Negativo")
                let texto = `Ok, sem problemas 😉\n\n`
                + `Gostaria de falar diretamente com um atendente?`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "NF validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF confirmaData"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "NF validaAtendimento") {
            //Caso mora em apartamento positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF andar")
                let texto = `Maravilha! 😃\n\n`
                + `Estou te transferindo para um dos nossos atendentes\n\n`
                + `Aguarde e em breve você será atendido!`

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "ura"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso mora em apartamento negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                let texto = `Sem problemas 😌\n\n`
                + `Estarei aqui sempre que precisar\n\n`
                + `Até a próxima 👋🏻`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "finalizado"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "NF andar"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "validaTitular") {
            let eValido = true //

            if (isNaN(ultimaMensagem.text)) { //se for texto
                let nomeContatoNF = diacritics.remove(agendamento.client.name.trim()) //remove os caracteres especiais
                let [primeiroNome] = nomeContatoNF.split(' ') //salva a primeira palavra

                let nome = diacritics.remove(ultimaMensagem.text.trim()) //remove caracters especiais

                if (primeiroNome.toLowerCase() !== nome.toLowerCase()) { //se for diferente altera para false
                    eValido = false
                }
            }
            else {
                let cpfCnpjContato = agendamento.client.cpfCnpj
                for (let i = 0; i < 4; i++) {
                    if (cpfCnpjContato[i] !== ultimaMensagem.text[i]) { //se for diferente altera para false
                        eValido = false
                        break
                    }
                }
            }

            let texto = `Consultando...`
            botMensagem.text = texto
            botMensagem.template = ""
            this.preparaMensagemBot(botMensagem, fila)

            setTimeout(async () => { // Aguarda 3 segundos antes de executar a função

                if (eValido === true) {
                    console.log("valido")

                    botMensagem.template = ""
                    fila.botStage = "0"
                    return this.uraAtendimentoAgendamento(fila, ultimaMensagem, botMensagem, agendamento) // devolve para o inicio da fila
                }
                else {
                    console.log("invalido")
                    let contato = ""
                    try {
                        contato = await Contatos.findByIdAndUpdate(
                            agendamento.client._id,
                            {
                                name: "",
                                nameWhatsapp: "Desconhecido",
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
                    await Coleta.deletaAgendamento(agendamento._id)

                    let texto = `Poxaa... os dados nao conferem 😕\n\n`
                        + `Bom... neste caso podemos tentar novamente pelo *CPF/CNPJ* ou pela *Nota fiscal*, mas se preferir eu posso te transferir para um dos nossos atendentes`
                        + `\n\nO que você prefere?`

                    botMensagem.text = texto
                    botMensagem.template = "opcoes"
                    botMensagem.parameters = {
                        opcao1: "CPF/CNPJ",
                        opcao2: "Nota Fiscal",
                        opcao3: "Atendente"
                    }

                    fila.botStage = "invalidoNotaFiscal"
                    return this.preparaMensagemBot(botMensagem, fila)

                }
            }, 3000);
        }
    }

    static async uraAtendimento(fila, ultimaMensagem, botMensagem) {
        console.log("ura sem NF")
        if (fila.botStage == 0) {
            //inicio
            console.log("ura 0")
            let texto = `*Olá, tudo bem?* 🙂\n\n`
                + `Fiz uma breve busca em nosso banco de dados e infelizmente não encontramos devolução registrada com este telefone.\n\n`
                + `Poderia digitar o número de *CPF* ou *CNPJ* do consumidor para eu realizar mais uma consulta? *(digite apenas números)*`;

            botMensagem.text = texto
            botMensagem.template = ""
            fila.botStage = "consultaCpfCnpj"
            this.preparaMensagemBot(botMensagem, fila)
        }

        else if (fila.botStage == "consultaCpfCnpj") {
            console.log("ura consultaCpfCnpj")
            let dadosSql = []
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
                    let embarcador = await Embarcador.criaEmbarcadorSql(dadosSql[0])
                    let nf = await Nfe.criaNfBySql(dadosSql, fila.from._id, embarcador) //Cria as NFs no banco Mongo
                    await Coleta.criaAgendamento(contato._id, nf._id, embarcador._id, nf.key) // Cria agendamento

                    let texto =
                        `Legal, encontrei 😊\n\n`
                        + `Por motivos de segurança, poderia me informar o *primeiro nome* do titular da compra?`


                    botMensagem.text = texto
                    botMensagem.template = ""
                    fila.botStage = "validaTitular"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
                else {
                    let texto = `Poxa... Me desculpe 😕\n\n`
                        + `Não consegui localizar este CPF/CNPJ em nosso Sistema.\n`
                        + `\nPosso tentar localizar pelo número da Nota Fiscal ou se preferir, transfiro você para um de nossos atendentes.`

                    botMensagem.text = texto
                    botMensagem.template = "BotaoEditavel"
                    botMensagem.parameters = {
                        opcao1: "Nota Fiscal",
                        opcao2: "Atendente"
                    }
                    fila.botStage = "buscaNotaFiscal"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
            }
            else {
                let mensagem = parseInt(ultimaMensagem.text) //converte mensagem para numero

                if (isNaN(mensagem)) {
                    console.log("A string não é um número.");
                    let texto = `*Desculpe*\n\n`
                        + `Aparentemente você não digitou número\n\n`
                        + `Vale lembrar:\n`
                        + `*CPF:* possui *11* dígitos\n`
                        + `*CNPJ:* possui *14* dígitos\n\n`
                        + `Vamos tentar novamente?`

                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "invalidoCpfCnpj"
                    return this.preparaMensagemBot(botMensagem, fila)
                } else {
                    console.log("A string é um número.");
                    let texto = `Poxa 😕\n\n`
                        + `Parece que tem algo errado com este CPF ou CNPJ\n\n`
                        + `*${ultimaMensagem.text}*\n\n`
                        + `Vale lembrar que:\n`
                        + `*CPF:* possui *11 dígitos*\n`
                        + `*CNPJ:* possui *14 dígitos*\n\n`
                        + `Vamos tentar novamente?`

                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "invalidoCpfCnpj"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
            }
        }

        else if (fila.botStage == "confirmaCpfCnpjNf") {
            console.log("ura confirmaCpfCnpjNf")
            let texto =
                `Certo... 🤔\n\n`
                + `Pelo visto você não possui agendamento a realizar\n\n`
                + `Vou te transferir para um de nossos atendentes para poder auxilia-lo melhor\n\n`
                + `Aguarde e em breve você será atendido`

            botMensagem.text = texto
            botMensagem.template = ""
            fila.botStage = "0"
            return this.preparaMensagemBot(botMensagem, fila)

        }

        else if (fila.botStage == "invalidoCpfCnpj") {
            console.log("ura invalidoCpfCnpj")
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                let texto = `Legal!\n\n`
                    + `Digite novamente o *CPF* ou *CNPJ* *(apenas números)*`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Nâo") {
                let texto = `Sem problemas!\n\n`
                    + `Posso tentar localizar pelo *Número da Nota Fiscal* ou se preferir posso te transferir para um de nossos atendentes?`

                botMensagem.text = texto
                botMensagem.template = "BotaoEditavel"
                botMensagem.parameters = {
                    opcao1: "Nota Fiscal",
                    opcao2: "Atendente"
                }
                fila.botStage = "buscaNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "invalidoCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "buscaNotaFiscal") {
            console.log("ura buscaNotaFiscal")
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Nota Fiscal") {
                let texto = `Certo!\n\n`
                    + `Consegue me passar o *Número da Nota fiscal* para eu fazer uma busca aqui para você`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Atendente") {
                let texto = `*Sem problemas.*\n\n`
                    + `Estou te transferindo para um dos nossos atendentes,\n`
                    + `Em breve você será atendido.`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "buscaNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "consultaNotaFiscal") {
            console.log("ura consultaNotaFiscal")
            let dadosSql = []
            let mensagem = parseInt(ultimaMensagem.text) //converte mensagem para numero

            if (!isNaN(mensagem)) { //se for um numero
                try {
                    dadosSql = await Coleta.consultaByNf(ultimaMensagem.text)
                } catch (error) {
                    console.log("NF nao encontrada")
                }
            }

            if (dadosSql.length !== 0) {
                //atualiza dados do contato
                let contato = await Contato.atualizaDadosContatoBySql(dadosSql[0], fila.from._id) //Atualiza contato com os dados vindo do SQL
                let embarcador = await Embarcador.criaEmbarcadorSql(dadosSql[0])
                let nf = await Nfe.criaNfBySql(dadosSql, fila.from._id, embarcador) //Cria as NFs no banco Mongo
                await Coleta.criaAgendamento(contato._id, nf._id, embarcador._id, nf.key) // Cria agendamento

                let texto = `Boaa! 😎\n\n`
                    + `Encontrei uma Nota Fiscal aqui!\n\n`
                    + `Por motivos de segurança, poderia me informar o *primeiro nome* ou os *4 primeiros digitos* do *CPF/CNPJ* do titular desta Nota Fiscal?`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "validaTitular"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else {
                let texto = `Xiii, Não encontrei 😣\n\n`
                    + `Bom... neste caso podemos tentar novamente pelo *CPF/CNPJ* ou pela *Nota fiscal*, mas se preferir eu posso te transferir para um dos nossos atendentes`
                    + `\n\nO que você prefere?`

                botMensagem.text = texto
                botMensagem.template = "opcoes"
                botMensagem.parameters = {
                    opcao1: "CPF/CNPJ",
                    opcao2: "Nota Fiscal",
                    opcao3: "Atendente"
                }
                fila.botStage = "invalidoNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "invalidoNotaFiscal") {
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "CPF/CNPJ") {
                let texto = `Perfeito! 😊\n\n`
                    + `Poderia digitar o *CPF* ou *CNPJ*`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Nota Fiscal") {
                let texto = `Perfeito! 😊\n\n`
                    + `Poderia digitar o *número da Nota Fiscal*?`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "3" || ultimaMensagem.text == "Atendente") {
                let texto = `Sem problemas\n\n`
                    + `Estou te transferindo para um dos nossos atendentes\n\n`
                    + `Em breve você será atendido`

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "invalidoNotaFiscal"
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