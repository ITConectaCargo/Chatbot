import mensagens from "../models/mensagem.js"

class bot {

    static listaMensagens = async (req, res) => {
        try {
            const mensagem = await mensagens.find();
            res.json(mensagem);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

export default bot