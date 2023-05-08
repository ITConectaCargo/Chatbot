import styles from './SidebarChatsItem.module.css'

export default function SidebarChatsItem({telefone, imagem, nome, selecionaContato}) {
  return (
    <div className={styles.container} onClick={() => selecionaContato(telefone)}>
        <div >
            <img src={imagem} className={styles.avatar} alt={nome} />
        </div>
        <div>
            <span className={styles.nome}>{nome}</span>
        </div>
    </div>
  )
}
