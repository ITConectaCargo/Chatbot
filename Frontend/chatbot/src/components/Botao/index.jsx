import React from 'react';
import styles from './Botao.module.css';

export default function Botao({ cor, children, onClick }) {
  const botaoClass = `${styles.botao} ${styles[`botao-${cor}`]}`;
  return (
    <button className={botaoClass} onClick={onClick}>
      {children}
    </button>
  );
}
