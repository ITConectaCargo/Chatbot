

class configuracoes {
    
    static ajustes = (req, res) => {
        res.status(200).send({
            "id": 1,
            "nome": "ajustes"
        });
    }
}

export default configuracoes