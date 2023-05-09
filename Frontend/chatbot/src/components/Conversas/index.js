import ConversasFooter from 'components/ConversasFooter'
import ConversasHeader from 'components/ConversasHeader'
import ConversasBody from 'components/ConvesasBody'
import catGiphy from './cat.gif'
import styles from './Conversas.module.css'

export default function Conversas({ contato }) {
    return (
        <>
            {!contato ? 
            <div className={styles.sem_dados}>
            <img src={catGiphy} alt='Gif de gatinho dormindo'></img>
            </div>
                :
                <div className={styles.container}>
                    <ConversasHeader contato={contato} />
                    <ConversasBody />
                    <ConversasFooter />
                </div>
            }
        </>
    )
}
