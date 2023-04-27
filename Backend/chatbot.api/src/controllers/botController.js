import fila from '../models/fila.js'
import whatsapp from './whatsappController.js'
class bot {
    static async verificaAtendimento(tel, timestamp) {
        const telTabela = await fila.find({ from: tel })
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
        const atendimento = new fila({
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

    static alteraBotStage() {
        console.log("Alterando BotStage")
    }

    static uraAtendimento(atendimento) {
        if(atendimento[0].botStage == 0){
            let texto = `Ola! Bem vindo a Conecta Cargo sou sua assistente virtual \n Por favor, informe seu Nome para prosseguirmos o atendimento. \U+00a0`
            
            whatsapp.enviaMensagem(atendimento[0].from, texto)
            this.alteraBotStage()
        }
    }
}

export default bot