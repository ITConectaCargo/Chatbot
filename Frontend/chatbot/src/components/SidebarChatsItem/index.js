import styles from './SidebarChatsItem.module.css'

export default function SidebarChatsItem({imagem, nome, mensagem}) {
  return (
    <div className={styles.container}>
        <div >
            <img src={imagem} className={styles.avatar} alt={nome} />
        </div>
        <div>
            <span className={styles.nome}>{nome}</span>
        </div>
    </div>
  )
}
