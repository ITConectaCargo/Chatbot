import SidebarChatsItem from 'components/SidebarChatsItem'
import styles from './SidebarChats.module.css'
import avatar from './cliente.png'

export default function SidebarChats({ filas, selecionaContato }) {
  const usuario = sessionStorage.getItem('userId')

  return (
    <div className={styles.container}>
      {
        filas.map((fila) => {
          if (fila.user === usuario) {
            return <SidebarChatsItem
              key={fila.from.nameWhatsapp}
              telefone={fila.from.tel}
              imagem={avatar}
              nome={fila.from.nameWhatsapp}
              selecionaContato={selecionaContato}
            />
          }
          return null
        })
      }
    </div>
  )
}
