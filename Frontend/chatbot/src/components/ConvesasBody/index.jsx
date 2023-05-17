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
        {mensagens.map((msg) => {
          return <Mensagem
            key={msg._id}
            nome={msg.from.nameWhatsapp}
            remetente={msg.from.tel}
            mensagem={msg.text}
            hora={msg.date}
          />
        })}
      </div>
    </div>
  )
}
