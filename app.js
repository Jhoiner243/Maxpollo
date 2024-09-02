const productos = [
    { nombre: "Chuleta", precio: 13000 },
    { nombre: "Pernil", precio: 7300 },
    { nombre: "Ala", precio: 8600 },
    { nombre: "Pechuga", precio: 13000 },
    { nombre: "Salchichón", precio: 7600 },
    { nombre: "Paq. Chorizo XXL", precio: 17000 },
    { nombre: "Pollo entero", precio: 8500 },
    { nombre: "Sirloin de cerdo", precio: 15700 },
    { nombre: "Viceras", precio: 6000}
];

let inventario = [];
let pedidosDelDia = [];
let productosPedido = [];

document.addEventListener('DOMContentLoaded', function () {
    const btnInicializar = document.getElementById('btn-inicializar');
    const btnIngresarPedido = document.getElementById('btn-ingresar-pedido');
    const btnCalcularGanancias = document.getElementById('btn-calcular-ganancias');
    const btnVerInventario = document.getElementById('btn-ver-inventario');
    const seccionInicial = document.getElementById('seccion-inicial');
    const seccionPedido = document.getElementById('seccion-pedido');
    const seccionPedidosDia = document.getElementById('seccion-pedidos-dia');
    const seccionGananciasDia = document.getElementById('seccion-ganancias-dia');
    const seccionInventario = document.getElementById('seccion-inventario');
    const seccionFactura = document.getElementById('seccion-factura');
    const listaInicial = document.getElementById('lista-inicial');
    const listaProductos = document.getElementById('lista-productos');
    const listaProductosFactura = document.getElementById('lista-productos-factura');
    const productoSelect = document.getElementById('producto');
    const btnAgregarProducto = document.getElementById('btn-agregar-producto');
    const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');
    const tablaInventario = document.getElementById('tabla-inventario').getElementsByTagName('tbody')[0];
    const listaGananciasReales = document.getElementById('lista-ganancias-reales');
    const totalGanancias = document.getElementById('total-ganancias');
    const totalFactura = document.getElementById('total-factura');

    btnInicializar.addEventListener('click', function () {
        seccionInicial.classList.remove('hidden');
        seccionPedido.classList.add('hidden');
        seccionPedidosDia.classList.add('hidden');
        seccionGananciasDia.classList.add('hidden');
        seccionInventario.classList.add('hidden');
        seccionFactura.classList.add('hidden');
        listaInicial.innerHTML = '';

        productos.forEach((producto, index) => {
            const div = document.createElement('div');
            div.classList.add('mb-3');
            div.innerHTML = `
                <label for="producto${index}" class="form-label">${producto.nombre}:</label>
                <input type="number" id="cantidad${index}" name="cantidad${index}" class="form-control mb-2" placeholder="Cantidad (kg)" step="0.1" min="0" required>
                <input type="number" id="precioCompra${index}" name="precioCompra${index}" class="form-control" placeholder="Precio de Compra (COP)" step="0.01" min="0" required>
            `;
            listaInicial.appendChild(div);
        });
    });

    document.getElementById('btn-guardar-inventario').addEventListener('click', function () {
        inventario = [];
        productos.forEach((producto, index) => {
            const cantidad = parseFloat(document.getElementById(`cantidad${index}`).value);
            const precioCompra = parseFloat(document.getElementById(`precioCompra${index}`).value);
            if (cantidad > 0 && precioCompra > 0) {
                inventario.push({ nombre: producto.nombre, cantidad, precioCompra });
            }
        });

        productoSelect.innerHTML = '';
        inventario.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nombre;
            option.textContent = item.nombre;
            productoSelect.appendChild(option);
        });

        seccionInicial.classList.add('hidden');
        btnIngresarPedido.disabled = false;
        btnCalcularGanancias.disabled = false;
        btnVerInventario.disabled = false;
    });

    btnIngresarPedido.addEventListener('click', function () {
        seccionPedido.classList.remove('hidden');
        seccionInicial.classList.add('hidden');
        seccionPedidosDia.classList.add('hidden');
        seccionGananciasDia.classList.add('hidden');
        seccionInventario.classList.add('hidden');
        seccionFactura.classList.add('hidden');
        productosPedido = [];
        listaProductos.innerHTML = '';
        listaProductosFactura.innerHTML = '';
        totalFactura.textContent = '0 COP';
        btnFinalizarPedido.disabled = true;
        reiniciarCamposPedido();
    });

    btnAgregarProducto.addEventListener('click', function () {
        const producto = productoSelect.value;
        const cantidad = parseFloat(document.getElementById('cantidad').value);
        const precioVenta = parseFloat(document.getElementById('precioVenta').value);

        if (producto && cantidad > 0 && precioVenta > 0) {
            productosPedido.push({ producto, cantidad, precioVenta });

            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.innerHTML = `
                <span>${producto} - ${cantidad} kg - ${precioVenta} COP</span>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${producto}')">Eliminar</button>
            `;
            listaProductos.appendChild(li);

            mostrarProductoEnFactura(producto, cantidad, precioVenta);

            document.getElementById('cantidad').value = '';
            document.getElementById('precioVenta').value = '';
            btnFinalizarPedido.disabled = false;
        }
    });

    btnFinalizarPedido.addEventListener('click', function () {
        let haySuficienteInventario = true;

        // Verificar si hay suficiente inventario para todos los productos
        for (let pedido of productosPedido) {
            const inventarioProducto = inventario.find(item => item.nombre === pedido.producto);
            if (!inventarioProducto || inventarioProducto.cantidad < pedido.cantidad) {
                alert(`No hay suficiente inventario para ${pedido.producto}`);
                haySuficienteInventario = false;
                break;
            }
        }

        // Si hay suficiente inventario, restar las cantidades y añadir el pedido del día
        if (haySuficienteInventario) {
            productosPedido.forEach(pedido => {
                const inventarioProducto = inventario.find(item => item.nombre === pedido.producto);
                inventarioProducto.cantidad -= pedido.cantidad;
                pedidosDelDia.push(pedido);
            });
            actualizarInventario();
            actualizarPedidosDelDia();
            mostrarFactura();
            reiniciarCamposPedido();
            limpiarListaProductos();
            listaProductosFactura.innerHTML = '';
            seccionPedido.classList.remove('hidden');
            seccionFactura.classList.remove('hidden');
        }
    });

    btnCalcularGanancias.addEventListener('click', function () {
        seccionGananciasDia.classList.remove('hidden');
        seccionPedido.classList.add('hidden');
        seccionInicial.classList.add('hidden');
        seccionPedidosDia.classList.add('hidden');
        seccionInventario.classList.add('hidden');
        seccionFactura.classList.add('hidden');
        listaGananciasReales.innerHTML = '';
        
        let gananciasTotales = 0;
        
        pedidosDelDia.forEach(pedido => {
            const inventarioProducto = inventario.find(item => item.nombre === pedido.producto);
            if (inventarioProducto) {
                const precioCompra = inventarioProducto.precioCompra;
                const gananciaRealPorKg = pedido.precioVenta - precioCompra;
                const ganancia = gananciaRealPorKg * pedido.cantidad;
                gananciasTotales += ganancia;
        
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `
                    ${pedido.producto}: ${pedido.cantidad} kg - Ganancia Real por Kg: ${gananciaRealPorKg.toFixed(2)} COP - Ganancia Total: ${ganancia.toFixed(2)} COP
                `;
                listaGananciasReales.appendChild(li);
            }
        });
        
        totalGanancias.textContent = `${gananciasTotales.toFixed(2)} COP`;
        });
        
        btnVerInventario.addEventListener('click', function () {
        seccionInventario.classList.remove('hidden');
        seccionPedido.classList.add('hidden');
        seccionInicial.classList.add('hidden');
        seccionPedidosDia.classList.add('hidden');
        seccionGananciasDia.classList.add('hidden');
        seccionFactura.classList.add('hidden');
        actualizarInventario();
        });
        
        function actualizarInventario() {
        tablaInventario.innerHTML = '';
        inventario.forEach(item => {
            const row = tablaInventario.insertRow();
            row.insertCell(0).textContent = item.nombre;
            row.insertCell(1).textContent = `${item.cantidad} kg`;
            row.insertCell(2).textContent = `${item.precioCompra} COP`;
        });
        }
        
        window.eliminarProducto = function (nombre) {
        productosPedido = productosPedido.filter(p => p.producto !== nombre);
        const item = Array.from(listaProductos.children).find(li => li.textContent.includes(nombre));
        if (item) {
            listaProductos.removeChild(item);
        }
        if (productosPedido.length === 0) {
            btnFinalizarPedido.disabled = true;
        }
        };
        
        function reiniciarCamposPedido() {
        document.getElementById('cantidad').value = '';
        document.getElementById('precioVenta').value = '';
        }
        
        function limpiarListaProductos() {
        listaProductos.innerHTML = '';
        listaProductosFactura.innerHTML = '';
        totalFactura.textContent = '0 COP';
        productosPedido = [];
        btnFinalizarPedido.disabled = true;
        }
        
        function actualizarPedidosDelDia() {
        seccionPedidosDia.innerHTML = '';
        pedidosDelDia.forEach((pedido, index) => {
            const div = document.createElement('div');
            div.classList.add('mb-3');
            div.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Pedido ${index + 1}</h5>
                        <p class="card-text">
                            Producto: ${pedido.producto}<br>
                            Cantidad: ${pedido.cantidad} kg<br>
                            Precio de Venta: ${pedido.precioVenta} COP
                        </p>
                    </div>
                </div>
            `;
            seccionPedidosDia.appendChild(div);
        });
        }
        
        function mostrarProductoEnFactura(producto, cantidad, precioVenta) {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.innerHTML = `
            <span>${producto} - ${cantidad} kg - ${precioVenta} COP</span>
            <span>${(cantidad * precioVenta).toFixed(2)} COP</span>
        `;
        listaProductosFactura.appendChild(li);
        
        const totalPedido = productosPedido.reduce((total, pedido) => total + pedido.precioVenta * pedido.cantidad, 0);
        totalFactura.textContent = `${totalPedido.toFixed(2)} COP`;
        }
        
        function mostrarFactura() {
        listaProductosFactura.innerHTML = '';
        totalFactura.textContent = '0 COP';
        
        let totalPedido = 0;
        productosPedido.forEach(pedido => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.innerHTML = `
                <span>${pedido.producto} - ${pedido.cantidad} kg - ${pedido.precioVenta} COP</span>
                <span>${(pedido.cantidad * pedido.precioVenta).toFixed(2)} COP</span>
            `;
            listaProductosFactura.appendChild(li);
        
            totalPedido += pedido.precioVenta * pedido.cantidad;
        });
        
        totalFactura.textContent = `${totalPedido.toFixed(2)} COP`;
        }
        });