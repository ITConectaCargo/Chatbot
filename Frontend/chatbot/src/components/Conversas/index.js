import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import styles from './Conversas.module.css'

export default function Conversas({ contato }) {
    return (
        <>
            <div className={styles.container}>
                <ConversasHeader contato={contato} />
                <ConversasBody />
                <ConversasFooter />
            </div>
        </>

    )
}
