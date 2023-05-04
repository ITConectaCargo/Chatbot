import Contatos from "../models/contato.js"

class contato {

    static consultaContato = (req, res) => {

    }

    static consultaContatoById = async (req, res) => {
        const telefone = req.params.telefone;
        try {
            const contato = await Contatos.findOne({ tel: telefone });
            res.status(200).json(contato);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static criarContato = async (req, res) => {
        console.log("criando")
        try {
            const contato = new Contatos({
                name: req.body.name,
                tel: req.body.tel
            })
            const novoContato = await contato.save();
            res.status(201).json(novoContato);
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static atualizaContato = (req, res) => {

    }
}

export default contato