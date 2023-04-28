import Fila from '../models/fila.js'
import Ura from "./uraController.js"

class fila {
    static async verificaAtendimento(tel, timestamp) {
        const telFila = await Fila.find({ from: tel })
        const hora = timestamp * 1000 //transforma o timestamp em milisengundos
        let botStage = ""
        let status = ""

        if (telFila != "") {
            console.log(`Verificando telefone: ${telFila[0].from}`)
            if (telFila[0].status == "finalizado") {
                botStage = "0"
                status = "ura"

                this.adicionaNaFila(tel, hora, botStage, status)
            }
            else if (telFila[0].status == "ura") {
                Ura.uraAtendimento(telFila[0])
            }
        }
        else {
            console.log(`Telefone nao encontrado`)
            botStage = "0"
            status = "ura"
            this.adicionaNaFila(tel, hora, botStage, status)
        }
    }

    static async adicionaNaFila(from, timestamp, botStage, status) {
        console.log("Adicionando a Fila")
        const atendimento = new Fila({
            from,
            timestamp,
            botStage,
            status
        })
        try {
            const newAtendimento = await atendimento.save();
            console.log("Adicionado na fila com sucesso")
            Ura.uraAtendimento(newAtendimento)
        } catch (err) {
            return console.log(err)
        }
    }

    static alteraStatus() {
        console.log("Alterando Status")

    }

    static async alteraBotStage(atendimento, estagio) {
        console.log("Alterando BotStage")
        let botStage = estagio

        try {
            const fila = await Fila.findByIdAndUpdate(
                atendimento._id,
                { botStage },
                { new: true }
            );

            if (!fila) {
                return console.log('Fila nao encontrada');
            }
            console.log("Estagio alterado")


        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

    }
}

export default fila