import fila from '../models/fila.js'
class bot {
    static async verificaAtendimento(tel){
        const telTabela = await fila.find({ from: tel });

        if(telTabela != ""){
            console.log(`telefone: ${telTabela} Encontrado`)
        }
        else{
            console.log(`Telefone nao encontrado`)
        }        
    }

    static async adicionaFila(){

    }
    
    static alteraStatus(){

    }

    static uraAtendimento(){

    }

}

export default bot