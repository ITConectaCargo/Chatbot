import { useState } from 'react'
import styles from "./ConversasFooter.module.css"
import { MdSend } from 'react-icons/md';
import { IoMdHappy } from 'react-icons/io';

export default function ConversasFooter() {
  const [mensagem, setMensagem] = useState("");

  return (
    <div className={styles.container}>
      <form>
        <IoMdHappy />
        <input placeholder="Mensagem"
          onChange={(e) => setMensagem(e.target.value)}
          value={mensagem}/>
          <MdSend />
      </form>
    </div>
  )
}
