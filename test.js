// test.js
const ZKLibTCP = require('./ZKLibTCP');

const zk = new ZKLibTCP('192.168.0.125', 4370, 5000); // Reemplaza con la IP real y puerto de tu dispositivo.

zk.createSocket().then(() => {
    console.log('Conectado con éxito al dispositivo.');
    // Aquí puedes continuar con la lógica para enviar comandos al dispositivo.
}).catch(err => {
    console.error('Error al conectar:', err);
});