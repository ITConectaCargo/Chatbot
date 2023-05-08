import styles from './ConversasHeader.module.css'

export default function ConversasHeader({contato}) {
  
  function possuiContato(contato) {
    if(!contato){
      return "sem valor"
    }
    else {
      return contato.nameWhatsapp
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.usuarioInfo}>
        <img className={styles.avatar} src="https://github.com/josevnevess.png" alt="Avatar" />
        <div className={styles.nomeConteudo}>
          <h4 className={styles.nome}>{possuiContato(contato)}</h4>
        </div>
      </div>
    </div>
  )
}
