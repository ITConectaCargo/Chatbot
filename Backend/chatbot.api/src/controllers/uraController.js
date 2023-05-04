import Mensagem from "../models/mensagem.js"
import Contato from "../models/contato.js"
import Fila from "./filaController.js"
import Whatsapp from "./whatsappController.js"
    class ura {

        static async uraAtendimento(fila) {
            console.log("Ura de atendimento")
            console.log(fila)

            let ultimaMensagem = ""
            let contato = ""

            //Busca ultima Mensagem e contato
            try {
                ultimaMensagem = await Mensagem.findOne({from: fila.from})
                .sort({ timestamp: 'desc' })
                .select('text')
                .exec()

                contato = await Contato.findById(fila.from)
            } catch (error) {
                console.log(error)
            }

            console.log(contato)

            if (fila.botStage == 0) {
                console.log("ura 0")
                let texto = `Ola! Bem vindo a Conecta Cargo sou sua assistente virtual\nPor favor, informe seu Nome para prosseguirmos o atendimento. \u{1F60A}`
                Whatsapp.enviaMensagem(contato.tel, texto)
                Fila.alteraBotStage(fila, 1)
            }
            else if (fila.botStage == 1) {
                console.log("ura 1")
                let texto = "Digite a opção desejada\n1-SAC\n2-Comercial\n3-Motoristas\n4-Sair"
                Whatsapp.enviaMensagem(contato.tel, texto)
                Fila.alteraBotStage(fila, 0)
            }

     
        }
    }

    export default ura