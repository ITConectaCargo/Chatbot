import Fila from '../models/fila.js'
import Ura from "./uraController.js"

class fila {

    static consutaStatus = async (req, res) => {
        try {
            const fila = await Fila.find()
                .populate("from")
                .exec()
            res.status(200).send(fila)
        } catch (error) {
            res.status(404).send(error)
        }
    }

    static alteraStatus = async (req, res) => {
        const _id = req.body._id
        const status = req.body.status
        try {
            const newFila = await Fila.findByIdAndUpdate(
                _id,
                { status },
                { new: true }
            )
                .populate("from")
                .exec();

            if (!newFila) {
                console.log('Fila nao encontrada');
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).send(newFila)
        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

    }

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

    static async adicionaNaFila(mensagem, botStage, status) {
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

    static async alteraBotStage(fila, botStage) {
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
            return newFila

        } catch (err) {
            return console.log(err);
        }
    }
}

export default fila