import Contatos from "../models/contato.js"
import Autenticacao from "../models/autenticacao.js"

class contato {

    static consultaContato = async (req, res) => {
        try {
            const contato = await Contatos.find()
            res.status(200).send(contato)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

    static consultaContatoByToken = async (req, res) => {
        let token = ''

        try {
            token = await Autenticacao.findById({ token: req.params.token })
                .populate('userId')
                .exec()

            console.log(token)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: error.message });
        }

        try {
            const contato = await Contatos.findOne({ tel: token.userId._id })
            res.status(200).json(contato);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static consultaContatoByTelefone = async (req, res) => {
        let telefone = req.params.telefone;
        try {
            const contato = await Contatos.findOne({ tel: telefone })
            return res.status(200).json(contato);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static consultaContatoByTelefoneApi = async (telefone) => {
        try {
            const contato = await Contatos.findOne({ tel: telefone })
            return contato;
        } catch (error) {
            console.log(error)
        }
    }

    static criarContato = async (req, res) => {
        console.log("criando")
        const dados = req.body
        try {
            const contato = new Contatos({
                name: dados.name,
                nameWhatsapp: dados.nameWhatsapp,
                tel: dados.tel,
                cpfCnpj: dados.cpfCnpj,
                address: dados.address
            })
            const novoContato = await contato.save();
            res.status(201).json(novoContato);
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static atualizaContato = async (req, res) => {
        const dados = req.body
        try {
            const contato = await Contatos.findByIdAndUpdate(
                { tel: dados.tel },
                {
                    name: dados.name,
                    nameWhatsapp: dados.nameWhatsapp,
                    cpfCnpj: dados.cpfCnpj,
                    address: {
                        street: dados.street,
                        district: dados.district,
                        city: dados.city,
                        state: dados.state,
                        cep: dados.cep,
                        complement: dados.complement,
                    }
                },
                { new: true } //retorna o valor atualizado
            )
            res.status(200).json(contato)
        } catch (error) {
            res.status(500).json(error)
        }



    }

    static criarContatoBySql = async (dadosSql, telefone) => {
        try {
            //cria contato no BD
            const cliente = new Contatos({
                tel: telefone,
                name: dadosSql.nomeCliente,
                nameWhatsapp: dadosSql.nomeCliente,
                cpfCnpj: dadosSql.cpfCnpj,
                address: {
                    street: dadosSql.logradouro,
                    number: dadosSql.numero,
                    district: dadosSql.bairro,
                    city: dadosSql.cidade,
                    state: dadosSql.uf,
                    cep: dadosSql.cep,
                    complement: dadosSql.complemento
                }
            })

            const contato = await cliente.save() //Salva contato no mongo
            return contato
        } catch (error) {
            console.log(error)
        }
    }

    static atualizaDadosContatoBySql = async (dadosSql, contatoId) => {
        const contato = await Contatos.findByIdAndUpdate(
            contatoId, //busca contato pelo Id
            {
                name: dadosSql.nomeCliente,
                nameWhatsapp: dadosSql.nomeCliente,
                cpfCnpj: dadosSql.cpfCnpj,
                address: {
                    street: dadosSql.logradouro,
                    district: dadosSql.bairro,
                    city: dadosSql.cidade,
                    state: dadosSql.uf,
                    cep: dadosSql.cep,
                    complement: dadosSql.complemento,
                }
            },
            { new: true } //retorna o valor atualizado
        )

        return contato
    }
}

export default contato