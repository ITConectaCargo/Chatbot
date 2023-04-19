import styles from './Mensagem.module.css'

export default function Mensagem({remetente, mensagem, hora}) {
  return (
    <div className={styles.container}>
        <div className={styles.linha}>
            <div className={styles.conteudo}>
                <h4>{remetente}</h4>
                <p>{mensagem}</p>
                <span>{hora}</span>
            </div>
        </div>
    </div>
  )
}
