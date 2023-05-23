import React from 'react'
import styles from './Navbar.module.css'
import logo from './logo-site.jpg'
import NavbarLink from 'components/NavbarLink'

export default function Navbar({ usuario }) {
    return (
        <header className={styles.cabecalho}>
            <div>
                <img src={logo} className={styles.logo} alt="logo da conecta" />
            </div>
            <nav className={styles.links}>
                <NavbarLink url={'/'}>Login</NavbarLink>
                <NavbarLink url={'/chat'}>Chat</NavbarLink>
                <NavbarLink url={'/configuracoes'}>Configuracoes</NavbarLink>
                <span>{usuario.name}</span>
                <div>
                    <img src="http://github.com/wesleymo22.png" className={styles.avatar} alt="Imagem de um avatar" />
                </div>
            </nav>
        </header>
    )
}
