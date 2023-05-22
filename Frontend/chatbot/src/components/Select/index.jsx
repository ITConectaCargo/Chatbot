import React from 'react'
import styles from './Select.module.css'

export default function Select ({required, label, value, opcoes, aoAlterado}) {  
    return (
    <>
        <label className={styles.label}>{label}</label>
        <select className={styles.select} required={required} value={value} onChange={e => aoAlterado(e.target.value)}>
            {opcoes.map((opcao) => {
                return <option key={opcao}>{opcao}</option>
            })}
        </select>
    </>
  )
}
