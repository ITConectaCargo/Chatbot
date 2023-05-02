import Whatsapp from "./whatsappController.js"
import Fila from "./filaController.js"
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
                let texto = "SAC"
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 0)

            } else if (ultimaMensagem.text == 2) {
                console.log("ura 2.2")
                let texto = "Comercial"
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 0)

            } else if (ultimaMensagem.text == 3) {
                console.log("ura 2.3")
                let texto = "Motoristas"
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 0)

            } else if (ultimaMensagem.text == 4) {
                console.log("ura 2.4")
                let texto = "Agradecemos seu contato"
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 0)
            }
        }
    }    
}

export default ura