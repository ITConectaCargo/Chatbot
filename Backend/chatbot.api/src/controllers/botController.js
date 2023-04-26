
class bot {

    static listaMensagens = async (req, res) => {
        let mensagem = req.body
        console.log(mensagem)
        res.status(200).json(mensagem)
    }

    static criaMensagens = async (req, res) => {
        let mensagem = req.body
        console.log(mensagem)
        res.status(200).json(mensagem)
    }
    
}

export default bot