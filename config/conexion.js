let conectar = require('mysql');

const db = conectar.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'MaxpolloDB'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

module.exports = db;