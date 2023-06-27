import BotaoChat from 'components/BotaoChat'
import styles from './ConversasHeader.module.css'
import { BiTransferAlt } from 'react-icons/bi'
import { BsInfoCircle } from 'react-icons/bs'
import { RiWechatPayLine } from 'react-icons/ri'
import api from 'config'
import { useEffect, useState } from 'react'
import ModalTransferir from 'components/ModalTransferir'

export default function ConversasHeader({ contato, atualizaContatosFila, setContato }) {
  const [contatoFila, setContatoFila] = useState()
  const [abrirModal, setAbrirModal] = useState(false)

  useEffect(() => {
    api.get(`/fila/${contato._id}`)
      .then(resposta => {
        const dados = resposta.data
        setContatoFila(dados)
      })
  }, [contato])

  const abrirFecharModal = () => {
    setAbrirModal(!abrirModal)
  }

  const finalizarConversa = async () => {
    try {
      let dados = contatoFila
      dados.status = "finalizado"
      await api.put('/fila', dados)
        .then(resposta => {
          setContato("")
          atualizaContatosFila()
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.usuarioInfo}>
          <div className={styles.nomeConteudo}>
            <h4 className={styles.nome}>{contato && contato.nameWhatsapp}</h4>
            <BsInfoCircle />
          </div>
        </div>
        <div>
          <BotaoChat nome={"Transferir"} onClick={abrirFecharModal}><BiTransferAlt /></BotaoChat>
          <BotaoChat nome={"Finalizar"} onClick={finalizarConversa}><RiWechatPayLine /></BotaoChat>
        </div>
      </div>
      <ModalTransferir
        isOpen={abrirModal}
        abrirFecharModal={abrirFecharModal}
        contatoFila={contatoFila}
        atualizaContatosFila={atualizaContatosFila}
      />
    </>
  )
}
