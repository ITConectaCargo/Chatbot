import Mensagem from 'components/Mensagem'
import styles from './ConversasBody.module.css'
import conversas from 'json/ConversaJose.json'

export default function ConversasBody() {
  return (
    <div className={styles.container}>
    {conversas.map((conversa) => {
      return <Mensagem key={conversa.id} remetente={conversa.remetente} mensagem={conversa.mensagem} hora={conversa.hora}/>
    })}
    </div>
  )
}
