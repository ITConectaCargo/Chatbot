const token = ""
const mytoken = "ConectaCargo"

class whatsapp {

    static Validacao = (req, res) => {
        let mode = req.query["hub.mode"]
        let challenge = req.query["hub.challenge"]
        let token = req.query["hub.verify_token"]

        if (mode && token) {
            if (mode === "subscribe" && token === mytoken) {
                res.status(200).send(challenge)
            }
            else {
                res.status(403)
            }
        }
    }

    static Mensagem = (req, res) => {
        let body_param = req.body

        console.log(JSON.stringify(body_param, null, 2))

        if (body_param.object) {
            if (body_param.entry &&
                body_param.entry[0].changes[0] &&
                body_param.entry[0].changes[0].value.message &&
                body_param.entry[0].changes[0].value.message[0]
            ) {
                let phoneNumberID = body_param.entry[0].changes[0].value.metadata.phone_number_id
                let from = body_param.entry[0].changes[0].value.messages[0].from
                let msgBody = body_param.entry[0].changes[0].value.messages[0].text.body

                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v13.0/" + phoneNumberID + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: "Hi... I'm Wesley"
                        }
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                res.sendStatus(200)
            }
            else {
                res.sendStatus(404)
            }
        }
    }
}

export default whatsapp