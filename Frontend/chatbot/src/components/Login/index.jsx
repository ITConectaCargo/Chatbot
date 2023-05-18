import axios from 'axios'
import styles from './Login.module.css'
import React, { useState } from 'react'
import { API_URL } from 'config.js'
import { useNavigate } from 'react-router-dom';

export default function Login({ abrirFecharModal }) {
    const irPara = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const validaUsuarioSenha = async () => {
        const usuario = {
            email: email,
            password: password
        }
        await axios.post(`${API_URL}usuario/autenticacao`, usuario)
            .then(response => {
                sessionStorage.setItem('token', response.data.token)
                setEmail('')
                setPassword('')
                irPara("/chat")
            })
            .catch(erro => alert(erro.response.data.msg))

    }
    const aoSubmeter = (e) => {
        e.preventDefault()
        validaUsuarioSenha()
    }
    return (
        <div className={styles.formulario}>
            <form onSubmit={aoSubmeter}>
                <div className={styles.cartao__header}>
                    <h2>ChatBot</h2>
                </div>
                <div className={styles.cartao__body}>
                    <input
                        required={true}
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        required={true}
                        type='password'
                        placeholder='Senha'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className={styles.cartao__footer}>
                    <button type='submit'>Entrar</button>
                    <p onClick={abrirFecharModal}>Registrar</p>
                </div>
            </form>
        </div>
    )
}
