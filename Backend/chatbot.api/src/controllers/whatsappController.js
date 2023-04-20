class whatsapp {
    
    static mensagem = (req, res) => {
        res.status(200).send({
            "id": 1,
            "imagem": "https://github.com/wesleymo22.png",
            "nome": "Wesley Moraes",
            "mensagem": "Ola tudo bem?",
            "horario": "12:36"
        });
    }
}

export default whatsapp