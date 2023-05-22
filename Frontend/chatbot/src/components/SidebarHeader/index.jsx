import api from "config"
import styles from "./SidebarHeader.module.css"
import { MdMoreVert, MdChat } from "react-icons/md"
import { useEffect, useState } from "react"

export default function SidebarHeader({token, userId}) {
    const [usuario, setUsuario] = useState()

    useEffect(() => {
        api.get(`usuario/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(resposta => {
            setUsuario(resposta.data.user)}
            )
        .catch(error => {
            console.log(error)
            alert(error.response.data.msg)
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('userId')
            window.location.reload()
        })

    }, [userId, token])

    console.log(usuario)

    return (

        <div className={styles.container}>
            <div>
                <img src="http://github.com/wesleymo22.png" className={styles.avatar} alt="Imagem de um avatar" />
                <span>{usuario? usuario.name : ""}</span>
            </div>
            <div>
                <MdChat />
                <MdMoreVert />
            </div>
        </div>
    )
}
