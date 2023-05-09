import styles from './ConversasHeader.module.css'

export default function ConversasHeader({contato}) {
  return (
    <div className={styles.container}>
      <div className={styles.usuarioInfo}>
        <div className={styles.nomeConteudo}>
          <h4 className={styles.nome}>{!contato ? "" : contato.nameWhatsapp}</h4>
        </div>
      </div>
    </div>
  )
}
