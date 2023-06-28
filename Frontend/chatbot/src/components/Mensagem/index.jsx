import styles from './Mensagem.module.css'

export default function Mensagem({remetente, mensagem, hora}) {
  const horaFormatada = new Date(hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={remetente === "5511945718427" ? styles.container : styles.containerRemetente}>
        <div className={remetente === "5511945718427" ? styles.linha : styles.linhaRemetente}>
            <div className={styles.conteudo}>
                <p>{mensagem}</p>
                <span>{horaFormatada}</span>
            </div>
        </div>
    </div>
  )
}
