import styles from './Mensagem.module.css'

export default function Mensagem({remetente, nome, mensagem, hora}) {

  return (
    <div className={remetente === "5511945718427" ? styles.container : styles.containerRemetente}>
        <div className={remetente === "5511945718427" ? styles.linha : styles.linhaRemetente}>
            <div className={styles.conteudo}>
                <h4>{nome}</h4>
                <p>{mensagem}</p>
                <span>{hora}</span>
            </div>
        </div>
    </div>
  )
}
