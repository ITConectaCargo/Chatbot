import styles from "./ConversasFooter.module.css"
import { MdSend } from 'react-icons/md';
import { IoMdHappy } from 'react-icons/io';

export default function ConversasFooter({enviaMensagem, mensagem, atualizaMensagem}) {
  return (
    <div className={styles.container}>
      <form>
        <IoMdHappy />
        <input placeholder="Mensagem"
          onChange={(e) => atualizaMensagem(e.target.value)}
          value={mensagem}/>
          <MdSend onClick={() => enviaMensagem(mensagem)}/>
      </form>
    </div>
  )
}
