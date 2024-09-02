const express = require('express');
const router = express.Router();

router.get("/",(req, res)=>{
    res.render('pedidos');
});
app.get('/pedidos', (req, res) => {
    if (req.session.user) {
        const queryCategorias = 'SELECT cod_categoria, nombres_categoria FROM categoria';
        conexion.query(queryCategorias, (err, categorias) => {
            if (err) {
                console.error("Error al obtener categorías:", err);
                return res.status(500).send("Error al obtener categorías");
            }
            res.render('solicitudes', { nombreUsuario: req.session.user.nombres_usu, categorias: categorias });
        });
    } else {
        res.redirect("/login");
    }
});

module.exports = router;