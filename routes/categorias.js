const { Router } = require('express');
const { check } = require('express-validator');
const { 
    crearCategoria, 
    obtenerCategorias, 
    obtenerCategoria,
    actualizarCategoria,
    borrarCategoria
} = require('../controllers/categorias');
const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');
const { existeCategoria } = require('../helpers/db-validators');

const router = Router();

// obtener todas las categorias 
router.get('/', obtenerCategorias);

// obtener una categorias por id
router.get('/:id', [
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeCategoria ),
    validarCampos,
], obtenerCategoria);

// crear categoria - privado - cualquier persona con un token valido
router.post('/', [ 
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
    ], crearCategoria)

// actualizar una categorias por id - privado - cualquier persona con un token valido
router.put('/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('id').custom( existeCategoria ),
    validarCampos
], actualizarCategoria);

// borrar una categorias por id - admin
router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeCategoria ),
    validarCampos
], borrarCategoria);

module.exports = router;