import axios from 'axios'
import Nfe from '../models/nfe.js'

class nfe {

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
            const nf = await Nfe.find({ client: fila.from })
            res.status(200).send(nf)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

    static atualizaNfById = async (req, res) => {
        const id = req.params.id
        const dados = req.body
        try {
            const nf = await Nfe.findByIdAndUpdate(
                id,
                {
                    appointmentDate: dados.appointmentDate,
                    status: dados.status
                },
                { new: true }
            )
            res.status(200).send(nf)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

    static criaNfBySql = async (dadosSql, contatoId) => {
        if (dadosSql.length >= 1) {
            console.log(`Achei ${dadosSql.length} Nfs`)
            for (let contador = 0; contador <= dadosSql.length; contador++) {
                let element = dadosSql[contador]
                let existeNota = ""
                try {
                    existeNota = await Nfe.findOne({ key: element.chaveNfe });
                    console.log("existe nota")
                } catch (error) {
                    console.log("Nf nao localizada")
                }

                if (!existeNota || existeNota === "") {
                    let coletaStatus = ""
                    let dataFrete = ""

                    try {
                        console.log("consultando ESL")
                        await axios.get(`http://localhost:9000/coleta/agendamento/${element.chaveNfe}`)
                            .then(resposta => {
                                const ultimoObjeto = resposta.data.pop();
                                const primeiroObjeto = resposta.data[0]
                                coletaStatus = ultimoObjeto.occurrence.code //pega o codigo do status
                                dataFrete = primeiroObjeto.created_at //pega data do frete
                            })
                            .catch(error => console.log(error))
                    } catch (error) {
                        console.log(error)
                    }

                    try {
                        console.log("criando NF")
                        const nota = {
                            client: contatoId,
                            key: element.chaveNfe,
                            freightDate: dataFrete,
                            product: element.descricaoProduto,
                            value: element.valorTotalNf,
                            status: coletaStatus,
                            shipper: element.nomeMkt
                        };

                        const newNota = await Nfe.create(nota);
                        console.log(newNota);
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }
    }

}

export default nfe