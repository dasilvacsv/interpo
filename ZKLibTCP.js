// ZKLibTCP.js
const net = require('net');
const {COMMANDS, REQUEST_DATA, USHRT_MAX}= require('./constants')
const {createTCPHeader,  decodeTCPHeader, } = require('./utils')

const {log}= require('./helpers/errorLog.js')

class ZKLibTCP {
    constructor(ip, port, timeout) {
        this.ip = ip;
        this.port = port;
        this.timeout = timeout;
        this.socket = new net.Socket();
        this.sessionId = 0; // Asegúrate de inicializar sessionId
        this.replyId = 0;
        
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

            this.socket.on('data', (data) => {
                // Aquí podrías manejar los datos recibidos si necesitas
            });

            if (this.timeout) {
                this.socket.setTimeout(this.timeout, () => {
                    console.error('Conexión TCP ha superado el tiempo de espera.');
                    reject(new Error('Timeout'));
                });
            }
        });
    }

    async connectAndDisable() {
        await this.createSocket();
        await this.sendCommand(COMMANDS.CMD_DISABLEDEVICE);
        console.log('Dispositivo deshabilitado.');
    }
    writeMessage(buf) {
        return new Promise((resolve, reject) => {
            // Configurar un temporizador para manejar el timeout
            const timer = setTimeout(() => {
                reject(new Error('TIMEOUT_ON_WRITING_MESSAGE'));
            }, this.timeout);

            // Registrar un manejador de eventos 'data' para recibir la respuesta
            this.socket.once('data', (data) => {
                clearTimeout(timer); // Limpiar el temporizador al recibir datos
                resolve(data); // Resolver la promesa con los datos recibidos
            });

            // Registrar un manejador de eventos 'error' para errores de socket
            this.socket.once('error', (err) => {
                clearTimeout(timer); // Limpiar el temporizador en caso de error
                reject(err); // Rechazar la promesa con el error
            });

            // Escribir los datos en el socket
            this.socket.write(buf, (err) => {
                if (err) {
                    clearTimeout(timer); // Asegúrate de limpiar el temporizador si hay un error al escribir
                    reject(err);
                }
            });
        });
    }
    sendCommand(command, data = Buffer.alloc(0)) {
        return new Promise((resolve, reject) => {
            const buf = createTCPHeader(command, this.sessionId, ++this.replyId, data);
            this.writeMessage(buf).then((reply) => {
                const decodedHeader = decodeTCPHeader(reply);
                if (decodedHeader.commandId === COMMANDS.CMD_ACK_OK) {
                    resolve(decodedHeader);
                } else {
                    reject(new Error('Received non-ACK response'));
                }
            }).catch(reject);
        });
    }
}

module.exports = ZKLibTCP;
