import Whatsapp from "./whatsappController.js"
import Fila from "./filaController.js"
import Mensagem from "../models/mensagem.js"
import moment from 'moment'

class ura {

    static async uraAtendimento(atendimento) {
        console.log("Ura de atendimento")
        const ultimaMensagem = await Mensagem.findOne({ from: atendimento.from })
            .sort({ timestamp: 'desc' })
            .select('text')
            .exec()

        if (this.timeout(atendimento.from)) {
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
                if (ultimaMensagem.text == 1) {
                    console.log("ura 2.1")
                    let texto = "SAC"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, 3.1)

                } else if (ultimaMensagem.text == 2) {
                    console.log("ura 2.2")
                    let texto = "Comercial"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, 3.2)

                } else if (ultimaMensagem.text == 3) {
                    console.log("ura 2.3")
                    let texto = "Motoristas"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, 3.3)

                } else if (ultimaMensagem.text == 4) {
                    console.log("ura 2.4")
                    let texto = "Agradecemos seu contato"
                    Whatsapp.enviaMensagem(atendimento.from, texto)
                    Fila.alteraBotStage(atendimento, 0)
                }
            }
        }
        else {
            console.log("Timeout")
            let texto = "Nosso horario de atendimento é das 08:00 as 18:00\nAgradecemos seu contato"
            Whatsapp.enviaMensagem(atendimento.from, texto)
            Fila.alteraBotStage(atendimento, 0)
        }
    }

    static async timeout(atendimento) {
        const penultimaMensagem = await Mensagem.findOne({ from: atendimento })
            .sort({ timestamp: 'desc' })
            .skip(1)
            .limit(1)
            .select('date')
            .exec()

            const ultimaMensagem = await Mensagem.findOne({ from: atendimento })
            .sort({ timestamp: 'desc' })
            .select('date')
            .exec()

        const agora = moment();
        const horaInicio = moment().hour(8).minute(0).second(0);
        const horaFim = moment().hour(18).minute(0).second(0);
        const diaDaSemana = agora.isoWeekday();

        if (diaDaSemana >= 1 && diaDaSemana <= 5) {
            // Dia da semana é segunda a sexta
            if (agora.isBetween(horaInicio, horaFim)) {
                // Está dentro do horário comercial
                const duracao = moment.utc(moment(penultimaMensagem.date).diff(moment(ultimaMensagem.date))).format('HH:mm:ss');
                const tempoCoversa = moment().hour(1).minute(0).second(0);
                console.log(`A diferença entre ${ultimaMensagem.date} e ${penultimaMensagem.date} é de ${duracao}.`);
                if (duracao < tempoCoversa) {
                    return true;
                }
            }
        }
        return false
    }
}

export default ura