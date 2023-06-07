import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const token = process.env.TOKEN

class mensagem {

    static identificaMensagem = (mensagem) => {
        if(mensagem.template === 'botao'){
            console.log("mensagem com botao")
            this.enviaMensagemBotao(mensagem)
        }
        else if(mensagem.template === "agendar_devolucao"){
            console.log("mensagem com template")
            this.enviaMensagemTemplate(mensagem)
        }
        else if(mensagem.template === "opcoes"){
            console.log("mensagem com opcoes")
            this.enviaMensagemOpcoes(mensagem)
        }
        else if(mensagem.template === "BotaoEditavel"){
            console.log("mensagem com opcoes")
            this.enviaMensagemBotaoEditavel(mensagem)
        }
        else if(mensagem.template === "naoApertouBotao"){
            console.log("mensagem naoApertouBotao")
            this.enviaMensagemNaoApertouBotao(mensagem)
        }
        else{
            console.log("mensagem normal")
            this.enviaMensagem(mensagem)
        }
    }

    static enviaMensagem(mensagem) {
        console.log("enviando mensagem")
        console.log(mensagem)
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const texto = mensagem.text
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: para,
                    text: {
                        body: texto
                    }
                },
                headers: {
                    "Authorization": "Bearer",
                    "Content-Type": "application/json"
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    static enviaMensagemBotao(mensagem) {
        console.log("enviando mensagem")
        console.log(mensagem)
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const texto = mensagem.text
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: para,
                    "type": "interactive",
                    "interactive": {
                        "type": "button",
                        "body": {
                            "text": texto
                        },
                        "action": {
                            "buttons": [
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "1",
                                        "title": "Sim"
                                    }
                                },
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "2",
                                        "title": "Não"
                                    }
                                }
                            ]
                        }
                    },
                    headers: {
                        "Authorization": "Bearer",
                        "Content-Type": "application/json"
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    static enviaMensagemBotaoEditavel(mensagem) {
        console.log("enviando mensagem")
        console.log(mensagem)
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const texto = mensagem.text
        const opcao1 = mensagem.parameters.opcao1
        const opcao2 = mensagem.parameters.opcao2
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: para,
                    "type": "interactive",
                    "interactive": {
                        "type": "button",
                        "body": {
                            "text": texto
                        },
                        "action": {
                            "buttons": [
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "1",
                                        "title": opcao1
                                    }
                                },
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "2",
                                        "title": opcao2
                                    }
                                }
                            ]
                        }
                    },
                    headers: {
                        "Authorization": "Bearer",
                        "Content-Type": "application/json"
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    static enviaMensagemOpcoes(mensagem) {
        console.log("enviando mensagem")
        console.log(mensagem)
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const texto = mensagem.text
        const opcao1 = mensagem.parameters.opcao1
        const opcao2 = mensagem.parameters.opcao2
        const opcao3 = mensagem.parameters.opcao3
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: para,
                    "type": "interactive",
                    "interactive": {
                        "type": "button",
                        "body": {
                            "text": texto
                        },
                        "action": {
                            "buttons": [
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "1",
                                        "title": opcao1
                                    }
                                },
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "2",
                                        "title": opcao2
                                    }
                                },
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "3",
                                        "title": opcao3
                                    }
                                }
                            ]
                        }
                    },
                    headers: {
                        "Authorization": "Bearer",
                        "Content-Type": "application/json"
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    static enviaMensagemTemplate(mensagem) {
        console.log("enviando mensagem")
        console.log(mensagem)
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const nome = mensagem.parameters.name
        const product = mensagem.parameters.product
        const shipper = mensagem.parameters.shipper
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: para,
                    "type": "template",
                    "template": {
                        "namespace": "0784a13b_2167_46d5_b80c_2c2e89b5b240",
                        "name": "agendar_devolucao",
                        "language": {
                            "code": "pt_BR"
                        },
                        "components": [
                            {
                                "type": "header",
                                "parameters": [
                                    {
                                        "type": "text",
                                        "text": nome
                                    },
                                ]
                            },
                            {
                                "type": "body",
                                "parameters": [
                                    {
                                        "type": "text",
                                        "text": product
                                    },
                                    {
                                        "type": "text",
                                        "text": shipper
                                    },
                                ]
                            }
                        ]
                    }
                },
                headers: {
                    "Authorization": "Bearer",
                    "Content-Type": "application/json"
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    static enviaMensagemNaoApertouBotao(mensagem) {
        console.log("enviando mensagem")
        console.log(mensagem)
        const para = mensagem.to
        const telefoneId = mensagem.phoneId
        const texto = `Xiii, algo de errado não esta certo 😬\n\n`
        + `Não consegui compreender o que você me disse\n\n`
        + `Clique em um dos botoes da ultima mensagem`
        
        try {
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v16.0/" + telefoneId + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: para,
                    text: {
                        body: texto
                    }
                },
                headers: {
                    "Authorization": "Bearer",
                    "Content-Type": "application/json"
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default mensagem