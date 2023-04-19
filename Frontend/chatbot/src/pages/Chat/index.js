import styles from "./Chat.modules.css"
import Sidebar from "components/Sidebar"
import Conversas from "components/Conversas"

export default function Chat() {
  return (
    <>
      <section className={styles.container}>
        <Sidebar />
        <Conversas />
      </section>
    </>
  )
}
