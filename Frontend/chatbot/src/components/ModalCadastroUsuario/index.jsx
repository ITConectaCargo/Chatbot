import React, { useState } from 'react'
import { API_URL } from 'config.js'
import Modal from 'react-modal'
import axios from 'axios'
import styles from './ModalCadastroUsuario.module.css'
import CampoInput from 'components/CampoInput'
import Botao from 'components/Botao'
import Select from 'components/Select'

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

                        <Select
                            required={true}
                            label={'Tipo'}
                            value={type}
                            opcoes={types}
                            aoAlterado={value => {
                                setType(value)
                                if (value === "Adm") {
                                    setDepartment("Adm");
                                    setCompany("Conecta Cargo");
                                }
                            }}
                        />

                        {type === "Funcionario" &&
                            <>
                                <Select
                                    label={'Departamento'}
                                    value={department}
                                    opcoes={departments}
                                    aoAlterado={value => {
                                        setDepartment(value)
                                        setCompany("Conecta Cargo");
                                    }}
                                />
                            </>
                        }

                        {type === "Cliente" &&
                            <>
                                <Select
                                    label={'Empresa'}
                                    value={company}
                                    opcoes={companies}
                                    aoAlterado={value => {
                                        setCompany(value)
                                        setDepartment("Cliente");
                                    }}
                                />
                            </>
                        }
                    </div>
                    <div className={styles.footer}>
                        <Botao cor={'primaria'} type="submit">Criar</Botao>
                        <Botao cor={'vermelho'} onClick={abrirFecharModal}>Cancelar</Botao>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
