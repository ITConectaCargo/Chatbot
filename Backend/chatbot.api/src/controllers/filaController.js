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

    static consutaByContato = async (req, res) => {
        const contato = req.params.contato //recebe o valor via parametro
        try {
            const fila = await Fila.findOne({ from: contato }) //procura no banco se existe este status
                .sort({ date: -1 }) //busca pela ultima data
                .populate("from")
                .exec()

            res.status(200).json(fila)
        } catch (error) {
            console.log(error)
            res.status(404).send(error)
        }
    }

    static consutaByStatus = async (req, res) => {
        const status = req.params.status //recebe o valor via parametro
        const usuario = req.body
        try {
            const fila = await Fila.find({ status: status }) //procura no banco se existe este status
                .sort({ user: usuario._id })
                .populate("from")
                .exec()

            res.status(200).json(fila)
        } catch (error) {
            console.log(error)
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
                element.user = user._id // adiciona usuario ao atendimento
                await element.save()
            });

            res.status(200).json(fila) //envia resposta
        } catch (error) {
            res.status(404).send(error) //envia erro
        }
    }

    static alteraFila = async (req, res) => {
        const _id = req.body._id //Pega Id da requisicao
        try {
            const fila = await Fila.findByIdAndUpdate(
                _id, //busca fila pelo Id
                {
                    status: req.body.status,
                    department: req.body.department,
                    user:  req.body.user
                }, 
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
            return res.status(500).send('Internal Server Error'); //envia Erro
        }
    }

    static async verificaAtendimento(mensagem) {
        console.log("verificando atendimento")
        let fila = ""
        let botStage = ""
        let status = ""

        try {
            fila = await Fila.findOne({ from: mensagem.from }) //verifica se telefone esta na fila
                .sort({ date: -1 }) //busca pela ultima data
        } catch (error) {
            console.log(error)
        }

        if (fila) {
            //se status for finalizado
            if (fila.status == "finalizado") {
                console.log("status Finalizado")
                botStage = "0"
                status = "ura"
                this.adicionaNaFila(mensagem, botStage, status) //cria o atendimento novamente
            }
            //se status for URA
            else if (fila.status == "ura") {
                console.log("status URA")
                Ura.uraAtendimento(fila) // envia para ura de atendimento
            }
            //se nao existe contato na fila
        } else {
            botStage = "0"
            status = "ura"
            this.adicionaNaFila(mensagem, botStage, status) //Cria contato novo na fila
        }
    }

    static async adicionaNaFila(mensagem, botStage, status) {
        console.log("Adicionando a Fila")
        // pegando os dados da fila
        const atendimento = new Fila({
            from: mensagem.from,
            timestamp: mensagem.timestamp,
            botStage,
            department: "",
            status
        })
        try {
            const newAtendimento = await atendimento.save(); // salva os dados no BD
            console.log("Adicionado na fila com sucesso")
            Ura.uraAtendimento(newAtendimento) // envia para a URA de atendimento
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
                { department: fila.department },
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