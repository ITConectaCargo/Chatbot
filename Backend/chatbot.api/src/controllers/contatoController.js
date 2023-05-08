import Contatos from "../models/contato.js"

class contato {

    static consultaContato = async (req, res) => {
        try {
            const tel = await Contatos.find()
            res.status(200).send(tel)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

    static consultaContatoByTelefone = async (req, res) => {
        const telefone = req.params.telefone;
        try {
            const contato = await Contatos.findOne({ tel: telefone })
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
                nameWhatsapp: req.body.nameWhatsapp,
                tel: req.body.tel,
                cpfCnpj: req.body.cpfCnpj,
                address: req.body.address                
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