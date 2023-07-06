import pdfjs from 'pdfjs-dist';
import axios from 'axios'
import Coleta from './coletasController.js';

class checklist {
    static consultaChecklist = async (chaveNfe) => {
        const cnpj = chaveNfe.substr(6, 14);
        const raizCnpj = cnpj.substr(0, 8)
        const [parametros] = await Coleta.consultaChecklistSql(raizCnpj)

        let texto = ''
        if (parametros) {
            if (parametros.checkModelo == 'magazine') { //Magazine
                const url = parametros.checkUrl + `/${chaveNfe}.pdf`

                const estadoRegex = /ESTADO DA EMBALAGEM:(.*?)l   MOTIVO DA COLETA:/gm;
                const motivoRegex = /MOTIVO DA COLETA:(.*?)l   DETALHES:/gm;
                const detalhesRegex = /DETALHES:(.*?)PASSO/gm;
                texto = await this.checklistBusca(estadoRegex, motivoRegex, detalhesRegex, url)
            }
            else if (parametros.checkModelo == 'kabum') { //Kabum
                const url = parametros.checkUrl + `/${raizCnpj}/${cnpj}/${chaveNfe}.pdf`

                const estadoRegex = /Situa çã o   da   Embalagem   Para   Coleta:(.*?)Caro   Cliente/gm;
                const motivoRegex = /Motivo   de   Devolu çã o:(.*?)Observa çõ es   importantes   para   coleta:/gm;
                const detalhesRegex = /Observa çõ es   importantes   para   coleta:(.*?)Situa çã o   da   Embalagem/gm;
                texto = await this.checklistBusca(estadoRegex, motivoRegex, detalhesRegex, url)

                const itensSelecionados = /.*?\[x\]\s+(.*?)\s+\[/g; //regex sobre o que esta entre [x] e [
                let match;

                //busca o que esta entre [x] e [ do estadoPacote
                while ((match = itensSelecionados.exec(texto.estadoPacote)) !== null) {
                    texto.estadoPacote = match[1];
                }

                //busca o que esta entre [x] e [ do motivo
                while ((match = itensSelecionados.exec(texto.motivo)) !== null) {
                    texto.motivo = match[1];
                }

                if (texto.detalhes.includes('ç')) {
                    let textoDetalhes = texto.detalhes.replace(/ç[ãõ]\s/ig, (match) => match.replace(/\s/g, ''));
                    textoDetalhes = textoDetalhes.replace(/\sç/ig, 'ç');
                    texto.detalhes = textoDetalhes
                }
            }
            else if (parametros.checkModelo == "conecta") { //multilazer e mvx
                const url = parametros.checkUrl + `/${raizCnpj}/${cnpj}/${chaveNfe}.pdf`

                const estadoRegex = /ESTADO DA EMBALAGEM:(.*?)MOTIVO/gm;
                const motivoRegex = /MOTIVO DA COLETA:(.*?)Detalhamento/gm;
                const detalhesRegex = /Detalhamento:(.*?)CAMPOS PARA VALIDAÇÃO/gm;
                texto = await this.checklistBusca(estadoRegex, motivoRegex, detalhesRegex, url)

                const itensSelecionadosRegex = /☑\s*([^☐]+)/; //regex sobre o que está entre [x] e [

                // busca o texto entre [x] e [ para o estadoPacote
                let estadoPacoteMatch = itensSelecionadosRegex.exec(texto.estadoPacote);
                if (estadoPacoteMatch) {
                    texto.estadoPacote = estadoPacoteMatch[1].trim()
                }

                // busca o texto entre [x] e [ para o motivo
                let motivoMatch = itensSelecionadosRegex.exec(texto.motivo);
                if (motivoMatch) {
                    texto.motivo = motivoMatch[1].trim()
                }
            }

            return texto
        } else {
            return texto = {
                estadoPacote: "",
                motivo: "",
                detalhes: ""
            }
        }
    }

    static checklistBusca = async (estadoRegex, motivoRegex, detalhesRegex, url) => {
        let dados = []
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' }); // Faz a requisição HTTP para obter o PDF
            const pdfBuffer = Buffer.from(response.data, 'binary'); // Converte os dados do PDF para um buffer em formato binário
            const pdf = await pdfjs.getDocument(pdfBuffer).promise; // Carrega o PDF usando o PDF.js

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i); // Obtém a página do PDF
                const content = await page.getTextContent(); // Obtém o conteúdo de texto da página
                const textos = content.items.map(item => item.str).join(' '); // Converte os itens de texto em uma única string

                // Extrai o estado da embalagem e adiciona ao array de dados
                let match;
                while ((match = estadoRegex.exec(textos)) !== null) {
                    const estado = match[1].trim().replace(/\s+/g, ' '); // Remove espaços triplos da string extraída
                    dados.push(estado);
                }

                // Extrai o motivo da coleta e adiciona ao array de dados
                while ((match = motivoRegex.exec(textos)) !== null) {
                    const motivo = match[1].trim().replace(/\s{3,}/g, ' '); // Remove espaços triplos da string extraída
                    dados.push(motivo);
                }

                // Extrai os detalhes e adiciona ao array de dados
                while ((match = detalhesRegex.exec(textos)) !== null) {
                    const detalhes = match[1].trim().replace(/\s{3,}/g, ' '); // Remove espaços triplos da string extraída
                    dados.push(detalhes);
                }
            }

            const json = {
                estadoPacote: dados[0], // Primeiro item do array é o estado da embalagem
                motivo: dados[1], // Segundo item do array é o motivo da coleta
                detalhes: dados[2], // Terceiro item do array são os detalhes
            };

            return json  // Retorna os dados extraídos como JSON na resposta HTTP
        } catch (error) {
            console.log(error)
            const json = {
                estadoPacote: "",
                motivo: "",
                detalhes: "",
            };
            return json
        }
    }
}

export default checklist