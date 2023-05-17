import CampoPesquisar from "components/CampoPesquisar"
import styles from "./Sidebar.module.css"
import SidebarHeader from "components/SidebarHeader"
import SidebarChats from "components/SidebarChats"

export default function Sidebar({filas, selecionaContato}) {
  return (
    <div className={styles.container}>
      <SidebarHeader />
      <div className={styles.pesquisa}>
        <h3>Conversas</h3>
        <CampoPesquisar className={styles.pesquisar} tipo={"text"} placeholder={"Pesquisar Contato"} />
      </div>
      <SidebarChats filas={filas} selecionaContato={selecionaContato}/>
    </div>
  )
}
