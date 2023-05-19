import React, { useState } from 'react'
import { API_URL } from 'config.js'
import Modal from 'react-modal'
import axios from 'axios'
import styles from './ModalCadastroUsuario.module.css'
import CampoInput from 'components/CampoInput'

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

    const cadastrarUsuario = async (e) => {
        e.preventDefault()

        const novoUsuario = {
            name: name,
            email: email,
            password: password,
            confirmPass: confirmPass,
            type: type,
            department: department,
            company: company
        }

        await axios.post(`${API_URL}usuario/novo`, novoUsuario)
            .then(resposta => {
                alert(resposta.data.msg)
                abrirFecharModal()
            })
            .catch(error => alert(error.response.data.msg))
    }

    return (
        <div>
            <Modal className={styles.modal} isOpen={isOpen} ariaHideApp={false}>
                <form className={styles.formulario} onSubmit={cadastrarUsuario}>
                    <div className={styles.header}>
                        <h2>Criar Usuario</h2>
                    </div>
                    <div className={styles.body}>
                        <CampoInput
                            required={true}
                            type='text'
                            placeholder='Nome'
                            value={name}
                            aoAlterado={value => setName(value)}
                        />

                        <CampoInput
                            required={true}
                            type='email'
                            placeholder='Email'
                            value={email}
                            aoAlterado={value => setEmail(value)}
                        />

                        <CampoInput
                            required={true}
                            type='password'
                            placeholder='Senha'
                            value={password}
                            aoAlterado={value => setPassword(value)}
                        />
                        <CampoInput
                            required={true}
                            type='password'
                            placeholder='Confirme a senha'
                            value={confirmPass}
                            aoAlterado={value => setConfirmPass(value)}
                        />

                        <label>Tipo</label>
                        <select required={true} value={type} onChange={(e) => {
                            setType(e.target.value)
                            if (e.target.value === "Adm") {
                                setDepartment("Adm");
                                setCompany("Conecta Cargo");
                            }
                        }} >
                            {types.map((type) => {
                                return <option key={type}>{type}</option>
                            })}
                        </select>

                        {type === "Funcionario" &&
                            <>
                                <label>Departamento</label>
                                <select value={department} onChange={(e) => {
                                    setDepartment(e.target.value)
                                    setCompany("Conecta Cargo")
                                }}>
                                    {departments.map((department) => {
                                        return <option key={department}>{department}</option>
                                    })}
                                </select>
                            </>
                        }

                        {type === "Cliente" &&
                            <>
                                <label>Empresa</label>
                                <select value={company} onChange={(e) => {
                                    setDepartment("Cliente")
                                    setCompany(e.target.value)
                                }}>
                                    {companies.map((company) => {
                                        return <option key={company}>{company}</option>
                                    })}
                                </select>
                            </>
                        }
                    </div>
                    <div className={styles.footer}>
                        <button className={styles.botao_prosseguir} type='submit'>Criar</button>
                        <button className={styles.botao_cancelar} type='button' onClick={abrirFecharModal}>Cancelar</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
