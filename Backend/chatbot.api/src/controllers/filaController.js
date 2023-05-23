import Fila from '../models/fila.js'
import Ura from "./uraController.js"

class fila {

    static consutaFila = async (req, res) => {
        try {
            const fila = await Fila.find()
                .populate("from")
                .exec()
            res.status(200).send(fila)
        } catch (error) {
            res.status(404).send(error)
        }
    }

    static consutaByStatus = async (req, res) => {
        const status = req.params.status //recebe o valor via parametro
        try {
            const fila = await Fila.find({ status: status }) //procura no banco se existe este status
                .populate("from")
                .exec()
            res.status(200).send(fila)
        } catch (error) {
            res.status(404).send(error)
        }
    }

    static consutaByEspera = async (req, res) => {
        const user = req.body
        try {
            const fila = await Fila.find({ status: "espera" }) // busca apenas os que estao em espera
                .sort({ date: 1 }) // Ordena por data em ordem crescente
                .limit(1) // Limita a quantidade de documentos retornados para 5
                .populate("from") // popula od dados do remetente
                .exec() // salva na variavel

            let cont = 0
            fila.forEach(async (element) => {
                element.status = "atendimento"; // Altera o campo status para "atendimento"
                element.user = user._id
                console.log(fila)

                await element.save()
            });

            console.log(cont)
            console.log(fila)

            res.status(200).json(fila) //envia resposta
        } catch (error) {
            res.status(404).send(error)
        }
    }

    static alteraStatus = async (req, res) => {
        const _id = req.body._id //Pega Id da requisicao
        const status = req.body.status //pega o status desejado
        try {
            const fila = await Fila.findByIdAndUpdate(
                _id, //busca fila pelo Id
                { status }, //altera status
                { new: true } //retorna o valor atualizado
            )
                .populate("from") //popula os dados do remetente
                .exec(); //salva na variavel

            if (!fila) {
                return res.status(500).send('Internal Server Error'); //se der erro retorna erro no servidor
            }

            res.status(200).send(fila) //envia os dados da fila
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
            //recoloca na fila
            if (fila.status == "finalizado") {
                console.log("status Finalizado")
                botStage = "0"
                status = "ura"
                this.adicionaNaFila(mensagem, botStage, status)
            }
            //envia para URA
            else if (fila.status == "ura") {
                console.log("status URA")
                Ura.uraAtendimento(fila)
            }
            //Cria contato na fila
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