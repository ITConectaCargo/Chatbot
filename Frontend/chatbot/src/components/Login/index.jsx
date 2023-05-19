import axios from 'axios'
import styles from './Login.module.css'
import React, { useState } from 'react'
import { API_URL } from 'config.js'
import CampoInput from 'components/CampoInput';
import { useNavigate } from 'react-router-dom';

export default function Login({ abrirFecharModal }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const validaUsuarioSenha = async (e) => {
        e.preventDefault()
        const usuario = {
            email: email,
            password: password
        }

        try {
            const resposta = await axios.post(`${API_URL}usuario/autenticacao`, usuario)
            sessionStorage.setItem('token', resposta.data.token)
            setEmail('')
            setPassword('')
            navigate("/chat")
            window.location.reload()
        } catch (error) {
            alert(error.response.data.msg)
        }
    }

    return (
        <div className={styles.formulario}>
            <form onSubmit={validaUsuarioSenha}>
                <div className={styles.cartao__header}>
                    <h2>ChatBot</h2>
                </div>
                <div className={styles.cartao__body}>
                    <div>
                        <CampoInput
                            required={true}
                            type='email'
                            placeholder='Email'
                            value={email}
                            aoAlterado={value => setEmail(value)}
                        />
                    </div>
                    <div>
                        <CampoInput
                            required={true}
                            type='password'
                            placeholder='Senha'
                            value={password}
                            aoAlterado={value => setPassword(value)}
                        />
                    </div>
                </div>
                <div className={styles.cartao__footer}>
                    <button onClick={validaUsuarioSenha}>Entrar</button>
                    <p onClick={abrirFecharModal}>Registrar</p>
                </div>
            </form>
        </div>
    )
}
