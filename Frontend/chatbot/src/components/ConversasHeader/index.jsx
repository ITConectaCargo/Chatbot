import BotaoChat from 'components/BotaoChat'
import styles from './ConversasHeader.module.css'
import { BiTransferAlt } from 'react-icons/bi'
import { BsInfoCircle } from 'react-icons/bs'
import { RiWechatPayLine } from 'react-icons/ri'

export default function ConversasHeader({ contato }) {
  return (
    <div className={styles.container}>
      <div className={styles.usuarioInfo}>
        <div className={styles.nomeConteudo}>
          <h4 className={styles.nome}>{!contato ? "" : contato.nameWhatsapp}</h4>
          <BsInfoCircle />
        </div>
      </div>
      <div>
        <BotaoChat nome={"Transferir"}><BiTransferAlt /></BotaoChat>
        <BotaoChat nome={"Finalizar"}><RiWechatPayLine /></BotaoChat>
      </div>
    </div>
  )
}
