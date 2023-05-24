import BotaoChat from "components/BotaoChat"
import styles from "./SidebarHeader.module.css"
import { FiDownload } from "react-icons/fi"
import { MdUpdate } from "react-icons/md"

export default function SidebarHeader({buscaContatoFila, atualizaContatosFila}) {
    return (
        <div className={styles.container}>
            <BotaoChat nome={" Chat"} onClick={buscaContatoFila}><FiDownload/></BotaoChat>
            <BotaoChat nome={" Atualizar"} onClick={atualizaContatosFila}><MdUpdate/></BotaoChat>
        </div>
    )
}
