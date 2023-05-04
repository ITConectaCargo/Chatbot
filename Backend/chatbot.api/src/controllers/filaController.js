import Fila from '../models/fila.js'
import Ura from "./uraController.js"

class fila {
    static async verificaAtendimento(mensagem) {
        console.log("verificando atendimento")
        let fila = ""
        let botStage = ""
        let status = ""

        //verifica se telefone esta na fila
        try {
            fila = await Fila.findOne({ from: mensagem.from })
        } catch (error) {
            console.log(error)
        }

        if (fila) {
            if (fila.status == "finalizado") {
                console.log("status Finalizado")
                botStage = "0"
                status = "ura"
                this.adicionaNaFila(mensagem, botStage, status)
            }
            else if (fila.status == "ura") {
                console.log("status URA")
                Ura.uraAtendimento(fila)
            }
        } else {
            botStage = "0"
            status = "ura"
            this.adicionaNaFila(mensagem, botStage, status)
        }
    }

    static async adicionaNaFila(mensagem, botStage, status){
        console.log("Adicionando a Fila")
        const atendimento = new Fila({
            from: mensagem.from,
            timestamp: mensagem.timestamp,
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

    static async alteraBotStage(fila, botStage){
        console.log("Alterando BotStage")

        try {
            const newFila = await Fila.findByIdAndUpdate(
                fila._id,
                { botStage },
                { new: true }
            );

            if (!newFila) {
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