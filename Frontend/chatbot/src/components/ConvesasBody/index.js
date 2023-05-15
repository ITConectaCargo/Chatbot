import Mensagem from 'components/Mensagem'
import styles from './ConversasBody.module.css'
import { useEffect, useRef } from 'react';

export default function ConversasBody({ mensagens }) {
  const listaRef = useRef(null);

  useEffect(() => {
    const container = listaRef.current;
    if (container.lastChild) {
      container.lastChild.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  return (
    <div className={styles.container}>
      <div ref={listaRef}>
        {mensagens.map((mensagem) => {
          return <Mensagem
            key={mensagem._id}
            nome={mensagem.from.nameWhatsapp}
            remetente={mensagem.from.tel}
            mensagem={mensagem.text}
            hora={mensagem.date}
          />
        })}
      </div>
    </div>
  )
}
