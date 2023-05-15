import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import catGiphy from './cat.gif'
import styles from './Conversas.module.css'
import axios from 'axios'
import { useEffect, useState } from 'react'

export default function Conversas({ setMensagens, socket, baseUrl, contato, mensagens }) {
    const [mensagem, setMensagem] = useState("");
     
    useEffect(() => {
        socket.on('chat.mensagem', (dados) => {
          setMensagens( [...mensagens, dados])
        })
      })

    const enviaMensagem = async () => {
        if (mensagem !== '') {
            let dadosMensagem = {
                from: {
                    _id: '64621ca197584a92b5312ec7',
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
                const resposta = await axios.post(`${baseUrl}whatsapp/mensagem`, dadosMensagem)
                const dados = resposta.data
                console.log(dados)

                socket.emit('chat.sala', dadosMensagem.to)
                socket.emit("chat.mensagem", dados);
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
                    <ConversasHeader contato={contato} />
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
