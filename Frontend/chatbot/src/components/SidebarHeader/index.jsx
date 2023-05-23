import styles from "./SidebarHeader.module.css"
import { MdMoreVert, MdChat } from "react-icons/md"

export default function SidebarHeader({usuario}) {

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
