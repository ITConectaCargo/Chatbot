import Nfe from '../models/nfe'

class nfe{

    static consultaNfe = async (req, res) => {
        try {
            const nf = await Nfe.find()
            res.status(200).send(nf)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

    static consultaNfeByContatoId = async (req, res) => {
        try {
            const nf = await Nfe.find({client: fila.from})
            res.status(200).send(nf)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

}

export default nfe