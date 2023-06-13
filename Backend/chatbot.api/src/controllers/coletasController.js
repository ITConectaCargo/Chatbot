import Contatos from '../models/contato.js';
import Feriados from '../models/feriado.js';
import dbSql from '../config/dbSqlConfig.js'
import Nfe from '../models/nfe.js';
import Nf from './nfeController.js';
import Contato from './contatoController.js';
import Embarcador from './embarcadorController.js';
import fs from 'fs';
import pdfjs from 'pdfjs-dist';
import moment from 'moment'
import dotenv from 'dotenv'
dotenv.config()

const baseURL = process.env.BASEURL
import axios from 'axios';
import fetch from 'node-fetch';

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
                marketplace.cnpjCpf,
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

    static consultaByCpfCnpj = async (cpfCnpj) => {
        try {
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
                marketplace.cnpjCpf,
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
                clientes.cpfCnpj = ${cpfCnpj};
        `;

            return new Promise((resolve, reject) => {
                dbSql.query(query, [cpfCnpj], (error, results) => {
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
        } catch (error) {
            console.log(error)
        }
    }

    static consultaByNf = async (nota) => {
        if (nota.length !== 9) {
            nota = String(nota).padStart(9, '0') //adiciona zeros a esquerda ate dar 9 digitos
        }

        try {
            const query = `SELECT DISTINCT
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
            marketplace.cnpjCpf,
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
            RIGHT(tbl_coleta.chaveNfe, 25) LIKE '%${nota}%';`;

            return await new Promise((resolve, reject) => {
                dbSql.query(query, [nota], (error, results) => {
                    if (error) {
                        console.error('Erro ao executar a consulta: ' + error.stack);
                        reject({ message: 'Erro ao buscar dados.' });
                    } else {
                        let dados = results;
                        resolve(dados);
                    }
                });
            });
        } catch (error) {
            console.log(error)
            return []
        }
    }

    static verificaMongo = async (dadosSql, telefone) => {
        let contato = ""

        try {
            contato = await Contatos.findOne({ tel: telefone }) // verifica contato no banco mongo
            console.log(`Encontrei o contato ${contato.tel}`)
        } catch (error) {
            console.log(`contato esta vazio`)
        }

        if (!contato || contato === "") { //se contato esta vazio
            try {
                contato = await Contato.criarContatoBySql(dadosSql, telefone)
            } catch (error) {
                console.log(error)
            }
        }

        if (contato || contato !== "") { //se contato nao esta vazio
            console.log("contato preenchido")
            let existeNota = ""
            try {
                existeNota = await Nfe.exists({ key: dadosSql.chaveNfe });
                console.log("existe nota")
            } catch (error) {
                console.log("Nf nao localizada")
            }

            if (!existeNota || existeNota === "") {
                let embarcador = await Embarcador.criaEmbarcadorSql(dadosSql)
                await Nf.criaNfBySql(dadosSql, contato._id, embarcador)
            }
        }
        return contato
    }

    static consultaAgendamento = async (req, res) => {
        const chaveNfe = req.params.chaveNfe;

        try {
            const response = await fetch(`https://conecta.eslcloud.com.br/api/invoice_occurrences?invoice_key=${chaveNfe}`, {
                headers: {
                    Authorization: `Bearer qxYaURbavegtz2sLsZjAVxsLT-a-_i2r_BE7yxzVTP_TvjsuuYWQ9w`
                }
            });

            const dados = await response.json();
            res.status(200).json(dados.data);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static calculaDataAgendamento = async (dataNf, embarcador) => {
        let datasDisponiveis = []
        if (embarcador.appointmentLimit) {
            try {
                let data = moment(dataNf, 'YYYY-MM-DD')
                let diasAdicionados = 0;
                while (diasAdicionados < embarcador.appointmentLimit) {
                    data.add(1, 'days');
                    let feriado = await this.feriados(data)
                    if (data.isoWeekday() < 6 && feriado != "Feriado") {
                        // Adiciona apenas se não for sábado ou domingo
                        diasAdicionados++;
                        if (embarcador.daysWeek.includes(data.isoWeekday()) && diasAdicionados !== 1) { //verifica se o dia esta presente no array
                            datasDisponiveis.push(moment(data))
                        }
                    }
                }
                let melhorData = datasDisponiveis[0];
                return melhorData;
            } catch (error) {
                console.log(error)
            }
        }
        else {
            return "Sem Embarcador"
        }

    }

    static consultaChecklist = async (req, res) => {
        const chaveNFe = req.params.nf;
        const urlPDF = `http://inectar.com.br/modulos/Checklists_Magazine/35230647960950089785550510001634191072263707.pdf`;
        try {
            const response = await axios.get(urlPDF);
            const buffer = Buffer.from(response.data);

            const documento = await pdfjs.getDocument(buffer).promise;
            const numPaginas = documento.numPages;

            let conteudoPDF = '';

            for (let i = 1; i <= numPaginas; i++) {
                const pagina = await documento.getPage(i);
                const conteudoPagina = await pagina.getTextContent();

                const linhas = conteudoPagina.items.map(item => item.str);
                const conteudo = linhas.join('\n');

                conteudoPDF += conteudo;
            }
            res.status(200).send(conteudoPDF);
        } catch (error) {
            console.log(error)
        }
    }

    static feriados = async (data) => {
        const year = moment(data).format("YYYY") //pega apenas o ano
        const anoNovo = moment(`01/01/${year}`, 'DD/MM/YYYY').format('YYYY-MM-DD');

        //confere se feriados estao preenchidos no banco
        try {
            let feriado = await Feriados.exists({ date: anoNovo })
            if (!feriado) { //caso nao tenha dados no banco popula
                let listaFeriados = ""
                await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`)
                    .then(resposta => {
                        listaFeriados = resposta.data
                    })
                    .catch(error => console.log(error))

                for (let i = 0; i < listaFeriados.length; i++) {
                    let holyday = {
                        date: moment(listaFeriados[i].date).format('YYYY-MM-DD'),
                        name: listaFeriados[i].name,
                        type: listaFeriados[i].type
                    };
                    Feriados.create(holyday);
                }
            }
        } catch (error) {
            console.log(error)
        }

        try {
            let feriado = await Feriados.exists({ date: moment(data).format('YYYY-MM-DD') })

            if (feriado) {
                return "Feriado"
            }
            else {
                return "Não é Feriado"
            }
        } catch (error) {
            console.log(error)
        }
    }
}

export default coleta