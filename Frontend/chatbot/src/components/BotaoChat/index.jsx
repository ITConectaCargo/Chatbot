import React from 'react';
import styles from './BotaoChat.module.css';

export default function BotaoChat({ children, onClick, nome }) {
  return (
    <button className={styles.botao__chat} onClick={onClick}>
      {children}
      {nome}
    </button>
  );
}
