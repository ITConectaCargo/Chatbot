import styles from "./SidebarHeader.module.css"
import { MdMoreVert, MdChat } from "react-icons/md"

export default function SidebarHeader() {

    return (
        <div className={styles.container}>
            <div>
                <img src="http://github.com/wesleymo22.png" className={styles.avatar} alt="Imagem de um avatar" />
                <span>Wesley Moraes</span>
            </div>
            <div>
                <MdChat />
                <MdMoreVert />
            </div>
        </div>
    )
}
