import styles from "./Chat.modules.css"
import Sidebar from "components/Sidebar"
import Conversas from "components/Conversas"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Chat() {
  const baseUrl = "https://chatbot.wesleymoraescon.repl.co/"
  const [filas, setFilas] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [contato, setContato] = useState()

  useEffect(() => {
    axios.get(baseUrl + "fila")
      .then((response) => {
        setFilas(response.data)
      })
  }, [])

  const selecionaContato = async (telefone) => {
    try {
      await axios.get(`${baseUrl}contato/${telefone}`)
        .then((response) => {
          setContato(response.data)
        })
    } catch (error) {
      console.log(error)
    }
    try {
      await axios.get(`${baseUrl}whatsapp/${telefone}`)
        .then((response) => {
          setMensagens(response.data)
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <section className={styles.container}>
        <Sidebar
          filas={filas}
          selecionaContato={selecionaContato}
        />
        <Conversas contato={contato} mensagens={mensagens} />
      </section>
    </>
  )
}
