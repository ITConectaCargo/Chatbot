import styles from './ConversasHeader.module.css'

export default function ConversasHeader() {
  return (
    <div className={styles.container}>
      <div className={styles.usuarioInfo}>
        <img className={styles.avatar} src="https://github.com/josevnevess.png" alt="Avatar" />
        <div className={styles.nomeConteudo}>
          <h4 className={styles.nome}>Jose Neves</h4>
        </div>
      </div>
    </div>
  )
}
