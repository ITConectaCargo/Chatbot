import CampoInput from "components/CampoInput"
import styles from "./Sidebar.module.css"
import SidebarHeader from "components/SidebarHeader"
import SidebarChats from "components/SidebarChats"
import { useState } from "react"

export default function Sidebar({ filas, selecionaContato, token, userId }) {
  const [pesquisar, setPesquisar] = useState('')
  return (
    <div className={styles.container}>
      <SidebarHeader token={token} userId={userId}/>
      <div className={styles.pesquisa}>
        <CampoInput
          className={styles.pesquisar}
          tipo={"text"}
          placeholder={"Pesquisar Contato"}
          value={pesquisar}
          aoAlterado={value => setPesquisar(value)}
        />
      </div>
      <SidebarChats filas={filas} selecionaContato={selecionaContato} />
    </div>
  )
}
