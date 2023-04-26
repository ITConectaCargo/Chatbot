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

    static criaMensagens = async (req, res) => {
        const { id, name, from, to, text } = req.body;

        const mensagem = new mensagens({
            id,
            name,
            from,
            to,
            text
        });

        try {
            const newMensagem = await mensagem.save();
            res.status(201).json(newMensagem);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

export default bot