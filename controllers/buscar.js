const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'categoria',
    'roles',
    'productos'
]

const buscarUsuarios = async(termino = '', res = response) => {
    const esMondoId =  ObjectId.isValid(termino);

    if (esMondoId) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            results: usuario ? [ usuario ] : []
        })
    }
    
    // para que busque los elementos de la BD que contengan el termino
    const regex = new RegExp(termino, 'i');

    const usuarios = await Usuario.find({ 
        $or: [ {nombre: regex}, {correo: regex} ],
        $and: [ {estado: true} ]
    });

    return res.json({
        results: usuarios
    })
}

const buscarCategorias = async(categoria = '', res = response) => {
    const esMondoId =  ObjectId.isValid(categoria);

    if (esMondoId) {
        const categoria = await Categoria.findById(categoria);
        return res.json({
            results: categoria ? [ categoria ] : []
        })
    }
    
    const regex = new RegExp(categoria, 'i');

    const categorias = await Categoria.find({ nombre: regex, estado: true });

    return res.json({
        results: categorias
    })
}

buscarProductos = async(producto = '', res = response) => {
    const esMondoId =  ObjectId.isValid(producto);

    if (esMondoId) {
        const producto = await Producto.findById(producto).populate('categoria', 'nombre');
        
        return res.json({
            results: producto ? [ producto ] : []
        })
    }
    
    const regex = new RegExp(producto, 'i');

    const productos = await Producto.find({ nombre: regex, estado: true, disponible: true }).populate('categoria', 'nombre');

    return res.json({
        results: productos
    })
}

const buscar = (req, res = response) => {
    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`
        })
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            break;
        case 'categoria':
            buscarCategorias(termino, res);
            break;
        case 'productos':
            buscarProductos(termino, res);
            break;
    
        default:
            res.status(500).json({
                msg: 'Esta busqueda no esta contemplada'
            })
            break;
    }

}

module.exports = {
    buscar
}