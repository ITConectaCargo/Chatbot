import ModalCadastroUsuario from 'components/ModalCadastroUsuario'
import Login from 'components/Login'
import React, { useState } from 'react'

export default function Home() {
    const [abrirModal, setAbrirModal] = useState(false)

    const abrirFecharModal = () => {
        setAbrirModal(!abrirModal)
    }

    return (
        <>
            <Login abrirFecharModal={abrirFecharModal} />
            <ModalCadastroUsuario
                isOpen={abrirModal}
                abrirFecharModal={abrirFecharModal}
            />
        </>
    )
}
