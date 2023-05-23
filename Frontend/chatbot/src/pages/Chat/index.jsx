import styles from "./Chat.module.css"
import Sidebar from "components/Sidebar"
import Conversas from "components/Conversas"
import Navbar from "components/Navbar"
import { useEffect, useState } from "react"
import api, { API_URL } from 'config.js'
import io from "socket.io-client";

const socket = io.connect(API_URL);

export default function Chat() {
  const token = sessionStorage.getItem('token')
  const userId = sessionStorage.getItem('userId')
  const [filas, setFilas] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [contato, setContato] = useState()
  const [usuario, setUsuario] = useState()

  //Busca os dados do usuario
  useEffect(() => {
    api.get(`usuario/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(resposta => {
        setUsuario(resposta.data.user)
      }
      )
      .catch(error => {
        alert(error.response.data.msg)
        sessionStorage.removeItem('token') // remove o token da sessao
        sessionStorage.removeItem('userId') // remove o usuario da sessao
        window.location.reload() // reload da pagina
      })

  }, [userId, token])

  //busca usuarios que estao na fila de espera
  useEffect(() => {
    api.get("fila")
      .then((response) => {
        setFilas(response.data)
      })
  }, [])

  const selecionaContato = async (telefone) => {
    try {
      await api.get(`contato/${telefone}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((response) => {
          setContato(response.data)
        })
    } catch (error) {
      console.log(error)
      alert(error.response.data.msg)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userId')
      window.location.reload()
    }
    try {
      await api.get(`whatsapp/${telefone}`)
        .then((response) => {
          setMensagens(response.data)
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Navbar usuario={usuario} />
      <section className={styles.container}>
        <Sidebar
          usuario={usuario}
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
