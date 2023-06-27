import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import catGiphy from './cat.gif'
import styles from './Conversas.module.css'
import api from 'config.js'
import { useEffect, useState } from 'react'

export default function Conversas({ setMensagens, socket, contato, mensagens, atualizaContatosFila, setContato, token }) {
    const [mensagem, setMensagem] = useState("");
    const [contatoBot, setContatoBot] = useState("");

    //atualização das msg em tempo real
    useEffect(() => {
        socket.on('chat.mensagem', (dados) => {
            setMensagens([...mensagens, dados])
        })
    })

    const getContatoBot = async () => {
        api.get(`contato/5511945718427`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        .then(resposta =>{
            setContatoBot(resposta.data)
        })
        .catch(error => {
            console.log(error)
        })
    }

    const enviaMensagem = async () => {
        if (mensagem !== '') {
            await getContatoBot()

            let dadosMensagem = {
                from: contatoBot,
                to: contato.tel,
                phoneId: '105378582538953',
                timestamp: new Date().getTime(),
                text: mensagem,
                protocol: mensagens[0].protocol,
                __v: 0
            }

            try {
                const resposta = await api.post(`whatsapp/mensagem`, dadosMensagem)
                const dados = resposta.data
                
                await socket.emit('chat.sala', dadosMensagem.to)
                await socket.emit("chat.mensagem", dados);
                setMensagens((msg) => [...msg, dadosMensagem]);
                setMensagem('')
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <>
            {!contato ?
                <div className={styles.sem_dados}>
                    <img src={catGiphy} alt='Gif de gatinho dormindo'></img>
                </div>
                :
                <div className={styles.container}>
                    <ConversasHeader
                        contato={contato}
                        setContato={setContato}
                        atualizaContatosFila={atualizaContatosFila}
                    />
                    <ConversasBody mensagens={mensagens} />
                    <ConversasFooter
                        enviaMensagem={enviaMensagem}
                        mensagem={mensagem}
                        atualizaMensagem={mensagem => setMensagem(mensagem)}
                    />
                </div>
            }
        </>
    )
}
