import SidebarChatsItem from 'components/SidebarChatsItem'
import styles from './SidebarChats.module.css'
import avatar from './cliente.png'

export default function SidebarChats({filas, selecionaContato}) {
  return (
    <div className={styles.container}>
    {filas.map((fila) => {
        return <SidebarChatsItem
          key={fila.from.nameWhatsapp}
          telefone={fila.from.tel}
          imagem={avatar}
          nome={fila.from.nameWhatsapp}
          selecionaContato={selecionaContato}
        />
      })}
    </div>
  )
}
