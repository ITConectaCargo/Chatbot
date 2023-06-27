import Embarcador from '../models/embarcador.js'

class embarcador {
    static criaEmbarcadorSql = async (dados) => {
        let existeEmbarcador = ""

        try {
            existeEmbarcador = await Embarcador.findOne({ cpfCnpj: dados.cnpjCpf })
        } catch (error) {
            console.log(error)
        }

        if (!existeEmbarcador) {
            try {
                const embarcador = new Embarcador(
                    {
                        cpfCnpj: dados.cnpjCpf,
                        name: dados.nomeMkt,
                        city: dados.cidadeEmbarcador,
                        state: dados.ufEmbarcador,
                    }
                )
                const newEmbarcador = await embarcador.save()
                return newEmbarcador
            } catch (error) {
                return error
            }
        }
        else {
            return existeEmbarcador
        }
    }
}

export default embarcador