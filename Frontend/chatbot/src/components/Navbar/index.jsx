import React from 'react'
import styles from './Navbar.module.css'
import logo from './logo-site.jpg'
import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <header className={styles.cabecalho}>
            <div>
                <img src={logo} className={styles.logo} alt="logo da conecta" />
            </div>
            <nav className={styles.links}>
                <Link to='/' >Login</Link>
                <Link to='/chat' >Chat</Link>
            </nav>
            <div>
                <img src="http://github.com/wesleymo22.png" className={styles.avatar} alt="Imagem de um avatar" />
            </div>
        </header>
    )
}
