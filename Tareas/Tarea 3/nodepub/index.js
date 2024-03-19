const Redis = require('ioredis');

// Configuración de conexión a Redis Memory Store
const client = new Redis({
    host: '10.192.83.219', 
    port: 6379 
});

// Conexión exitosa
client.on('connect', function() {
    console.log('Conexión exitosa a Redis');
});

// Publicador
function publicarMensaje() {
    const mensaje = JSON.stringify({ msg: "hola a todos" });
    client.publish('test', mensaje, function() {
        console.log('Mensaje publicado en el canal test');
    });
}

setInterval(publicarMensaje, 3000);
