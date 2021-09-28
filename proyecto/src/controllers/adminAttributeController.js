const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const { validationResult } = require('express-validator');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const date = Date.now();
const db = require('../database/models');
const Attribute = require('../database/models/Attribute');


const adminProductController = {

    // listado de todos los productos
    index: function (req, res) {
        db.Product.findAll({
            include : [ { model: db.Attribute,
                            as: "products_attributes" }]
        })
        .then( products => {
            let producto = [];
            products.forEach(element => {
                let este = element.dataValues.products_attributes;
                let tempPro = {};
                /* El usuario normal debería ver sólo los atributos que existen: 
                este.length > 0 */
                /* El administrador debe ver también los productos que no tiene atributos
                este.length >= 0 */
                if(este.length > 0){
                    tempPro = {
                        id_product: element.dataValues.id_product,
                        name: element.dataValues.name,
                        price: este[0].dataValues.price,
                        image: este[0].dataValues.image
                    }
                    //console.log(element.dataValues.products_attributes[0].dataValues)
                    //return res.send(producto);
                    producto.push(tempPro);
                } else {
                    /* esto sólo lo debería ver el administrador */
                    tempPro = {
                        id_product: element.dataValues.id_product,
                        name: element.dataValues.name,
                        price: 0,
                        image: 'default-image.png'
                    }
                    //console.log(element.dataValues.products_attributes[0].dataValues)
                    //return res.send(producto);
                    producto.push(tempPro);

                }
            });
            console.log(producto);
            //res.send(producto);
            res.render('adminProduct/admin-products', { productos: producto, titelId: 0 })
        }) 
        .catch(function (err) {
            console.log(err);
        })
    },

   
    // página del administrador, donde se ven las opciones de crear y editar un producto
    admin: function (req, res) {
        res.render('admin/products-admin');
    },

    // página de creación de un producto
    add: function (req, res) {
        res.render('admin/add-product');
    },

    // método que contiene la lógica cuando se guarda un producto
    store: (req, res) => {
        let errors = validationResult(req);
        console.log(req.body);
        //console.log(req.file);
        if (errors.isEmpty()) { // si no hay errores, se guarda el producto
            /*
            let img = "default-image.png";
            if (req.file != undefined) {
                img = req.body.imagen;
            }
            */

            db.Product.create({
                name: req.body.nombre,
                description: req.body.descripcion,
                model: req.body.modelo,
                created_at: Date.now(),
                /*
                products_attributes: [{
                    available: req.body.disponible,
                    image: img,
                    price: req.body.precio,
                    discount: req.body.descuento,
                    quantity: req.body.cantidad,
                    gender: req.body.genero,
                    size_id: req.body.talla,
                    color_id: req.body.color,
                    category_id: req.body.categoria
                },
            ] }*/
            /*
            ,
             {
                include: [{ model: db.Attribute, as: 'products_attributes' }]*/
            })
                .then(function (resp) {
                    console.log("no hubo errores")
                    res.redirect('/admin/');
                })
                .catch(function (err) {
                    console.log(err);
                })

        } else { // si existe algún error, se renderiza de nuevo el formulario
            console.log(req.body);
            console.log("si hubo errores");
            //console.log(req.file);
            /*
            let promCategory = db.Category.findAll()
            let promColor = db.Color.findAll()
            let promSize = db.Size.findAll()

            */
/*
            Promise.all([promCategory, promColor, promSize])
                .then(function ([resCategory, resColor, resSize]) {
                    //console.log(resCategory, resColor, resSize);
                    res.render('admin/add-product', { categories: resCategory, colors: resColor, sizes: resSize, error: errors.mapped(), old: req.body });
                })
                .catch(function (err) {
                    console.log(err);
                })

                */
            res.render('admin/add-product', { error: errors.mapped(), old: req.body });
        }
    },

    // página de detalle de un producto
    detalle: function (req, res) {
        const colores = [];
        const tamanos = [];
        const categorias = [];
        let id = req.params.id;
/****************** Colors */
        db.Product.findAll({
            include : [ {   model: db.Color,
                            as: "products_colors",
                              }],
            where: {id_product: id}
        })
        .then(colors => {
            colors.forEach(element => {
                
                let este = element.dataValues.products_colors;
                este.forEach( colorTemp => {
                    //console.log(colorTemp.dataValues)
                    let tempColor = {
                        id_color : colorTemp.dataValues.id_color,
                        name : colorTemp.dataValues.name
                    };
                    colores.push(tempColor);
                })
                //console.log(este);
            });
            //console.log(colores);
        })
        .catch(function (err) {
            console.log(err);
        })
        console.log("colores ")
/****************** Sizes */

            db.Product.findAll({
                include : [ 
                    {   model: db.Size,
                        as: "products_sizes"
                    }],
                where: {id_product: id}
            })
            .then(tam => {
                //console.log(tam.length);

                tam.forEach(element => {
                    
                    let este = element.dataValues.products_sizes;
                    este.forEach( temp => {
                        //console.log(temp.dataValues)
                        let tempSize = {
                            id_size : temp.dataValues.id_size,
                            name : temp.dataValues.name
                        };
                        tamanos.push(tempSize);
                    })
                    //console.log(este);
                });
                //console.log(tamanos);

            })
            .catch(function (err) {
                console.log(err);
            })


        console.log("tamaños ")

        db.Attribute.findAll({
            group: ['id_attribute','available','image','price','discount','quantity','gender','size_id','color_id','category_id','product_id',
                    'product_id'],
            include : [ {   model: db.Product,
                            as: "products",
                            where: { id_product: id } }, 
                      ],

        })
        .then( attributes => {
            //console.log(attributes);
            
            let productos = [];
            attributes.forEach(element => {
                //console.log(element);

                let este = element.dataValues;
                //console.log(este);

                let tempPro = {};

                tempPro = {
                    id: este.product_id,
                    id_attribute: este.id_attribute,
                    nombre: este.products.dataValues.name,
                    precio: este.price,
                    descuento: este.discount,
                    descripcion: este.products.dataValues.description,
                    cantidad: este.quantity,
                    color: este.color_id,
                    talla: este.size_id,
                    imagen: este.image
                };

                productos.push(tempPro);

            });

            //console.log(productos);
            //console.log(colores);
            //console.log(tamanos);
            
            //res.send(productos);
            res.render('products/product-detail', { productos: productos, colores: colores, tamanos: tamanos })

        }) 

        .catch(function (err) {
            console.log(err);
        })

        /*
        let producto;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) producto = products[i];
        }
        res.render('products/product-detail', { producto: producto, productos: products });
        */

    },

    // metodo que devuelve el formulario de edición de un producto
    edit: function (req, res) {
        let id = req.params.id;
        console.log('id ' + id);
        db.Product.findByPk(id)
        .then( pro => {
            console.log(pro);
            //res.render('admin/edit-product', { producto: productoActual });
            res.render('admin/edit-product', { producto: pro });
        })
        .catch(function (err) {
            console.log(err);
        })

        /*
        let id = req.params.id;
        let productoActual;
        for (producto of products) {
            if (producto.id == id) productoActual = producto;
        }
        */


    },

    // acción que actualiza el producto
    update: function (req, res) {
        let id = req.params.id;

        // Se obtiene el producto actual por si no se modifican algunos datos como la imágen
        let productoActual;
        for (producto of products) {
            if (producto.id == id) productoActual = producto;
        }

        // Si no se actualiza la imagen        
        if (req.file == undefined) {
            var product = {
                "id": productoActual.id,
                "nombre": req.body.nombre,
                "descripcion": req.body.descripcion,
                "imagen": productoActual.imagen,
                "categoria": req.body.categoria,
                "genero": req.body.genero,
                "disponible": req.body.disponible,
                "color": req.body.color,
                "talla": req.body.talla,
                "modelo": req.body.modelo,
                "precio": req.body.precio,
                "descuento": req.body.descuento,
                "enCarrito": false,
                "cantidad": req.body.cantidad
            };
        } else { // Si se actualiza la imagen            
            var product = {
                "id": productoActual.id,
                "nombre": req.body.nombre,
                "descripcion": req.body.descripcion,
                "imagen": req.file.filename,
                "categoria": req.body.categoria,
                "genero": req.body.genero,
                "disponible": req.body.disponible,
                "color": req.body.color,
                "talla": req.body.talla,
                "modelo": req.body.modelo,
                "precio": req.body.precio,
                "descuento": req.body.descuento,
                "enCarrito": false,
                "cantidad": req.body.cantidad
            };
        }

        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                products[i] = product;
            }
        }

        productsJSON = JSON.stringify(products);
        fs.writeFileSync(productsFilePath, productsJSON);

        res.redirect('/products/product-detail/' + id);
    },

    // acción de borrado de un producto
    delete: (req, res) => {
        let id = req.params.id;
        newProducts = products.filter((product) => {
            return product.id != id ? product : undefined;
        });
        /* let newProducts = [];
        for (let i = 0; i < products.length; i++) {
            if (products[i].id != id) {
                newProducts.push(products[i]);
            }
        } */

        productsJSON = JSON.stringify(newProducts);
        fs.writeFileSync(productsFilePath, productsJSON);

        //alert("Se ha eliminado el producto");
        res.redirect('/products');
    }

};

module.exports = adminProductController;