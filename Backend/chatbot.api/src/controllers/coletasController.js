import Contatos from '../models/contato.js';
import dbSql from '../config/dbSqlConfig.js'
import Nfe from '../models/nfe.js';

class coleta {

    static consultaByTelefone = async (tel) => {
        const telefone = tel.slice(2); //retira o 55 do numero
        const query = `
            SELECT DISTINCT
                tbl_coleta.cpfCnpj,
                clientes.nomeCliente,
                clientes.logradouro,
                clientes.numero,
                clientes.bairro,
                clientes.cidade,
                clientes.uf,
                clientes.cep,
                clientes.complemento,
                tbl_coleta.valorTotalNf,
                tbl_coleta.chaveNfe,
                tbl_coleta_produto.descricaoProduto,
                marketplace.nomeMkt
            FROM
                tbl_coleta
            INNER JOIN
                clientes ON tbl_coleta.cpfCnpj = clientes.cpfCnpj
            INNER JOIN
                marketplace ON tbl_coleta.cnpjCpf = marketplace.cnpjCpf
            INNER JOIN
                mktclientesnfe ON tbl_coleta.chaveNfe = mktclientesnfe.chaveNFe
            INNER JOIN
                tbl_coleta_produto ON mktclientesnfe.codProduto = tbl_coleta_produto.codProduto
            WHERE
                clientes.foneCliente = ${telefone};
        `;

        return new Promise((resolve, reject) => {
            dbSql.query(query, [telefone], (error, results) => {
                if (error) {
                    console.error('Erro ao executar a consulta: ' + error.stack);
                    reject({ message: 'Erro ao buscar dados.' });
                } else {
                    let dados = results;
                    console.log(dados);
                    resolve(dados);
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
                let coleta = ""
                /*
                try {
                    coleta = await this.consultaAgendamento(dadosSql.chaveNfe)
                    console.log(coleta)
                } catch (error) {
                    console.log(error)
                }
                */

                try {
                    console.log("criando NF")
                    const nota = {
                        client: contato._id,
                        key: dadosSql.chaveNfe,
                        product: dadosSql.descricaoProduto,
                        value: dadosSql.valorTotalNf,
                        status: "",
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
        const chaveNfe = req.params.chaveNfe

        await axios.get(`https://conecta.eslcloud.com.br/api/invoice_occurrences?invoice_key=${chaveNfe}`, {
            headers: {
                Authorization: `Bearer qxYaURbavegtz2sLsZjAVxsLT-a-_i2r_BE7yxzVTP_TvjsuuYWQ9w`
            }
        })
            .then(resposta => {
                console.log(resposta.data)
                res.status(200).json(resposta.data)
            })
            .catch(error => {
                console.log(error)
                res.status(500).json(error)
            })
    }
}

export default coleta