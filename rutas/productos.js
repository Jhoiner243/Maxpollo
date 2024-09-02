const express = require('express');
const router = express.Router();
const conexion = require("../config/conexion"); // Asegúrate de importar la conexión

router.get("/productos", (req, res) => {
    const querySelect = 'SELECT * FROM productos';

    conexion.query(querySelect, (err, productos) => {
        if (err) {
            console.error("Error al obtener los productos:", err);
            return res.status(500).send("Error al obtener los productos");
        }
        
        res.render('productos', { productos: productos });
    });
});

module.exports = router;