import React, { useState } from 'react'
import { API_URL } from 'config.js'
import Modal from 'react-modal'
import axios from 'axios'

export default function ModalCadastroUsuario({ isOpen, abrirFecharModal }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPass, setConfirmPass] = useState('')
    const [type, setType] = useState('')
    const [department, setDepartment] = useState('')
    const [company, setCompany] = useState('')

    const types = [false, "Adm", "Funcionario", "Cliente"]
    const departments = [false, "SAC", "Comercial", "Motoristas"]
    const companies = [false, "Magazine Luiza", "Samsung"]

    const cadastrarUsuario = async () => {
        if (type === "Adm") {
            setDepartment("Adm")
            setCompany("Conecta Cargo")
        }

        if (type === "Cliente") {
            setDepartment("Cliente")
        }

        if (type === "Funcionario") {
            setCompany("Conecta Cargo")
        }

        const novoUsuario = {
            name: name,
            email: email,
            password: password,
            confirmPass: confirmPass,
            type: type,
            department: department,
            company: company
        }

        try {
            const resposta = await axios.post(`${API_URL}usuario/novo`, novoUsuario)
            const dados = resposta.data
            alert(dados.msg)
            abrirFecharModal()

        } catch (error) {
            alert(error.response.data.msg)
        }
    }

    const aoSubmeter = (e) => {
        e.preventDefault()
        cadastrarUsuario()
    }

    return (
        <div>
            <Modal isOpen={isOpen} ariaHideApp={false}>
                <form onSubmit={aoSubmeter}>
                    <div>
                        <h2>Criar Usuario</h2>
                        <button onClick={abrirFecharModal}>Close</button>
                    </div>
                    <div>
                        <input
                            required={true}
                            type='text'
                            placeholder='Nome'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
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
                        <input
                            required={true}
                            type='password'
                            placeholder='Confirme a senha'
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <select required={true} value={type} onChange={(e) => setType(e.target.value)}>
                            {types.map((type) => {
                                return <option key={type}>{type}</option>
                            })}
                        </select>

                        {type === "Funcionario" ?
                            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                {departments.map((department) => {
                                    return <option key={department}>{department}</option>
                                })}
                            </select>
                            :
                            ""
                        }

                        {type === "Cliente" ?
                            <select value={company} onChange={(e) => setCompany(e.target.value)}>
                                {companies.map((company) => {
                                    return <option key={company}>{company}</option>
                                })}
                            </select>
                            :
                            ""
                        }
                    </div>
                    <div>
                        <button type='submit'>Criar</button>
                        <button type='button' onClick={abrirFecharModal}>Cancelar</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
