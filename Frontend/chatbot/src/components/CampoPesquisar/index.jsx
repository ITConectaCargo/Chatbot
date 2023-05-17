import styles from './CampoPesquisar.module.css'

export default function CampoPesquisar({tipo, placeholder, children}) {
  return (
    <div >
        <label>{children}</label>
        <input className={styles.container} type={tipo} placeholder={placeholder}></input>
    </div>
  )
}
