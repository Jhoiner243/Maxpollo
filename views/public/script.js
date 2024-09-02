document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    manejarFormularioPedidos();
    manejarFormularioPagos();
});

// Función para cargar productos y mostrarlos en la página
function cargarProductos() {
    fetch('/api/productos')
        .then(response => response.json())
        .then(data => {
            const productosContainer = document.getElementById('productos-container');

            if (productosContainer) {
                productosContainer.innerHTML = ''; // Limpiar cualquier contenido previo

                data.forEach(producto => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.innerHTML = `
                        <span>${producto.nombre}</span>
                        <input type="number" id="cantidad-${producto.id}" placeholder="Cantidad" min="1">
                        <button onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}')">Agregar al carrito</button>
                    `;
                    productosContainer.appendChild(productItem);
                });
            }
        })
        .catch(error => console.error('Error al cargar los productos:', error));
}

// Función para agregar productos al carrito de compras
function agregarAlCarrito(id, nombre) {
    const cantidad = document.getElementById(`cantidad-${id}`).value;
    if (cantidad) {
        console.log(`Producto agregado: ${nombre}, Cantidad: ${cantidad}`);
        // Aquí podrías almacenar temporalmente los productos en una lista
        // o enviarlos directamente a través de una petición POST al backend
    } else {
        alert('Por favor, ingresa una cantidad válida');
    }
}

// Función para manejar el envío del formulario de pedidos
function manejarFormularioPedidos() {
    const formularioPedidos = document.getElementById('formulario-pedidos');
    if (formularioPedidos) {
        formularioPedidos.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Recoger los datos del formulario (como cliente_id y productos)
            const clienteId = document.getElementById('cliente-id').value;
            const productos = obtenerProductosDelCarrito();

            // Enviar datos al backend
            fetch('/pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cliente_id: clienteId, productos: productos })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                console.log('Pedido creado:', data);
            })
            .catch(error => console.error('Error al crear el pedido:', error));
        });
    }
}

// Función para obtener productos del carrito (Ejemplo)
function obtenerProductosDelCarrito() {
    // Aquí debes implementar la lógica para obtener los productos que el usuario ha agregado al carrito
    return [
        { producto: 1, cantidad: 2, precioVenta: 100 }, // Ejemplo de producto
        { producto: 2, cantidad: 1, precioVenta: 150 }
    ];
}

// Función para manejar el envío del formulario de pagos
function manejarFormularioPagos() {
    const formularioPagos = document.getElementById('formulario-pagos');
    if (formularioPagos) {
        formularioPagos.addEventListener('submit', function(e) {
            e.preventDefault();

            const pedidoId = document.getElementById('pedido-id').value;
            const monto = document.getElementById('monto').value;

            fetch('/pago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pedido_id: pedidoId, monto: monto })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                console.log('Pago registrado:', data);
            })
            .catch(error => console.error('Error al registrar el pago:', error));
        });
    }
}
