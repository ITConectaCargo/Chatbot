import twilio from "twilio"
const TWILIO_ACCOUNT_SID = "AC125d657d14d06c119aa5c3ff5050cd41"
const TWILIO_AUTH_TOKEN = "ab9616a1f36a1d8e79af000ed6354214"
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

class bot {
     static Mensagens = (req, res) => {
        client.messages
            .create({
                body: 'Ola teste vindo do Node.js',
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+5511997397199'
            })
            .then(message => {
                console.log(message.sid)
            })
            .catch(err => {
                console.error(err)
            })
    }
}

export default bot