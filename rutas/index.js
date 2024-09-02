const express = require('express');
const router = express.Router();
const conexion = require("../config/conexion"); // Asegúrate de importar la conexión

router.get("/",(req, res)=>{
    res.render('index');
});

router.post('/index', (req, res) => {
    const { nombre, precioCompra, cantidad } = req.body;  // Ajusta el orden de los valores

    const queryInsert = 'INSERT INTO productos (nombre_producto, precio_compra, cantidad) VALUES (?, ?, ?)';
    const values = [nombre, precioCompra, cantidad];  // Ajusta el orden aquí también

    conexion.query(queryInsert, values, (err, result) => {
        if (err) {
            console.error("Error al insertar solicitud de servicio:", err);
            return res.status(500).send("Error al registrar la solicitud de servicio");
        }
        
        console.log("Productos guardados", result);
        res.redirect('/pedidos'); // Redirige después de insertar el producto
    });
});


module.exports = router;