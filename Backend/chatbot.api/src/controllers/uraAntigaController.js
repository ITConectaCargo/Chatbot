    import Whatsapp from "./whatsappController.js"
    import Fila from "./filaAntigaController.js"
    import Mensagem from "../models/mensagem.js"

    class ura {

        static async uraAtendimento(atendimento) {
            console.log("Ura de atendimento")
            const ultimaMensagem = await Mensagem.findOne({ from: atendimento.from })
                .sort({ timestamp: 'desc' })
                .select('text')
                .exec()

            console.log(atendimento)

            if (atendimento.botStage == 0) {
                console.log("ura 0")
                let texto = `Ola! Bem vindo a Conecta Cargo sou sua assistente virtual\nPor favor, informe seu Nome para prosseguirmos o atendimento. \u{1F60A}`
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 1)
            }
            else if (atendimento.botStage == 1) {
                console.log("ura 1")
                let texto = "Digite a opção desejada\n1-SAC\n2-Comercial\n3-Motoristas\n4-Sair"
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 2)
            }
            else if (atendimento.botStage == 2) {
                console.log(ultimaMensagem.text)
                if (ultimaMensagem.text == 1) {
                    console.log("ura 2.1")
                    let texto = "Como você gostaria de se identificar?\n1. Pessoa Física\n2. Pessoa Jurídica (Empresa)"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "2.1")

                } else if (ultimaMensagem.text == 2) {
                    console.log("Enviando para a fila de espera Comercial")
                    let texto = "Analisaremos sua solicitação assim que nosso atendimento estiver disponível.\nNosso horário de atendimento é de segunda a sexta das 8:00 às 19:00."
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "0")

                } else if (ultimaMensagem.text == 3) {
                    console.log("Enviando para a fila de espera Motoristas")
                    let texto = "Analisaremos sua solicitação assim que nosso atendimento estiver disponível.\nNosso horário de atendimento é de segunda a sexta das 8:00 às 19:00."
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "0")

                } else if (ultimaMensagem.text == 4) {
                    console.log("ura 2.4")
                    let texto = "Agradecemos seu contato"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, 0)
                }
                else {
                    console.log("Nao entendi")
                    let erro = "Nao compreendi"
                    Whatsapp.enviaMensagem(atendimento.from, erro)
                    let texto = "Digite a opção desejada\n1-SAC\n2-Comercial\n3-Motoristas\n4-Sair"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                }
            }
            else if (atendimento.botStage == "2.1") {
                console.log(ultimaMensagem.text)
                if (ultimaMensagem.text == 1) {
                    console.log("ura 2.1.1")
                    let texto = "Para agilizarmos nosso atendimento, por favor informe o número do seu CPF sem traços ou pontos\n Ex: 00000000000"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "2.1.1")
                }
                if (ultimaMensagem.text == 2) {
                    console.log("ura 2.1.2")
                    let texto = "Para agilizarmos nosso atendimento, por favor informe o número do seu CNPJ"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "2.1.2")
                }
            }
            else if (atendimento.botStage == "2.1.1"){
                this.verificaCPF(ultimaMensagem.text, atendimento)
            }
            else if (atendimento.botStage == "2.1.1.1"){
                console.log(ultimaMensagem.text)
                if (ultimaMensagem.text == 1) {
                    console.log("Enviando para a fila de espera")
                    let texto = "Analisaremos sua solicitação assim que nosso atendimento estiver disponível.\nNosso horário de atendimento é de segunda a sexta das 8:00 às 19:00."
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "0")
                }
                if (ultimaMensagem.text == 2) {
                    console.log("ura devolvendo para opção CPF")
                    let texto = "Para agilizarmos nosso atendimento, por favor informe o número do seu CPF sem traços ou pontos\n Ex: 00000000000"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "2.1.1")
                }
            }
            else if (atendimento.botStage == "2.1.2"){
                this.verificaCNPJ(ultimaMensagem.text, atendimento)
            }
            else if (atendimento.botStage == "2.1.2.1"){
                console.log(ultimaMensagem.text)
                if (ultimaMensagem.text == 1) {
                    console.log("Enviando para a fila de espera")
                    let texto = "Analisaremos sua solicitação assim que nosso atendimento estiver disponível.\nNosso horário de atendimento é de segunda a sexta das 8:00 às 19:00."
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "0")
                }
                if (ultimaMensagem.text == 2) {
                    console.log("ura devolvendo para opção CNPJ")
                    let texto = "Para agilizarmos nosso atendimento, por favor informe o número do seu CNPJ"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, "2.1.2")
                }
            }
        }

        static verificaCPF(cpf, atendimento) {
            let cont = 0
            console.log(cpf.length)
            for (let i = 0; i < cpf.length; i++) {
                cont++
            }

            if (cont == 11) {
                console.log("CPF valido")
                let sucesso = `O ${cpf} está correto?\n1. Sim\n2. Não`
                Whatsapp.enviaMensagem(atendimento.from, sucesso)
                Fila.alteraBotStage(atendimento, "2.1.1.1")
            }
            else {
                console.log("Nao entendi")
                let erro = "CPF invalido"
                Whatsapp.enviaMensagem(atendimento.from, erro)
                let texto = "Digite seu CPF com um dos formatos a seguir: 00000000000"
                Whatsapp.enviaMensagem(atendimento.from, texto)
            }
        }

        static verificaCNPJ(cnpj, atendimento) {
            let cont = 0
            console.log(cnpj.length)
            for (let i = 0; i < cnpj.length; i++) {
                cont++
            }

            if (cont == 14) {
                console.log("CNPJ valido")
                let sucesso = `O ${cnpj} está correto?\n1. Sim\n2. Não`
                Whatsapp.enviaMensagem(atendimento.from, sucesso)
                Fila.alteraBotStage(atendimento, "2.1.2.1")
            }
            else {
                console.log("CNPJ invalido")
                let erro = "CNPJ invalido"
                Whatsapp.enviaMensagem(atendimento.from, erro)
                let texto = "Digite seu CNPJ com um dos formatos a seguir: 00000000000"
                Whatsapp.enviaMensagem(atendimento.from, texto)
            }
        }
    }

    export default ura