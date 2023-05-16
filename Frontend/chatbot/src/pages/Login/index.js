import React from 'react'

export default function Login() {
    return (
        <>
            <h1>Login</h1>
            <form>
                <div>
                    <input type='email' placeholder='Usuario' />
                </div>
                <div>
                    <input type='password' placeholder='Senha' />
                </div>
                <div>
                    <button>Entrar</button>
                    <p>Registrar</p>
                </div>
            </form>
        </>
    )
}
