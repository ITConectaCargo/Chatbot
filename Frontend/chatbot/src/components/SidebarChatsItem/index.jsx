import styles from './SidebarChatsItem.module.css'

export default function SidebarChatsItem({telefone, protocolo, imagem, nome, selecionaContato}) {
  return (
    <div className={styles.container} onClick={() => selecionaContato(telefone, protocolo)}>
        <div >
            <img src={imagem} className={styles.avatar} alt={nome} />
        </div>
        <div>
            <span className={styles.nome}>{nome}</span>
        </div>
    </div>
  )
}
