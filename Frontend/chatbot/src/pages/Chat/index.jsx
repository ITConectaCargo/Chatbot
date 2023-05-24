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
    api.get(`usuario/${userId}`, { // busca na api o usuario de acordo com o login
      headers: {
        Authorization: `Bearer ${token}` // envia o token do login para verificar se esta valido
      }
    })
      .then(resposta => {
        setUsuario(resposta.data) // popula a variavel usuario
      }
      )
      .catch(error => {
        alert(error.response.data.msg) //exibe um alerta
        sessionStorage.removeItem('token') // remove o token da sessao
        sessionStorage.removeItem('userId') // remove o usuario da sessao
        window.location.reload() // reload da pagina
      })

  }, [userId, token])

  //busca usuarios que estao na fila de espera
  useEffect(() => {
    api.get("fila/status/atendimento", usuario)
      .then(resposta => {
        const dados = resposta.data
        setFilas(dados)
      })
  }, [usuario]) // se houver atualização do usuario executa novamente

  //botao atualizar
  const atualizaContatosFila = async () => {
    await api.get("fila/status/atendimento", usuario)
      .then(resposta => {
        const dados = resposta.data
        setFilas(dados)
      })
  }

  const buscaContatoFila = async () => {
    await api.post('/fila', usuario)
      .then(resposta => {
        const dados = resposta.data
        dados.forEach(fila => {
          setFilas([...filas, fila])
        });
      })
      .catch(error => console.log(error))
  }

  // seleciona contato ao clicar
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
          atualizaContatosFila={atualizaContatosFila}
          buscaContatoFila={buscaContatoFila}
          usuario={usuario}
          filas={filas}
          selecionaContato={selecionaContato}
        />
        <Conversas
          socket={socket}
          atualizaContatosFila={atualizaContatosFila}
          contato={contato}
          setContato={setContato}
          setMensagens={setMensagens}
          mensagens={mensagens}
        />
      </section>
    </>
  )
}
