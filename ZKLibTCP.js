// ZKLibTCP.js
const net = require('net');

class ZKLibTCP {
    constructor(ip, port, timeout) {
        this.ip = ip;
        this.port = port;
        this.timeout = timeout;
        this.socket = new net.Socket();
    }

    // Método para crear y abrir un socket hacia el dispositivo.
    createSocket() {
        return new Promise((resolve, reject) => {
            this.socket.connect(this.port, this.ip, () => {
                console.log('Conexión TCP establecida.');
                resolve();
            });

            this.socket.on('error', (err) => {
                console.error('Error al conectar con el dispositivo:', err);
                reject(err);
            });
        });
    }
}

module.exports = ZKLibTCP;
