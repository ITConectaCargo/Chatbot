import Mensagem from 'components/Mensagem'
import styles from './ConversasBody.module.css'

export default function ConversasBody({mensagens}) {
  return (
    <div className={styles.container}>
     {mensagens.map((mensagem) => {
        return <Mensagem key={mensagem._id} nome={mensagem.from.nameWhatsapp} remetente={mensagem.from.tel} mensagem={mensagem.text} hora={mensagem.date} />
      })}
    </div>
  )
}
