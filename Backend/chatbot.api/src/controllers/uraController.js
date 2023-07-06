import Contatos from "../models/contato.js"
import Agendamentos from "../models/agendamento.js"
import Mensagem from "../models/mensagem.js"
import Embarcador from './embarcadorController.js'
import Checklist from './checklistController.js'
import Nfe from './nfeController.js'
import Coleta from "./coletasController.js"
import Fila from './filaController.js'
import Contato from "./contatoController.js"
import moment from "moment"
import diacritics from 'diacritics'
import axios from 'axios'
import dotenv from 'dotenv'
import Mensagens from "./mensagemController.js"
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
            let agendamento = await Agendamentos.findOne({ "client.id": fila.from, status: { $in: ['114', '308', '300'] } }) //busca NF status 114 (a Agendar) 308(reagendar) ou 300 (agendado)
                .populate("nfe")
                .populate("shipper")
                .exec()

            botMensagem.parameters = {
                name: agendamento.client.name,
                product: agendamento.nfe.product,
                shipper: agendamento.shipper.name
            }

            if (agendamento.status == "114" || agendamento.status == "308") {
                this.uraAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            else if (agendamento.status == "300") {
                this.uraReagendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            else {
                this.uraAtendimento(fila, ultimaMensagem, botMensagem)
            }
        } catch (error) {
            console.log("nao agendamento na ura")
            this.uraAtendimento(fila, ultimaMensagem, botMensagem)
        }
    }

    static async uraAtendimento(fila, ultimaMensagem, botMensagem) {
        console.log("ura sem NF")
        if (fila.botStage == 0) {
            //inicio
            console.log("ura 0")
            let template = await Mensagens.buscaMensagemTemplate("naoEncontrouTelefone")
            let texto = template

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
                    for (let i = 0; i < nf.length; i++) {
                        let element = nf[i];
                        await Coleta.criaAgendamento(contato, element._id, embarcador._id, element.key); // Cria agendamento
                    }

                    let template = await Mensagens.buscaMensagemTemplate("confirmaNomeTitular")
                    let texto = template

                    botMensagem.text = texto
                    botMensagem.template = ""
                    fila.botStage = "validaTitular"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
                else {
                    let template = await Mensagens.buscaMensagemTemplate("naoEncontrouCpfCnpj")
                    let texto = template

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
                    let template = await Mensagens.buscaMensagemTemplate("cpfCnpjSemNumeros")
                    let texto = template

                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "invalidoCpfCnpj"
                    return this.preparaMensagemBot(botMensagem, fila)
                } else {
                    console.log("A string é um número.");
                    let template = await Mensagens.buscaMensagemTemplate("erroCpfCnpj")
                    let texto = template.replace("{{1}}", ultimaMensagem.text)

                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "invalidoCpfCnpj"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
            }
        }

        else if (fila.botStage == "invalidoCpfCnpj") {
            console.log("ura invalidoCpfCnpj")
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                let template = await Mensagens.buscaMensagemTemplate("invalidoCpfCnpj")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                let template = await Mensagens.buscaMensagemTemplate("invalidoCpfCnpj-negativa")
                let texto = template

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
                let template = await Mensagens.buscaMensagemTemplate("buscaNotaFiscal")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Atendente") {
                let template = await Mensagens.buscaMensagemTemplate("buscaNotaFiscal-negativa")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "espera"
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
                    console.log("agendamento nao encontrada")
                }
            }

            if (dadosSql.length !== 0) {
                //atualiza dados do contato
                let contato = await Contato.atualizaDadosContatoBySql(dadosSql[0], fila.from._id) //Atualiza contato com os dados vindo do SQL
                let embarcador = await Embarcador.criaEmbarcadorSql(dadosSql[0])
                let nf = await Nfe.criaNfBySql(dadosSql, fila.from._id, embarcador) //Cria as NFs no banco Mongo
                for (let i = 0; i < nf.length; i++) {
                    let element = nf[i];
                    await Coleta.criaAgendamento(contato, element._id, embarcador._id, element.key); // Cria agendamento
                }

                let template = await Mensagens.buscaMensagemTemplate("consultaNotaFiscal")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "validaTitular"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else {
                let template = await Mensagens.buscaMensagemTemplate("consultaNotaFiscal-negativa")
                let texto = template

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
                let template = await Mensagens.buscaMensagemTemplate("invalidoNotaFiscal-cpfCnpj")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaCpfCnpj"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Nota Fiscal") {
                let template = await Mensagens.buscaMensagemTemplate("invalidoNotaFiscal-nf")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "consultaNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            else if (ultimaMensagem.text == "3" || ultimaMensagem.text == "Atendente") {
                let template = await Mensagens.buscaMensagemTemplate("invalidoNotaFiscal-atendente")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "espera"
                return this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "invalidoNotaFiscal"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "validaAtendimento") {
            //Caso mora em apartamento positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura NF andar")
                let template = await Mensagens.buscaMensagemTemplate("validaAtendimento")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso mora em apartamento negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                let template = await Mensagens.buscaMensagemTemplate("validaAtendimento-negativa")
                let texto = template

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
            let agendamento = ""

            try {
                agendamento = await Agendamentos.findOne({ "client.id": fila.from })
                    .populate("nfe")
                    .populate("shipper")
                    .exec()
            } catch (error) {
                console.log(error)
            }

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

            let texto = `*Consultando...*`
            botMensagem.text = texto
            botMensagem.template = ""
            this.preparaMensagemBot(botMensagem, fila)

            setTimeout(async () => { // Aguarda 3 segundos antes de executar a função

                if (eValido === true) {
                    console.log("valido")

                    let template = await Mensagens.buscaMensagemTemplate("validaTitular-validoSemNf")
                    let texto = template.replace("{{1}}", agendamento.client.name)

                    //coloca mensagem no Bot
                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "validaAtendimento"
                    this.preparaMensagemBot(botMensagem, fila)
                }
                else {
                    console.log("invalido")
                    let contato = ""
                    try {
                        contato = await Contatos.findByIdAndUpdate(
                            agendamento.client.id,
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

                    let template = await Mensagens.buscaMensagemTemplate("validaTitular-atendente")
                    let texto = template

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

    static async uraAgendamento(fila, ultimaMensagem, botMensagem, agendamento) {
        console.log("cheguei na ura Agendamento")
        //Inicia o Bot
        if (fila.botStage == 0) {
            const raizCnpj = agendamento.shipper.cpfCnpj.substr(0, 8)
            const [deploy] = await Coleta.consultaDeploySql(raizCnpj)
            deploy.cidade = diacritics.remove(deploy.cidade.trim()) //Remove caracteres especiais
            agendamento.client.address.city = diacritics.remove(agendamento.client.address.city.trim())

            try {
                if (deploy.cidade.toLowerCase() != agendamento.client.address.city.toLowerCase()) {
                    console.log("ura NF Inicio UF")
                    let template = await Mensagens.buscaMensagemTemplate("agendamento-inicio-uf")
                    let texto = template.replace("{{1}}", botMensagem.parameters.name)

                    //coloca mensagem no Bot
                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "validaAtendimento"
                    this.preparaMensagemBot(botMensagem, fila)
                }
                else if (botMensagem.parameters.product == "Produto nao cadastrado") {
                    console.log("ura NF Inicio produto nao cadastrado")
                    let template = await Mensagens.buscaMensagemTemplate("agendamento-inicio-produtoNaoCadastrado")
                    let texto = template.replace("{{1}}", botMensagem.parameters.name)

                    //coloca mensagem no Bot
                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "validaAtendimento"
                    this.preparaMensagemBot(botMensagem, fila)
                }
                else {
                    console.log("ura agendamento Inicio Sucesso")
                    let template = await Mensagens.buscaMensagemTemplate("agendamento-inicio-sucesso")
                    let texto = template.replace("{{1}}", botMensagem.parameters.name)
                        .replace("{{2}}", botMensagem.parameters.product)
                        .replace("{{3}}", botMensagem.parameters.shipper)

                    //coloca mensagem no Bot
                    botMensagem.text = texto
                    botMensagem.template = "botao"
                    fila.botStage = "agendamento aceitaTermos"
                    this.preparaMensagemBot(botMensagem, fila)

                }
            } catch (error) {
                console.log("ura NF Inicio")
                let template = await Mensagens.buscaMensagemTemplate("agendamento-inicio-naoDeploy")
                let texto = template.replace("{{1}}", botMensagem.parameters.name)
                    .replace("{{2}}", botMensagem.parameters.shipper)

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento aceitaTermos") {
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                // Instruções
                console.log("ura agendamento aceitaTermos")
                let template = await Mensagens.buscaMensagemTemplate("agendamento-aceitaTermos")
                let texto = template

                botMensagem.text = texto;
                botMensagem.template = "BotaoEditavel"
                botMensagem.parameters = {
                    opcao1: "Concordo",
                    opcao2: "Discordo"
                }
                fila.botStage = "agendamento checklist"
                await this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura agendamento Inicio negativo")
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento aceitaTermos"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento checklist") {
            //caso Inicio positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Concordo") {
                let checklist = false
                console.log("ura agendamento confirmaEndereco");
                if (agendamento.checklist.statusPackaging == undefined || agendamento.checklist.reason == undefined || agendamento.checklist.details == undefined) {
                    let dadosCheklist = await Checklist.consultaChecklist(agendamento.nfe.key)
                    if (dadosCheklist) {
                        agendamento.checklist.details = dadosCheklist.detalhes.trim()
                        agendamento.checklist.statusPackaging = dadosCheklist.estadoPacote.trim()
                        agendamento.checklist.reason = dadosCheklist.motivo.trim()
                        await Coleta.atualizaAgendamento(agendamento)

                        checklist = true
                    }
                }
                else {
                    checklist = true
                }

                if (checklist === true) {
                    let template = await Mensagens.buscaMensagemTemplate("agendamento-checklist")
                    let texto = template.replace("{{1}}", agendamento.checklist.statusPackaging)
                        .replace("{{2}}", agendamento.checklist.reason)
                        .replace("{{3}}", agendamento.checklist.details)

                    // Coloca mensagem no Bot
                    botMensagem.text = texto;
                    botMensagem.template = "botao";;
                    fila.botStage = "agendamento confirmaEndereco";
                    this.preparaMensagemBot(botMensagem, fila);
                }
                else {
                    let template = await Mensagens.buscaMensagemTemplate("agendamento-semChecklist")
                    let texto = template

                    // Coloca mensagem no Bot
                    botMensagem.text = texto;
                    botMensagem.template = "";
                    fila.botStage = "0"
                    fila.status = "espera"
                    this.preparaMensagemBot(botMensagem, fila)
                }
            }
            //caso Inicio negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Discordo") {
                console.log("ura agendamento aceitaTermos negativo")
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento checklist"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento confirmaEndereco") {
            //caso Inicio positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento confirmaEndereco");
                let template = await Mensagens.buscaMensagemTemplate("agendamento-endereco")
                let texto = template.replace("{{1}}", agendamento.client.address.street.trim())
                    .replace("{{2}}", agendamento.client.address.district.trim())
                    .replace("{{3}}", agendamento.client.address.city.trim())
                    .replace("{{4}}", agendamento.client.address.state.trim())
                    .replace("{{5}}", agendamento.client.address.cep)
                {
                    texto = (agendamento.client.address.complement) ? //se existir complemento
                        texto.replace("{{6}}", agendamento.client.address.complement)
                        : texto.replace("\nComplemento:\n*{{6}}*\n", '')
                }

                // Coloca mensagem no Bot
                botMensagem.text = texto;
                botMensagem.template = "botao";
                fila.botStage = "agendamento produtoDesmontado";
                this.preparaMensagemBot(botMensagem, fila);
            }
            //caso Inicio negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura agendamento aceitaTermos negativo")
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento confirmaEndereco"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento produtoDesmontado") {
            //Caso Confirma endereço positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento produtoDesmontado")
                let template = await Mensagens.buscaMensagemTemplate("agendamento-produtoDesmontado")
                let texto = template
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "agendamento apartamento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso Confirma endereço negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura agendamento confirmaEndereco negativo")
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento produtoDesmontado"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento apartamento") {
            //Caso produto desmontado positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento apartamento")
                agendamento.protocol.push(fila.protocol)
                agendamento.disassembledProduct = true
                Coleta.atualizaAgendamento(agendamento)

                let template = await Mensagens.buscaMensagemTemplate("agendamento-apartamento")
                let texto = template
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "agendamento andar"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso produto desmontado negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura agendamento produtoDesmontado negativo")
                agendamento.disassembledProduct = false
                Coleta.atualizaAgendamento(agendamento)
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento apartamento"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento andar") {
            //Caso mora em apartamento positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento andar")
                let template = await Mensagens.buscaMensagemTemplate("agendamento-andar")
                let texto = template
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "opcoes"
                botMensagem.parameters = {
                    opcao1: "Até o 3º Andar",
                    opcao2: "Entre 4º e 10º Andar",
                    opcao3: "Acima do 10º Andar"
                }
                fila.botStage = "agendamento elevador"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso mora em apartamento negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                agendamento.residence.type = "Casa"
                agendamento.residence.floor = ""
                agendamento.residence.elevator = ""
                Coleta.atualizaAgendamento(agendamento)

                fila.botStage = "agendamento calculaData"
                this.uraAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento andar"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento elevador") {
            //Caso andar acima do 4 andar positivo
            if (ultimaMensagem.text == "2" || ultimaMensagem.text == "3" || ultimaMensagem.text == "Entre 4º e 10º Andar" || ultimaMensagem.text == "Acima do 10º Andar") {
                console.log("ura agendamento elevador")
                agendamento.residence.type = "Apartamento"
                agendamento.residence.floor = ultimaMensagem.text
                Coleta.atualizaAgendamento(agendamento)

                let template = await Mensagens.buscaMensagemTemplate("agendamento-elevador")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "agendamento confirmaElevador"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso ate 3º andar
            else if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Até o 3º Andar") {
                agendamento.residence.type = "apartamento"
                agendamento.residence.floor = ultimaMensagem.text
                agendamento.residence.elevator = true
                Coleta.atualizaAgendamento(agendamento)

                fila.botStage = "agendamento calculaData"
                this.uraAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento elevador"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento confirmaElevador") {
            //Caso andar acima do 4 andar positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento confirmaElevador")
                agendamento.residence.elevator = true
                Coleta.atualizaAgendamento(agendamento)

                fila.botStage = "agendamento calculaData"
                this.uraAgendamento(fila, ultimaMensagem, botMensagem, agendamento)
            }
            //Caso ate 3º andar
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                agendamento.residence.elevator = false
                Coleta.atualizaAgendamento(agendamento)
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento elevador"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento aceitaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                fila.botStage = "agendamento calculaData"
                this.uraAgendamento(fila, ultimaMensagem, botMensagem, nf)
            }
            //Caso confirma data negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura agendamento elevador Negativo")
                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento aceitaData"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "agendamento calculaData") {
            // busca uma data 
            let dataAgendamento = await Coleta.calculaDataAgendamento(agendamento.freightDate, agendamento.shipper, agendamento.client.address.cep) //Calcula data de agendamento

            if (dataAgendamento !== "Fora de SP") {
                console.log("ura agendamento apartamento negativo")
                axios.put(`${baseURL}nfe/${agendamento.nfe._id}`, { // salva data no banco
                    appointmentDate: dataAgendamento
                })
                    .then(resposta => console.log("Salvou no banco"))
                    .catch(error => console.log(error))

                agendamento.appointmentDate = dataAgendamento
                Coleta.atualizaAgendamento(agendamento)

                dataAgendamento = dataAgendamento.format('DD/MM/YYYY')

                let template = await Mensagens.buscaMensagemTemplate("agendamento-dataAgendamento")
                let texto = template.replace("{{1}}", dataAgendamento)
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "agendamento confirmaData"
                this.preparaMensagemBot(botMensagem, fila)
            }
            else {
                let template = await Mensagens.buscaMensagemTemplate("agendamento-dataAgendamento-erro")
                let texto = template
                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }

        }

        else if (fila.botStage == "agendamento confirmaData") {
            //Caso confirma data positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento confirmaData")
                const statusAgendamento = await Coleta.enviaAgendamentoEsl(agendamento)

                let template = await Mensagens.buscaMensagemTemplate("agendamento-protocolo")
                let texto = template.replace("{{1}}", fila.protocol)

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

                let template = await Mensagens.buscaMensagemTemplate("falarAtendente")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "botao"
                fila.botStage = "validaAtendimento"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento confirmaData"
                return this.preparaMensagemBot(botMensagem, fila)
            }
        }

        else if (fila.botStage == "validaAtendimento") {
            //Caso mora em validaAtendimento positivo
            if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Sim") {
                console.log("ura agendamento validaAtendimento")
                let template = await Mensagens.buscaMensagemTemplate("validaAtendimento")
                let texto = template

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "espera"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //Caso mora em validaAtendimento negativo
            else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Não") {
                console.log("ura agendamento validaAtendimento negativo")
                let template = await Mensagens.buscaMensagemTemplate("validaAtendimento-negativa")
                let texto = template

                botMensagem.text = texto
                botMensagem.template = ""
                fila.botStage = "0"
                fila.status = "finalizado"
                this.preparaMensagemBot(botMensagem, fila)
            }
            //caso nao aperte botao
            else {
                botMensagem.template = "naoApertouBotao"
                fila.botStage = "agendamento andar"
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

            let texto = `*Consultando...*`
            botMensagem.text = texto
            botMensagem.template = ""
            this.preparaMensagemBot(botMensagem, fila)

            setTimeout(async () => { // Aguarda 3 segundos antes de executar a função

                if (eValido === true) {
                    console.log("valido")

                    botMensagem.template = ""
                    fila.botStage = "0"
                    return this.uraAgendamento(fila, ultimaMensagem, botMensagem, agendamento) // devolve para o inicio da fila
                }
                else {
                    console.log("invalido")
                    let contato = ""
                    try {
                        contato = await Contatos.findByIdAndUpdate(
                            agendamento.client.id,
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
                    Nfe.deletaNfeHoje(contato._id)
                    Coleta.deletaAgendamento(agendamento._id)

                    let template = await Mensagens.buscaMensagemTemplate("validaTitular-invalido")
                    let texto = template

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

    static async uraReagendamento(fila, ultimaMensagem, botMensagem, agendamento) {
        try {
            if (fila.status == "0") {
                console.log("ura NF Inicio status 300")

                let template = await Mensagens.buscaMensagemTemplate("agendamento-inicio-agendado")
                let texto = template.replace("{{1}}", botMensagem.parameters.name)
                    .replace("{{2}}", moment(agendamento.appointmentDate).format('DD/MM/YYYY'))

                //coloca mensagem no Bot
                botMensagem.text = texto
                botMensagem.template = "opcoes"
                botMensagem.parameters = {
                    opcao1: "Reagendar",
                    opcao2: "Atendimento",
                    opcao3: "Sair"
                }
                fila.botStage = "reagendamento"
                this.preparaMensagemBot(botMensagem, fila)

            }
            else if (fila.botStage == "reagendamento") {
                //Caso mora em validaAtendimento positivo
                if (ultimaMensagem.text == "1" || ultimaMensagem.text == "Reagendar") {
                    console.log("ura reagendamento validaAtendimento")
                    let template = await Mensagens.buscaMensagemTemplate("validaAtendimento")
                    let texto = "Em construção..."

                    //coloca mensagem no Bot
                    botMensagem.text = texto
                    botMensagem.template = ""
                    fila.botStage = "0"
                    fila.status = "finalizado"
                    this.preparaMensagemBot(botMensagem, fila)
                }
                //Caso mora em validaAtendimento negativo
                else if (ultimaMensagem.text == "2" || ultimaMensagem.text == "Atendimento") {
                    console.log("ura reagendamento Atendimento")
                    let template = await Mensagens.buscaMensagemTemplate("validaAtendimento")
                    let texto = template

                    botMensagem.text = texto
                    botMensagem.template = ""
                    fila.botStage = "0"
                    fila.status = "espera"
                    this.preparaMensagemBot(botMensagem, fila)
                }
                //Caso mora em validaAtendimento negativo
                else if (ultimaMensagem.text == "3" || ultimaMensagem.text == "Sair") {
                    console.log("ura reagendamento Sair")
                    let template = await Mensagens.buscaMensagemTemplate("validaAtendimento-negativa")
                    let texto = "Em construção..."

                    botMensagem.text = texto
                    botMensagem.template = ""
                    fila.botStage = "0"
                    fila.status = "finalizado"
                    this.preparaMensagemBot(botMensagem, fila)
                }
                //caso nao aperte botao
                else {
                    botMensagem.template = "naoApertouBotao"
                    fila.botStage = "agendamento andar"
                    return this.preparaMensagemBot(botMensagem, fila)
                }
            }
        } catch (error) {
            console.log(error)
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