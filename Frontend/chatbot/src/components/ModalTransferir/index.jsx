import Modal from 'react-modal'
import React, { useEffect, useState } from 'react'
import Botao from 'components/Botao'
import styles from './ModalTransferir.module.css'
import api from 'config'
import Select from 'components/Select'

export default function ModalTransferir({ isOpen, abrirFecharModal, contatoFila, atualizaContatosFila }) {
  const [transferir, setTransferir] = useState('') //item selecionado
  const [funcionarios, setFuncionarios] = useState([]) //dados dos funcionarios completos
  const [nomesFuncionarios, setNomesFuncionarios] = useState([]) //nome dos funcionarios para as opcoes
  const token = sessionStorage.getItem('token') // pega token da sessao
  const opcoes = [false, "SAC", "Comercial", "Motoristas", ...nomesFuncionarios] // lista de opções completa

  //busca funcionarios na API
  useEffect(() => {
    api.get('usuario', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(resposta => {
        const nomesFuncionarios = resposta.data.map(funcionario => funcionario.name); //cria um array de nomes
        setFuncionarios(resposta.data) //coloca os dados completos na variavel funcionario
        setNomesFuncionarios([...nomesFuncionarios]); // coloca o array de nomes na varivel
      });
  }, [token])

  const transferirPara = async () => {
    if (transferir === "SAC" || transferir === "Comercial" || transferir === "Motoristas") { // se for para fila
      try {
        let dados = contatoFila // coloca od dados em uma variavel
        dados.status = "espera" // altera o campo status
        dados.department = transferir // altera o campo departamento
        await api.put('/fila', dados) //envia para API
          .then(resposta => {
            alert(`transferido com sucesso para ${resposta.data.department}`) //cria um popup
            setTransferir('') //limpa o campo
            abrirFecharModal() //fecha o modal
            atualizaContatosFila() //atualiza os contatos
          })
      } catch (error) {
        console.log(error)
      }
    }
    else { // se for funcionario
      try {
        funcionarios.forEach(funcionario => { // percorre toda lista de funcionarios
          if (funcionario.name === transferir) { //encontra o nome
            let dados = contatoFila //coloca os dados da fila em uma variavel
            dados.user = funcionario._id //altera para o funcionario desejado
            api.put('/fila', dados) //chama 
              .then(resposta => {
                alert(`transferido com sucesso para ${transferir}`) //cria um popup
                setTransferir('') //limpa o campo
                abrirFecharModal() //fecha o modal
                atualizaContatosFila() //atualiza os contatos
              })
          }
        });
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div >
      <Modal
        className={styles.modal}
        style={{
          overlay: {
            position: 'fixed',
            zIndex: 2,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255, 255, 255, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
        }}
        isOpen={isOpen}
        ariaHideApp={false} >

        <form className={styles.formulario}>
          <div className={styles.header}>
            <h2>Transferir</h2>
          </div>
          <div className={styles.body}>
            <Select
              required={true}
              label={'Transferir para:'}
              value={transferir}
              opcoes={opcoes}
              aoAlterado={value => setTransferir(value)}
            />
          </div>
          <div className={styles.footer}>
            <Botao cor='primaria' onClick={transferirPara}>Transferir</Botao>
            <Botao cor='vermelho' onClick={abrirFecharModal}>Cancelar</Botao>
          </div>
        </form>
      </Modal>
    </div>
  )
}
