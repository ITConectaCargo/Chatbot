import SidebarChatsItem from 'components/SidebarChatsItem'
import styles from './SidebarChats.module.css'
import cliente from './cliente.png'
//import contatosJson from "json/contatos.json"
import axios from 'axios'
import { useState } from 'react'
import { useEffect } from 'react'

export default function SidebarChats() {
  const baseUrl = "http://localhost:9000/"
  const [contatos, setContatos] = useState([])

  useEffect(() => {
    axios.get(baseUrl + "fila")
      .then((response) => {
        setContatos(response.data)
      })
  }, [])

  return (
    <div className={styles.container}>
      {contatos.map((contato) => {
        return <SidebarChatsItem
          key={contato.from.nameWhatsapp}
          imagem={cliente}
          nome={contato.from.nameWhatsapp}
        />
      })}
    </div>
  )
}
