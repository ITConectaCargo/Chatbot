import twilio from "twilio"
const TWILIO_ACCOUNT_SID = "AC125d657d14d06c119aa5c3ff5050cd41"
const TWILIO_AUTH_TOKEN = "ab9616a1f36a1d8e79af000ed6354214"
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

//https://webhooks.twilio.com/v1/Accounts/AC125d657d14d06c119aa5c3ff5050cd41/Flows/FWdab332059c33e15e0691da3659f19522
//from: 'whatsapp:+14155238886',
//from: 'whatsapp:+5511965743864',

class bot {

    static Mensagens = async (req, res) => {
        let mensagem = req.body
        console.log(mensagem)
        res.status(200).json(mensagem)
    }

    /*
     static Mensagens = (req, res) => {
        client.messages
            .create({
                body: 'Ola teste vindo do Node.js',
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+5511948917149'
            })
            .then(message => {
                console.log(message.sid)
            })
            .catch(err => {
                console.error(err)
            })
    }
    */
}

export default bot