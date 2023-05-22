import styles from './CampoInput.module.css'  

export default function CampoInput({required, type, placeholder, children, value, aoAlterado}) {
  return (
    <div >
        <label>{children}</label>
        <input required={required} className={styles.container} type={type} placeholder={placeholder} onChange={evento => aoAlterado(evento.target.value)} value={value} ></input>
    </div>
  )
}
