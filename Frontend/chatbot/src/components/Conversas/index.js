import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import catGiphy from './cat.gif'
import styles from './Conversas.module.css'
import axios from 'axios'
import { useState } from 'react'

export default function Conversas({ contato, mensagens }) {
    const baseURL = "http://localhost:9000/"
    const [mensagem, setMensagem] = useState("");

    function enviaMensagem(mensagem) {
        let layoutMsg = {
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
            axios.post(`${baseURL}whatsapp/mensagem`, layoutMsg)
            
        } catch (error) {
            console.log(error)
        }
        setMensagem('');
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
