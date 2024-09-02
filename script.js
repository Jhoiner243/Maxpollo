const express = require('express');
const db = require("./config/conexion")
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const routes = require('./rutas');

//Rutas de paginas dinamicas 
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(require("./rutas/productos"));
app.use(require("./rutas/index"));
app.use(require("./rutas/pedidos"))

app.post('/finalizar-pedido', (req, res) => {
  const { cliente_id, productos } = req.body;

  console.log('Datos recibidos:', req.body);

  const datosFaltantes = [];

    if (!cliente_id) {
        datosFaltantes.push('cliente_id');
    }

    if (!productos || productos.length === 0) {
        datosFaltantes.push('productos');
    } else {
        productos.forEach((producto, index) => {
            if (!producto.id || !producto.cantidad || !producto.precio) {
                datosFaltantes.push(`producto ${index + 1}`);
            }
        });
    }

    if (datosFaltantes.length > 0) {
        console.log('Error: Faltan los siguientes datos:', datosFaltantes);
        return res.status(400).send({ message: 'Datos incompletos', detalles: datosFaltantes });
    }

  const total = productos.reduce((sum, p) => sum + p.cantidad * p.precio, 0); // Asegúrate de que 'precio' se usa aquí

  const pedidoQuery = `INSERT INTO pedidos (cliente_id, fecha, total) VALUES (?, CURDATE(), ?)`;
  db.query(pedidoQuery, [cliente_id, total], (err, result) => {
      if (err) {
          console.error('Error al insertar el pedido:', err);
          return res.status(500).send({ message: 'Error al crear el pedido' });
      }

      const pedido_id = result.insertId;

      productos.forEach(producto => {
          const detalleQuery = `INSERT INTO detalles_pedido (pedido_id, producto, cantidad, precio_venta) VALUES (?, ?, ?, ?)`;
          db.query(detalleQuery, [pedido_id, producto.id, producto.cantidad, producto.precio], (err) => { // Asegúrate de que 'precio' y 'id' se usan correctamente
              if (err) {
                  console.error('Error al insertar el detalle del pedido:', err);
                  return res.status(500).send({ message: 'Error al crear el detalle del pedido' });
              }
          });
      });

      res.send({ message: 'Pedido creado exitosamente', pedido_id });
  });
});



app.get('/pedidos', (req, res) => {
  const productosQuery = 'SELECT * FROM productos';
  const clienteId = 1;
  db.query(productosQuery, (err, resultados) => {
      if (err) {
          console.error('Error al obtener los productos:', err);
          return res.status(500).send('Error en el servidor');
      }

      // Renderizar la vista y pasar los productos como una variable
      res.render('pedidos', { productos: resultados, clienteId: clienteId })
  });
});

// Ruta para las ganancias 
app.get('/ganancias', (req, res) => {
  const gananciasQuery = `
      SELECT DATE_FORMAT(DATE(fecha), '%d-%m-%Y') AS fecha, 
             SUM((dp.precio_venta - p.precio_compra) * dp.cantidad) AS ganancia
      FROM detalles_pedido dp
      JOIN productos p ON dp.producto = p.id
      JOIN pedidos ped ON dp.pedido_id = ped.id
      WHERE DATE(fecha) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC;
  `;

  db.query(gananciasQuery, (err, resultados) => {
      if (err) {
          console.error('Error al obtener las ganancias:', err);
          return res.status(500).send('Error en el servidor');
      }

      const datos = {
          gananciasSemanales: resultados.map(row => ({
              ...row,
              ganancia: parseFloat(row.ganancia).toFixed(2)
          }))
      };

      res.render('ganancias', { datos: datos });
  });
});




// Ruta para registrar un pago
app.post('/pago', (req, res) => {
    const { pedido_id, monto } = req.body;

    const pagoQuery = `INSERT INTO pagos (pedido_id, monto, fecha) VALUES (?, ?, CURDATE())`;
    db.query(pagoQuery, [pedido_id, monto], (err) => {
        if (err) throw err;

        // Actualizar estado del pedido si ha sido pagado completamente
        const updatePedidoQuery = `
            UPDATE pedidos
            SET estado = IF(
                (SELECT SUM(monto) FROM pagos WHERE pedido_id = ?) >= (SELECT total FROM pedidos WHERE id = ?),
                'pagado',
                estado
            )
            WHERE id = ?
        `;
        db.query(updatePedidoQuery, [pedido_id, pedido_id, pedido_id], (err) => {
            if (err) throw err;
            res.send({ message: 'Pago registrado y pedido actualizado' });
        });
    });
});

// Rutas
app.get('/', (req, res) => {
    res.render('index');
  });
  
  app.get('/clientes', (req, res) => {
    res.render('clientes');
  });
  app.get('/pagos', (req, res) => {
    res.render('pagos');
  });
  
  app.get('/pedidos', (req, res) => {
    res.render('pedidos');
  });
  
  app.get('/ganancias', (req, res) => {
    res.render('ganancias');
  });
  
  // Ruta de API para obtener productos (ejemplo)
  app.get('/api/productos', (req, res) => {
    // Aquí deberías realizar la consulta a la base de datos
    res.json([
      { id: 1, nombre: 'Pollo' },
      { id: 2, nombre: 'Pechuga' },
      // Otros productos
    ]);
  });
// Escuchar en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
