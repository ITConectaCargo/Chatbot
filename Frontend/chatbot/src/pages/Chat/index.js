import styles from "./Chat.modules.css"
import Sidebar from "components/Sidebar"
import Conversas from "components/Conversas"
import { useEffect, useState } from "react"
import axios from "axios"


export default function Chat() {
  const baseUrl = "http://localhost:9000/"
  const [filas, setFilas] = useState([])
  const [contato, setContato] = useState()

  useEffect(() => {
    axios.get(baseUrl + "fila")
      .then((response) => {
        setFilas(response.data)
      })
  }, [])

  const selecionaContato = async (telefone) => {
    await axios.get(`${baseUrl}contato/${telefone}`)
      .then((response) => {
        setContato(response.data)
      })
  }

  return (
    <>
      <section className={styles.container}>
        <Sidebar
          filas={filas}
          selecionaContato={selecionaContato}
        />
        <Conversas contato={contato}/>
      </section>
    </>
  )
}
