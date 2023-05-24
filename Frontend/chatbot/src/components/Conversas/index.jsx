import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import catGiphy from './cat.gif'
import styles from './Conversas.module.css'
import api from 'config.js'
import { useEffect, useState } from 'react'

export default function Conversas({ setMensagens, socket, contato, mensagens, atualizaContatosFila }) {
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        socket.on('chat.mensagem', (dados) => {
            setMensagens([...mensagens, dados])
        })
    })

    const enviaMensagem = async () => {
        if (mensagem !== '') {
            let dadosMensagem = {
                from: {
                    _id: '646d0571d6c7e9233c0cdad8',
                    name: 'Conecta Cargo',
                    nameWhatsapp: 'Conecta Cargo',
                    tel: '5511945718427',
                    cpfCnpj: '12146737000104',
                    address: 'Avenida Monteiro Lobato, 4550 Galpao02 Asa 06 CIDADE JARDIM CUMBICA GUARULHOS - SP 07180-000',
                    date: '2023-05-09T18:07:09.168Z',
                    __v: 0
                },
                to: contato.tel,
                phoneId: '105378582538953',
                timestamp: new Date().getTime(),
                text: mensagem,
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
