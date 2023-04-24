const token = "ConectaCargo"
const mytoken = "ConectaCargo"

class whatsapp {

    static Validacao = (req, res) => {
        res.status(200).send({
            "id": 1,
            "nome": "Whatsapp"
        })
    }

    static Mensagem = (req, res) => {
        res.status(200).send({
            "id": 1,
            "imagem": "https://github.com/wesleymo22.png",
            "nome": "Wesley Moraes",
            "mensagem": "Ola tudo bem?",
            "horario": "12:36"
        })
    }
}

export default whatsapp