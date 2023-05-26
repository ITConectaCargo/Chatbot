import axios from 'axios';
import Contatos from '../models/contato.js';
import dbSql from '../config/dbSqlConfig.js'
import Nfe from '../models/nfe.js';
const baseURL = 'http://localhost:9000/'

class coleta {

    static consultaByTelefone = async (tel) => {
        const telefone = tel.slice(2); //retira o 55 do numero
        const query = `
            SELECT DISTINCT tbl_coleta.cpfCnpj, clientes.nomeCliente, tbl_coleta.valorTotalNf, tbl_coleta.chaveNfe, tbl_coleta_produto.descricaoProduto, marketplace.nomeMkt
            FROM tbl_coleta, clientes, mktclientesnfe, tbl_coleta_produto, marketplace
            WHERE clientes.foneCliente = ${telefone}
            AND tbl_coleta.cnpjCpf = marketplace.cnpjCpf
            AND tbl_coleta.cpfCnpj = clientes.cpfCnpj
            AND clientes.cpfCnpj = tbl_coleta.cpfCnpj
            AND tbl_coleta.chaveNfe = mktclientesnfe.chaveNFe
            AND mktclientesnfe.codProduto = tbl_coleta_produto.codProduto;
        `;

        return new Promise((resolve, reject) => {
            dbSql.query(query, [telefone], (error, results) => {
                if (error) {
                    console.error('Erro ao executar a consulta: ' + error.stack);
                    reject({ message: 'Erro ao buscar dados.' });
                } else {
                    let dados = results;
                    console.log(dados);
                    resolve(dados[0]);
                }
            });
        });
    }

    //---------------------------------------------------------------

    static verificaMongo = async (dadosSql, telefone) => {
        let contato = ""

        try {
            contato = await Contatos.findOne({ tel: telefone }) // verifica contato no banco mongo
            console.log(`Encontrei o contato ${contato.tel}`)
        } catch (error) {
            console.log(`contato esta vazio`)
        }

        if (!contato || contato === "") {//se contato esta vazio
            try {
                //cria contato no BD
                const cliente = new Contatos({
                    tel: telefone,
                    name: dadosSql.nomeCliente,
                    nameWhatsapp: dadosSql.nomeCliente,
                    cpfCnpj: dadosSql.cpfCnpj,
                })

                contato = await cliente.save()
                console.log(contato)
            } catch (error) {
                console.log(error)
            }
        }

        if (contato || contato !== "") { //se contato nao esta vazio
            console.log("contato preenchido")
            console.log(contato)
            let existeNota = ""
            try {
                existeNota = await Nfe.findOne({ key: dadosSql.chaveNfe });
                console.log("existe nota?")
                console.log(existeNota)
            } catch (error) {
                console.log("Nf nao localizada")
            }

            if (!existeNota || existeNota === "") {
                try {
                    console.log("criando NF")
                    const nota = {
                        client: contato._id,
                        key: dadosSql.chaveNfe,
                        product: dadosSql.descricaoProduto,
                        value: dadosSql.valorTotalNf,
                        shipper: dadosSql.nomeMkt
                    };

                    const newNota = await Nfe.create(nota);
                    console.log(newNota);
                } catch (error) {
                    console.log(error)
                }
            }
        }
        return contato
    }

    static consultaAgendamento = async (req, res) => {
        const tokenEsl = "qxYaURbavegtz2sLsZjAVxsLT-a-_i2r_BE7yxzVTP_TvjsuuYWQ9w"
        const chaveNfe = req.params.chaveNfe

        axios.get(`https://conecta.eslcloud.com.br/api/invoice_occurrences?invoice_key=${chaveNfe}`, {
            headers: {
                Authorization: `Bearer ${tokenEsl}`
            }
        })
            .then(resposta => {
                res.status(200).send(resposta.data)
            })
            .catch(error => {
                console.log(error)
                res.status(500).json(error)
            })


    }
}

export default coleta