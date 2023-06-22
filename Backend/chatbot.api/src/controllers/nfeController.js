import axios from 'axios'
import Nfe from '../models/nfe.js'
import dotenv from 'dotenv'
import Coleta from './coletasController.js'
dotenv.config()

const baseURL = process.env.BASEURL

class nfe {

    static atualizaNfById = async (req, res) => {
        const id = req.params.id
        const dados = req.body
        try {
            const nf = await Nfe.findByIdAndUpdate(
                id,
                {
                    status: dados.status
                },
                { new: true }
            )
            res.status(200).send(nf)
        } catch (error) {
            res.status(500).send({ message: error })
        }
    }

    static criaNfBySql = async (dadosSql, contatoId, embarcador) => {
        console.log(dadosSql.length)
        if (dadosSql.length >= 1) {
            console.log(`Achei ${dadosSql.length} Nfs`)
            for (let contador = 0; contador < dadosSql.length; contador++) {
                let element = dadosSql[contador] // seleciona os dados do SQL 
                let existeNota = ""
                try {
                    existeNota = await Nfe.findOne({ key: element.chaveNfe });
                } catch (error) {
                    console.log(error)
                }

                if (!existeNota || existeNota === "") {
                    console.log("NF nao existe")

                    try {
                        console.log("criando NF")
                        const nota = new Nfe({
                            client: contatoId,
                            key: element.chaveNfe,
                            product: element.descricaoProduto,
                            value: element.valorTotalNf,
                            shipper: embarcador._id,
                        })

                        const newNota = await nota.save()
                        return newNota;
                    } catch (error) {
                        console.log(error)
                    }
                }
                else {
                    return existeNota
                }
            }
        }
        else if (dadosSql) {
            return await this.criaNfBySql([dadosSql], contatoId, embarcador)
        }
    }

    static deletaNfeHoje = async (clienteId) => {
        try {
            const hoje = new Date();
            hoje.setUTCHours(0, 0, 0, 0);

            // Excluindo os documentos do cliente criados na data de hoje
            await Nfe.deleteMany({ client: clienteId, date: { $gte: hoje } });
            console.log('NFes do cliente excluídas com sucesso.');
        } catch (err) {
            console.error('Ocorreu um erro ao excluir as NFes do cliente:', err);
        }
    }

    static validacaoCpfCnpj = (cpfCnpj) => {
        // Função para validar CPF
        cpfCnpj = cpfCnpj.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

        // Verifica se o CPF possui 11 dígitos
        if (cpfCnpj.length === 11) {
            // Calcula o primeiro dígito verificador
            let soma = 0;
            for (let i = 0; i < 9; i++) {
                soma += parseInt(cpfCnpj.charAt(i)) * (10 - i);
            }

            let primeiroDigito = 11 - (soma % 11);
            if (primeiroDigito > 9) {
                primeiroDigito = 0;
            }

            // Calcula o segundo dígito verificador
            soma = 0;
            for (let i = 0; i < 10; i++) {
                soma += parseInt(cpfCnpj.charAt(i)) * (11 - i);
            }
            let segundoDigito = 11 - (soma % 11);
            if (segundoDigito > 9) {
                segundoDigito = 0;
            }

            // Verifica se os dígitos verificadores são iguais aos últimos dígitos do CPF
            if (primeiroDigito.toString() === cpfCnpj.charAt(9) && segundoDigito.toString() === cpfCnpj.charAt(10)) {
                return true;
            }

            return false;

        }
        // Verifica se o CNPJ possui 14 dígitos
        else if (cpfCnpj.length === 14) {
            // Verifica se o CNPJ possui 14 dígitos
            if (cpfCnpj.length !== 14) {
                return false;
            }

            // Calcula o primeiro dígito verificador
            let soma = 0;
            let peso = 2;
            for (let i = 11; i >= 0; i--) {
                soma += parseInt(cpfCnpj.charAt(i)) * peso;
                peso = peso === 9 ? 2 : peso + 1;
            }
            let primeiroDigito = 11 - (soma % 11);
            if (primeiroDigito > 9) {
                primeiroDigito = 0;
            }

            // Calcula o segundo dígito verificador
            soma = 0;
            peso = 2;
            for (let i = 12; i >= 0; i--) {
                soma += parseInt(cpfCnpj.charAt(i)) * peso;
                peso = peso === 9 ? 2 : peso + 1;
            }
            let segundoDigito = 11 - (soma % 11);
            if (segundoDigito > 9) {
                segundoDigito = 0;
            }
            // Verifica se os dígitos verificadores são iguais aos últimos dígitos do CNPJ
            if (primeiroDigito.toString() === cpfCnpj.charAt(12) && segundoDigito.toString() === cpfCnpj.charAt(13)) {
                return true;
            }

            return false;
        }
        else {
            return false
        }
    }

}

export default nfe