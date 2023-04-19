import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import styles from './Conversas.module.css'

export default function Conversas() {
    return (
        <div className={styles.container}>
            <ConversasHeader />
            <ConversasBody />
            <ConversasFooter />
        </div>
    )
}
