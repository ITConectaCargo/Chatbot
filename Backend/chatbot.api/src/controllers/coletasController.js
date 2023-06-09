import Contatos from '../models/contato.js';
import Feriados from '../models/feriado.js';
import Nfe from '../models/nfe.js';
import Agendamento from '../models/agendamento.js';
import dbSql from '../config/dbSqlConfig.js'
import Nf from './nfeController.js';
import Checklist from './checklistController.js';
import Contato from './contatoController.js';
import Embarcador from './embarcadorController.js';
import { request } from 'graphql-request';
import moment from 'moment'
import axios from 'axios';
import fetch from 'node-fetch';
import dotenv from 'dotenv'
dotenv.config()

const baseURL = process.env.BASEURL

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
                marketplace.uf as ufEmbarcador,
                marketplace.cidade as cidadeEmbarcador,
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
                clientes.foneCliente = ${telefone}
        `;

        return new Promise((resolve, reject) => {
            dbSql.query(query, [telefone], (error, results) => {
                if (error) {
                    console.error('Erro ao executar a consulta: ' + error.stack);
                    reject({ message: 'Erro ao buscar dados.' });
                } else {
                    resolve(results);
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
                marketplace.uf as ufEmbarcador,
                marketplace.cidade as cidadeEmbarcador,
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
                        resolve(results);
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
            marketplace.uf as ufEmbarcador,
            marketplace.cidade as cidadeEmbarcador,
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
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.log(error)
            return []
        }
    }

    static consultaDeploySql = async (raizCnpj) => {
        try {
            const query = `
            SELECT * FROM bot_deploy WHERE raizCnpj = ${raizCnpj}
            `;

            return new Promise((resolve, reject) => {
                dbSql.query(query, [raizCnpj], (error, results) => {
                    if (error) {
                        console.error('Erro ao executar a consulta: ' + error.stack);
                        reject({ message: 'Erro ao buscar dados.' });
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.log(error)
        }
    }

    static consultaChecklistSql = async (raizCnpj) => {
        try {
            const query = `
            SELECT * FROM bot_checklist WHERE raizCnpj = ${raizCnpj}
            `;

            return new Promise((resolve, reject) => {
                dbSql.query(query, [raizCnpj], (error, results) => {
                    if (error) {
                        console.error('Erro ao executar a consulta: ' + error.stack);
                        reject({ message: 'Erro ao buscar dados.' });
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.log(error)
        }
    }

    static consultaDiasColetaSql = async (cnpj, cep) => {
        try {
            const query = `
            SELECT *
                FROM tbl_dias_coleta
                WHERE raizCnpj = ${cnpj} AND ${cep} BETWEEN cepDe AND cepAte
            `;

            return new Promise((resolve, reject) => {
                dbSql.query(query, [cnpj, cep], (error, results) => {
                    if (error) {
                        console.error('Erro ao executar a consulta: ' + error.stack);
                        reject({ message: 'Erro ao buscar dados.' });
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.log(error)
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
                existeNota = await Nfe.findOne({ key: dadosSql.chaveNfe });
            } catch (error) {
                console.log("Nf nao localizada")
            }

            if (!existeNota || existeNota === "") {
                console.log("Nao existe nota")
                const embarcador = await Embarcador.criaEmbarcadorSql(dadosSql)
                const nota = await Nf.criaNfBySql(dadosSql, contato._id, embarcador)
                await this.criaAgendamento(contato, element._id, embarcador._id, element.key); // Cria agendamento
            }
            else {
                const agenda = await Agendamento.findOne({ nfe: existeNota._id })
                const els = await this.consultaAgendamento(existeNota.key)

                if (els.coletaStatus != agenda.status) {
                    agenda.status = els.coletaStatus
                    agenda.statusDescription = els.descricao
                    await this.atualizaAgendamento(agenda)
                }
            }

        }
        return contato
    }

    static criaAgendamento = async (cliente, nfeId, embarcadorId, chaveNfe, protocolo) => {
        const agendamentoStatus = await this.consultaAgendamento(chaveNfe)
        const checklist = await Checklist.consultaChecklist(chaveNfe)

        try {
            const agendamento = {
                protocol: protocolo,
                client: {
                    id: cliente._id,
                    name: cliente.name,
                    tel: cliente.tel,
                    cpfCnpj: cliente.cpfCnpj,
                    address: {
                        street: cliente.address.street,
                        district: cliente.address.district,
                        city: cliente.address.city,
                        state: cliente.address.state,
                        cep: cliente.address.cep,
                        complement: cliente.address.complement,
                        reference: cliente.address.reference
                    },
                },
                nfe: nfeId,
                shipper: embarcadorId,
                status: agendamentoStatus.coletaStatus,
                statusDescription: agendamentoStatus.descricao,
                freightDate: agendamentoStatus.dataFrete,
                checklist: {
                    statusPackaging: checklist.estadoPacote,
                    reason: checklist.motivo,
                    details: checklist.detalhes,
                },
            }
            const newAgendamento = await Agendamento.create(agendamento);
            return newAgendamento
        } catch (error) {
            console.log(error)
        }
    }

    static consultaAgendamento = async (chaveNfe) => {
        let coletaStatus = ""
        let dataFrete = ""
        let descricao = ""

        try {
            console.log("consultando ESL")
            const resposta = await axios.get(`${baseURL}coleta/agendamento/${chaveNfe}`);
            let dataMaisRecente = moment('0000-01-01T00:00:00');
            let objetoMaisRecente = null;

            resposta.data.forEach(element => {
                let dataElemento = moment(element.occurrence_at);
                if (dataElemento >= dataMaisRecente) {
                    dataMaisRecente = dataElemento;
                    objetoMaisRecente = element;
                }
            });

            if (objetoMaisRecente) {
                coletaStatus = objetoMaisRecente.occurrence.code;
                dataFrete = objetoMaisRecente.occurrence_at;
                descricao = objetoMaisRecente.occurrence.description;

                return {
                    coletaStatus: coletaStatus,
                    dataFrete: dataFrete,
                    descricao: descricao
                }

            } else {
                // Caso nenhum objeto seja encontrado
                console.log('Nenhum objeto encontrado');
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }

    static atualizaAgendamento = async (dados) => {
        try {
            const agendar = Agendamento.findByIdAndUpdate(
                dados._id,
                {
                    protocol: dados.protocol,
                    appointmentDate: dados.appointmentDate,
                    disassembledProduct: dados.disassembledProduct,
                    status: dados.status,
                    statusDescription: dados.statusDescription,
                    checklist: {
                        statusPackaging: dados.checklist.statusPackaging,
                        reason: dados.checklist.reason,
                        details: dados.checklist.details,
                    },
                    residence: {
                        type: dados.residence.type,
                        floor: dados.residence.floor,
                        elevator: dados.residence.elevator,
                    },
                },
                { new: true } //retorna o valor atualizado
            )
                .exec()

            return agendar
        } catch (error) {
            console.log(error)
        }
    }

    static calculaDataAgendamento = async (dataNf, embarcador, cep) => {
        let raizCnpj = embarcador.cpfCnpj.substr(0, 8)
        let inicioCep = cep.substr(0, 5)
        const [dias] = await this.consultaDiasColetaSql(raizCnpj, inicioCep)

        let datasDisponiveis = []

        if (dias) {
            try {
                let data = moment(dataNf, 'YYYY-MM-DD')
                let diasAdicionados = 0;
                while (diasAdicionados < dias.limiteColeta) {
                    data.add(1, 'days');
                    let feriado = await this.feriados(data)
                    if (data.isoWeekday() < 6 && feriado != "Feriado") {
                        // Adiciona apenas se não for sábado ou domingo
                        diasAdicionados++;
                        if (dias.diasSemana.includes(data.isoWeekday()) && diasAdicionados !== 1) { //verifica se o dia esta presente no array
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
            return "Fora de SP"
        }

    }

    static consultaAgendamentoEsl = async (req, res) => {
        const chaveNfe = req.params.chaveNfe;

        try {
            const response = await fetch(`https://conecta.eslcloud.com.br/api/invoice_occurrences?invoice_key=${chaveNfe}`, {
                headers: {
                    Authorization: `Bearer ${process.env.TOKENCONSULTAELS}`
                }
            });

            const dados = await response.json();
            res.status(200).json(dados.data);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static enviaAgendamentoEsl = async (agendamento) => {
        const dataAtual = new Date()
        let agendado = false
        let comentario = `Telefone: ${agendamento.client.tel} // `

        if (agendamento.residence.type == 'Casa') {
            comentario += `Residencia: ${agendamento.residence.type} //`;
        }
        else if (agendamento.residence.elevator == true) {
            comentario += `Residencia: ${agendamento.residence.type}, Andar: ${agendamento.residence.floor}, Elevador: Sim //`;
        }
        else {
            comentario += `Residencia: ${agendamento.residence.type}, Andar: ${agendamento.residence.floor}, Elevador: Não //`;
        }

        const query = `
            mutation ReversePickFreightScheduleCreate($key: String!, $params: FreightScheduleInput!) {
            reversePickFreightScheduleCreate(key: $key, params: $params) {
                errors
                success
            }
        }`

        const variables = {
            key: agendamento.nfe.key,
            params: {
                invoiceOccurrence: {
                    occurrenceAt: moment(dataAtual).utcOffset("-03:00").format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                    occurrenceCode: 300,
                    occurrenceId: null,
                    comments: comentario
                },
                schedulingDate: moment(agendamento.appointmentDate).utcOffset("-03:00").format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                schedulingPeriod: "all"
            }
        };


        agendado = true
        /*
        try {
            const endpoint = 'https://conecta.eslcloud.com.br/graphql';
            const headers = {
                Authorization: `Bearer ${process.env.TOKENAGENGAMENTOELS}`
            };

            const response = await request(endpoint, query, variables, headers);
            const result = response.reversePickFreightScheduleCreate;

            if (result.success) {
                agendado = true
            }
        } catch (error) {
            console.error(error);
        }
        */

        if (agendado == true) {
            agendamento.status = 300;
            agendamento.statusDescription = "Agendado";
            this.atualizaAgendamento(agendamento);

            return "sucesso"
        }
        else {
            return "falha"
        }
    }

    static deletaAgendamento = async (agendamentoId) => {
        try {
            // Excluindo os documentos do cliente criados na data de hoje
            await Agendamento.findByIdAndDelete(agendamentoId);
            console.log('Agendamento do cliente excluída com sucesso.');
        } catch (err) {
            console.error('Ocorreu um erro ao excluir agendagemento:', err);
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

    static protocolo = async (telefone) => {
        const padZero = (valor, tamanho = 2) => {
            let valorString = String(valor);
            while (valorString.length < tamanho) {
                valorString = '0' + valorString;
            }
            return valorString;
        };

        const data = new Date();
        const ano = data.getFullYear();
        const mes = padZero(data.getMonth() + 1);
        const dia = padZero(data.getDate());
        const hora = padZero(data.getHours());
        const minuto = padZero(data.getMinutes());
        const segundo = padZero(data.getSeconds());
        const milisegundos = padZero(data.getMilliseconds());
        const tel = telefone.substr(9, 13);

        const protocol = `${ano}${mes}${dia}${tel}${hora}${minuto}${segundo}${milisegundos}`

        return protocol
    }
}

export default coleta