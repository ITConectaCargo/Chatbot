import Usuario from "../models/usuario.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
class usuario {

    static consultaUsuario = (req, res) => {

    }

    static consultaUsuarioById = (req, res) => {

    }

    static autenticaUsuario = async (req, res) => {
        const { email, password } = req.body
        try {
            //verifica se existe o usuario
            const user = await Usuario.findOne({ email: email })
                .select('password')
                .exec()

            try {
                console.log(user)
                //verifica se senha é valida
                const eValida = await bcrypt.compare(password, user.password)

                try {
                    const secret = process.env.SECRET

                    const token = jwt.sign(
                        {
                            id: user._id
                        },
                        secret
                    )

                    res.status(200).json({msg: 'Autenticado com sucesso', token})
                } catch (error) {
                    console.log(error)
                    res.status(500).json('erro ao autenticar')
                }

            } catch (error) {
                return res.status(422).json({ msg: "senha invalida" })
            }

        } catch (error) {
            console.log(error)
            return res.status(404).json({ msg: "usuario nao encontrado" })
        }
    }

    static criarUsuario = async (req, res) => {
        const { name, email, password, confirmPass, type, department, cnpj } = req.body
        try {
            const user = await Usuario.findOne({ email: email })
        } catch (error) {
            return res.status(422).json({ msg: "usuario ja existe" })
        }

        if (!name || name === "") {
            return res.status(422).json({ msg: "nome é requerido" })
        }
        if (!email || email === "") {
            return res.status(422).json({ msg: "email é requerido" })
        }
        if (!type || type === "") {
            return res.status(422).json({ msg: "tipo é requerido" })
        }
        if (!department || department === "") {
            return res.status(422).json({ msg: "departamento é requerido" })
        }
        if (!cnpj || cnpj === "") {
            return res.status(422).json({ msg: "cnpj é requerido" })
        }
        if (password !== confirmPass) {
            return res.status(422).json({ msg: "as senhas nao conferem" })
        }

        try {
            //cria senha cryptografada
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            const user = new Usuario({
                name,
                email,
                password: passwordHash,
                type,
                department,
                cnpj,
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
    }

    static atualizaUsuario = (req, res) => {

    }
}

export default usuario