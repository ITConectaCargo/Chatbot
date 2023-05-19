import styles from "./ConversasFooter.module.css"
import { MdSend } from 'react-icons/md';
import { IoMdHappy } from 'react-icons/io';

export default function ConversasFooter({enviaMensagem, mensagem, atualizaMensagem}) {
  
  const aoSubmeter = (e) =>{
    e.preventDefault()
    enviaMensagem(mensagem)
  }

  return (
    <div className={styles.container}>
      <form className={styles.envia__mensagem} onSubmit={aoSubmeter}>
        <IoMdHappy />
        <input placeholder="Mensagem"
          onChange={(e) => atualizaMensagem(e.target.value)}
          value={mensagem}/>
          <MdSend onClick={() => enviaMensagem(mensagem)}/>
      </form>
    </div>
  )
}
