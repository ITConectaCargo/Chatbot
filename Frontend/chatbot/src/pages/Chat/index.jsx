import styles from "./Chat.modules.css"
import Sidebar from "components/Sidebar"
import Conversas from "components/Conversas"
import { useEffect, useState } from "react"
import { API_URL } from 'config.js'
import axios from "axios"
import io from "socket.io-client";

const socket = io.connect(API_URL);

export default function Chat() {
  const [filas, setFilas] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [contato, setContato] = useState()

  useEffect(() => {
    axios.get(API_URL + "fila")
      .then((response) => {
        setFilas(response.data)
      })
  }, [])

  const selecionaContato = async (telefone) => {
    try {
      await axios.get(`${API_URL}contato/${telefone}`)
        .then((response) => {
          setContato(response.data)
        })
    } catch (error) {
      console.log(error)
    }
    try {
      await axios.get(`${API_URL}whatsapp/${telefone}`)
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
        <Conversas
          socket={socket}
          contato={contato}
          setMensagens={setMensagens}
          mensagens={mensagens}
        />
      </section>
    </>
  )
}
