import Usuario from "../models/usuario.js"
import Autenticacao from "../models/autenticacao.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
class usuario {

    static consultaUsuario = (req, res) => {

    }

    static consultaUsuarioById = async (req, res) => {
        const id = req.params.id;

        // verifica se o ususario existe
        const user = await Usuario.findById(id);

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado!" });
        }

        res.status(200).json({ user })
    }

    static autenticaUsuario = async (req, res) => {
        const { email, password } = req.body
        try {
            //verifica se existe o usuario
            const user = await Usuario.findOne({ email: email })
                .select('password')
                .exec()

            //verifica se senha é valida    
            const eValida = await bcrypt.compare(password, user.password)

            if (!eValida) {
                return res.status(401).json({ msg: "usuario ou senha invalidos" })
            }

            try {
                const secret = process.env.SECRET

                const token = jwt.sign(
                    { id: user._id },
                    secret,
                    { expiresIn: 28800 }, //8 horas
                    //{ expiresIn: 60 }, //1 min
                )
                
                // Atualiza o campo 'token' no documento de autenticação do usuário
                let auth = await Autenticacao.findOne({ userId: user._id });

                if (auth) {
                    auth.token = token;
                } else {
                    auth = new Autenticacao({
                        userId: user._id,
                        token
                    });
                }

                await auth.save();

                return res.status(200).json({ token: token });

            } catch (error) {
                console.log(error)
                return res.status(500)
            }

        } catch (error) {
            console.log(error)
            return res.status(401).json({ msg: "usuario ou senha invalidos" })
        }
    }

    static criarUsuario = async (req, res) => {
        try {
            //atribui o que vem da requisição nas variaveis
            const { name, email, password, confirmPass, type, department, company } = req.body

            //verifica se email ja existe no banco
            try {
                const user = await Usuario.findOne({ email: email })
                return res.status(200).json({
                    msg: `Usuario ${user.name} ja existe`
                })
            } catch (error) {
                console.log(error)
            }

            //verifica se todos os itens estao preenchidos
            if (!name || name === "") {
                return res.status(422).json({ msg: "Nome é requerido" })
            }
            if (!email || email === "") {
                return res.status(422).json({ msg: "Email é requerido" })
            }
            if (!type || type === "") {
                return res.status(422).json({ msg: "Tipo é requerido" })
            }
            if (!department || department === "") {
                return res.status(422).json({ msg: "Departamento é requerido" })
            }
            if (!company || company === "") {
                return res.status(422).json({ msg: "Empresa é requerido" })
            }
            if (password !== confirmPass) {
                return res.status(422).json({ msg: "Senhas nao conferem" })
            }

            try {
                //cria senha cryptografada
                const salt = await bcrypt.genSalt(12)
                const passwordHash = await bcrypt.hash(password, salt)

                //cria usuario
                const user = new Usuario({
                    name,
                    email,
                    password: passwordHash,
                    type,
                    department,
                    company,
                    isActive: true
                });
                const newUser = await user.save();
                console.log(newUser)

                return res.status(201).json({ msg: "usuario criado com sucesso" })
            }
            catch (error) {
                console.log(error)
                res.status(500).json({ msg: "ocorreu um erro ao criar o usuario" })
            }
        } catch (error) {
            console.log(error)
        }
    }

    static atualizaUsuario = (req, res) => {

    }
}

export default usuario