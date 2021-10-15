const express = require('express');
const multer = require('multer');
const router = express.Router();
const { check } = require('express-validator');

// Multer para aceptar la imagen en el formulario de registro
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../public/img/users');
    },
    filename: (req, file, cb) => {
        const newFileName = 'user' + Date.now() + path.extname(file.originalname);
        cb(null, newFileName);
    },
});

const upload = multer({ storage });

// Controlador de productos
const adminProductController = require('../controllers/adminProductController');

const loggedAdminMiddleware = require('../middlewares/loggedAdminMiddleware');

// Validación para el formulario de creación de un producto
const validaciones = [
    check('nombre').notEmpty().withMessage('Debes escribir un nombre para el producto'),
    check('descripcion').notEmpty().withMessage('Debes escribir una descripción para el producto'),
    check('modelo').notEmpty().withMessage('Debes escribir un modelo para el producto'),
    /*
    check('categoria').notEmpty().withMessage('Debes elegir al menos 1 categoria'),

    check('genero').notEmpty().withMessage('Elige un genero'),
    check('disponible').notEmpty().withMessage('Debes especificar si el producto estará disponible o no'),
    check('color').notEmpty().withMessage('Debes elegir al menos 1 color'),
    check('talla').notEmpty().withMessage('Debes elegir al menos 1 talla'),
    check('precio').notEmpty().withMessage('Tienes que especificar un precio').bail().isInt().withMessage('El precio tiene que ser un número'),
    check('descuento').optional({ checkFalsy: true }).isInt().withMessage('Debes escribir un número entero'),
    check('cantidad').notEmpty().withMessage('Debes asignar una cantidad de productos')
    */
];

/* Rutas */

// pagina principal admin
router.get('/', loggedAdminMiddleware, adminProductController.index);

// listado de todos los productos
router.get('/products', loggedAdminMiddleware, adminProductController.products);

// listado de todos los usuarios
router.get('/users', loggedAdminMiddleware, adminProductController.users);

// detalle de los usuarios
router.get('/users/:id', loggedAdminMiddleware, adminProductController.usersDetail);

// ver el formulario de edicion de un usuario
router.get('/edit/user/:id', loggedAdminMiddleware, adminProductController.editUser);

// accion de edicion de un usuario por parte del admin
router.put('/user/edit/:id', loggedAdminMiddleware, upload.single('imagen'), adminProductController.updateUser);

// eliminar un usuario
router.delete('/user/delete/:id', loggedAdminMiddleware, adminProductController.deleteUser);

// página de administrador
//router.get('/products-admin', adminProductController.admin);

// obtener el formulario de creación de productos
router.get('/create', loggedAdminMiddleware, adminProductController.add);
//router.get('/create',  adminProductController.add);

// acción de creación, donde se envía el formulario de creación de productos
router.post('/', loggedAdminMiddleware, validaciones, adminProductController.store);
//router.post('/',  validaciones, adminProductController.store);

// detalle de un producto
//router.get('/product-detail/:id', adminProductController.detalle);

// formulario de edición de productos
router.get('/edit/:id', loggedAdminMiddleware, adminProductController.edit);
//router.get('/edit/:id',  adminProductController.edit);

// acción de edición, donde se envía el formulario de edición de productos
router.put('/:id', adminProductController.update);
//router.put('/:id', adminProductController.update);

// acción de borrado de un producto
router.delete('/delete/:id', loggedAdminMiddleware, adminProductController.delete);
//router.delete('/delete/:id',  adminProductController.delete);

module.exports = router;