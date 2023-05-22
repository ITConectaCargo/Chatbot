import ModalCadastroUsuario from 'components/ModalCadastroUsuario'
import Login from 'components/Login'
import styles from './Home.module.css'
import React, { useState } from 'react'

export default function Home() {
    const [abrirModal, setAbrirModal] = useState(false)

    const abrirFecharModal = () => {
        setAbrirModal(!abrirModal)
    }

    return (
        <main>
            <section className={styles.container}>
                <Login abrirFecharModal={abrirFecharModal} />
                <ModalCadastroUsuario
                    isOpen={abrirModal}
                    abrirFecharModal={abrirFecharModal}
                />
            </section>
        </main>
    )
}
