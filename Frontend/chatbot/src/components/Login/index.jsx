import axios from 'axios'
import React, { useState } from 'react'
import { API_URL } from 'config.js'

export default function Login({ abrirFecharModal }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const validaUsuarioSenha = async () => {
        const usuario = {
            email: email,
            password: password
        }

        try {
            const resposta = await axios.post(`${API_URL}usuario/autenticacao`, usuario)
            const dados = resposta.data
            console.log(dados)

            setEmail('')
            setPassword('')

        } catch (error) {
            alert(error.response.data.msg)
        }
    }

    const aoSubmeter = (e) => {
        e.preventDefault()
        validaUsuarioSenha()
    }
    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={aoSubmeter}>
                <div>
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
                <div>
                    <button type='submit'>Entrar</button>
                    <p onClick={abrirFecharModal}>Registrar</p>
                </div>
            </form>
        </div>
    )
}
