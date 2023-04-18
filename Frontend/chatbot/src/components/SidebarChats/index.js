import SidebarChatsItem from 'components/SidebarChatsItem'
import styles from './SidebarChats.module.css'
import contatos from "json/contatos.json"

export default function SidebarChats() {
  return (
    <div className={styles.container}>
      {contatos.map((contato) => {
        return <SidebarChatsItem
          key={contato.id}
          imagem={contato.imagem}
          nome={contato.nome}
        />
      })}
    </div>
  )
}
