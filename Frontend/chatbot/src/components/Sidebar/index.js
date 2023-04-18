import Campo from "components/Campo"
import styles from "./Sidebar.module.css"
import SidebarHeader from "components/SidebarHeader"
import SidebarChats from "components/SidebarChats"

export default function Sidebar() {
  return (
    <div className={styles.container}>
        <SidebarHeader />
        Conversas
        <Campo tipo={"text"} placeholder={"Pesquisar Contato"} />
        <SidebarChats />
    </div>
  )
}
