import ModalCadastroUsuario from 'components/ModalCadastroUsuario'
import Login from 'components/Login'
import React, { useState } from 'react'
import styles from './Login.module.css'

export default function Home() {
    const [abrirModal, setAbrirModal] = useState(false)

    const abrirFecharModal = () => {
        setAbrirModal(!abrirModal)
    }

    return (
        <section className={styles.container}>
            <Login abrirFecharModal={abrirFecharModal} />
            <ModalCadastroUsuario
                isOpen={abrirModal}
                abrirFecharModal={abrirFecharModal}
            />
        </section>
    )
}
