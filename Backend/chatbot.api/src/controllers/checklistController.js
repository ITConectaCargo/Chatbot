import pdfjs from 'pdfjs-dist';
import axios from 'axios'

class checklist {
    static consultaChecklist = async (chaveNfe) => {
        const cnpj = chaveNfe.substr(6, 14);
        const raizCnpj = cnpj.substr(0, 8)
        let texto = ''

        if (raizCnpj == '47960950') { //Magazine
            const url = `http://inectar.com.br/modulos/Checklists_Magazine/${chaveNfe}.pdf`; // Monta a URL do PDF com base no parâmetro
            const estadoRegex = /ESTADO DA EMBALAGEM:(.*?)l   MOTIVO DA COLETA:/gm;
            const motivoRegex = /MOTIVO DA COLETA:(.*?)l   DETALHES:/gm;
            const detalhesRegex = /DETALHES:(.*?)PASSO/gm;
            texto = await this.checklistBusca(estadoRegex, motivoRegex, detalhesRegex, url)

        }
        else if (raizCnpj == '05570714') { //Kabum
            const url = `https://inectar.com.br/src/painelUsuario/checklists/${raizCnpj}/${cnpj}/${chaveNfe}.pdf`
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
        }
        else if (raizCnpj == '59717553' || raizCnpj == '08215490'){ //multilazer e mvx
            const url = `https://inectar.com.br/src/painelUsuario/checklists/${raizCnpj}/${cnpj}/${chaveNfe}.pdf`
            const estadoRegex = /ESTADO DA EMBALAGEM:(.*?)MOTIVO/gm;
            const motivoRegex = /MOTIVO DA COLETA:(.*?)Detalhamento/gm;
            const detalhesRegex = /Detalhamento:(.*?)CAMPOS PARA VALIDAÇÃO/gm;
            texto = await this.checklistBusca(estadoRegex, motivoRegex, detalhesRegex, url)
            
            const itensSelecionados = /☑\s+(.+?)\s+☐/g; //regex sobre o que esta entre [x] e [
            let match;

            //busca o que esta entre [x] e [ do estadoPacote
            while ((match = itensSelecionados.exec(texto.estadoPacote)) !== null) {
                texto.estadoPacote = match[1];
            }

            //busca o que esta entre [x] e [ do motivo
            while ((match = itensSelecionados.exec(texto.motivo)) !== null) {
                texto.motivo = match[1];
            }
        }

        return texto
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