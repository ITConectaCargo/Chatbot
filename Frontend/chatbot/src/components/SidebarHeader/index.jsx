import BotaoChat from "components/BotaoChat"
import styles from "./SidebarHeader.module.css"
import { FiDownload } from "react-icons/fi"

export default function SidebarHeader({usuario}) {

    return (
        <div className={styles.container}>
            <BotaoChat nome={" Chat"}><FiDownload/></BotaoChat>
        </div>
    )
}
