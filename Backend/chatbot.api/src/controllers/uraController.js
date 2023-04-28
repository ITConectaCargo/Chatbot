import Whatsapp from "./whatsappController.js"
import Fila from "./filaController.js"

import Mensagem from "../models/mensagem.js"

class ura {

    static async uraAtendimento(atendimento) {
        console.log("Ura de atendimento")
        console.log(atendimento)
        const ultimaMensagem = await Mensagem.findOne({ from: atendimento.from })
            .sort({ timestamp: 'desc' })
            .select('text')
            .exec()

        console.log(ultimaMensagem)


        if (atendimento.botStage == 0) {
            let texto = `Ola! Bem vindo a Conecta Cargo sou sua assistente virtual\nPor favor, informe seu Nome para prosseguirmos o atendimento. \u{1F60A}`

            Whatsapp.enviaMensagem(atendimento.from, texto)
            Fila.alteraBotStage(atendimento, 1)
        }
        else if (atendimento.botStage == 1) {
            let texto = "Digite a opção desejada\n1-SAC\n2-Comercial\n3-Motoristas\n4-Sair"

            Whatsapp.enviaMensagem(atendimento.from, texto)
            Fila.alteraBotStage(atendimento, 2)
        }
        else if (atendimento.botStage == 2) {

            if (ultimaMensagem.text == 4) {
                let texto = "Tenha um bom dia"
                Whatsapp.enviaMensagem(atendimento.from, texto)
                Fila.alteraBotStage(atendimento, 0)
            }
        }
    }
}

export default ura