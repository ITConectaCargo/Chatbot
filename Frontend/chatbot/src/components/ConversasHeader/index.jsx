import BotaoChat from 'components/BotaoChat'
import styles from './ConversasHeader.module.css'
import { BiTransferAlt } from 'react-icons/bi'
import { BsInfoCircle } from 'react-icons/bs'
import { RiWechatPayLine } from 'react-icons/ri'
import api from 'config'
import { useState } from 'react'

export default function ConversasHeader({ contato, atualizaContatosFila }) {
  const [contatoFila, setContatoFila] = useState()

  const buscaContatoFila = async () => {
    await api.get(`/fila/${contato._id}`)
      .then(resposta => {
        const dados = resposta.data
        setContatoFila(dados)
        return contatoFila
      })
  }

  const finalizarConversa = async () => {
    try {
      await buscaContatoFila()
      console.log(contatoFila)
      let dados = contatoFila
      dados.status = "finalizado"
      await api.put('/fila', dados)
        .then(resposta => {
          console.log(resposta.data)
          atualizaContatosFila()
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.usuarioInfo}>
        <div className={styles.nomeConteudo}>
          <h4 className={styles.nome}>{contato && contato.nameWhatsapp}</h4>
          <BsInfoCircle />
        </div>
      </div>
      <div>
        <BotaoChat nome={"Transferir"}><BiTransferAlt /></BotaoChat>
        <BotaoChat nome={"Finalizar"} onClick={finalizarConversa}><RiWechatPayLine /></BotaoChat>
      </div>
    </div>
  )
}
