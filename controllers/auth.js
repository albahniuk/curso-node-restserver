const { response, request } = require('express');
const Usuario = require('../models/usuario');
const { googleVerify } = require('../helpers/google-verify');

const login = async(req, res = response) => {

    const { correo, password } = req.body;

    try {
        // Verificar si el email existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({
                msg: "Usuario/Password no son correctos - correo"
            });
        }

        // Si el usuario está activo
        if (!usuario.estado) {
            return res.status(400).json({
                msg: "Usuario/Password no son correctos - estado: false"
            });
        }

        // Verificar la constraseña
        const validPassword = bcriptjs.compareSync( password, usuario.password );
        if (!validPassword) {
            return res.status(400).json({
                msg: "Usuario/Password no son correctos - password"
            });
        }

        // Generar el JWT (json web token)
        const token = await generarJWT( usuario.id );

        res.json({
            msg: 'login ok'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Hable con el administrador"
        });
    }

    
}
const googleSignin = async(req, res = response) => {
    
    try {
        const { id_token } = req.body;
    
        const { correo, nombre, img } = await googleVerify(id_token);

        let usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            // hay que crearlo
            const data = {
                nombre,
                correo,
                password: ':P',
                img,
                google: true
            };

            usuario = new Usuario(data);
            await usuario.save();
        }

        // si el usuario en DB
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        // Generar el JWT (Json web token)
        const token = await generarJWT( usuario.id );
        
        res.json({
            usuario,
            token
        });
    } catch (error) {
        res.status(400).json({
            msg: 'Token de Google no es válido'
        });
    }


}

module.exports = {
    login,
    googleSignin
};