import styles from './CampoInput.module.css'  

export default function CampoInput({type, placeholder, children, value, aoAlterado}) {
  return (
    <div >
        <label>{children}</label>
        <input className={styles.container} type={type} placeholder={placeholder} onChange={evento => aoAlterado(evento.target.value)} value={value} ></input>
    </div>
  )
}
