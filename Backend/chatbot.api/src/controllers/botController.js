import Fila from '../models/fila.js'
import Whatsapp from './whatsappController.js'
import MensagemAutomatica from '../models/mensagemAutomatica.js'
class bot {
    static async verificaAtendimento(tel, timestamp) {
        const telTabela = await Fila.find({ from: tel })
        const hora = timestamp * 1000 //transforma o timestamp em milisengundos
        let botStage = ""
        let status = ""

        if (telTabela != "") {
            console.log(`telefone: ${telTabela[0].from} Encontrado`)
            if (telTabela[0].status == "finalizado") {
                botStage = "0"
                status = "ura"
                console.log("Adicionando a Fila")
                this.adicionaNaFila(tel, hora, botStage, status)
            }
            else if (telTabela[0].status == "ura") {
                console.log("enviando para URA")
                this.uraAtendimento(telTabela)
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
        const atendimento = new Fila({
            from,
            timestamp,
            botStage,
            status
        })
        try {
            const newAtendimento = await atendimento.save();
            console.log("adicionado na fila com sucesso")
            this.uraAtendimento(newAtendimento)
        } catch (err) {
            return console.log(err)
        }
    }

    static alteraStatus() {
        console.log("Alterando Status")

    }

    static async alteraBotStage(atendimento, estagio) {
        console.log("Alterando BotStage")
        const { botStage } = estagio
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

    static uraAtendimento(atendimento) {
        console.log(atendimento)

        if (atendimento[0].botStage == 0) {
            let texto = `Ola! Bem vindo a Conecta Cargo sou sua assistente virtual \n Por favor, informe seu Nome para prosseguirmos o atendimento. \U+00a0`

            Whatsapp.enviaMensagem(atendimento[0].from, texto)
            this.alteraBotStage(atendimento, "1")
        }
        else if (atendimento[0].botStage == 1) {
            let texto = "Digite a opção desejada" + "\n1-SAC" + "\n2-Comercial" + "\n3-Motoristas" + "\n3-Sair"

            Whatsapp.enviaMensagem(atendimento[0].from, texto)
            this.alteraBotStage(atendimento, "2")
        }

    }
}

export default bot