var net = require('net');
var clients = [];
const port = 80;
const GET_ALL_ROOMS_COMMAND = `7`;

var sender = require('./sender');
var sqlite = require('./sqlite');
var roomID;
var roomName, roomPass;
var taskID;
var text, creator, state;
var data;
var clientData;
var command;

sqlite.initialize(() => {

    net.createServer((socket) => {
        clients.push(socket);

        socket.on('data', (data) => {
            if (!socket.name) {
                socket.name = data;
                clientData = `Name ${data} readed`;
                console.log(clientData);
            } else {
                command = data.toString().substring(0, 1);
                clientData = `Command ${command} and data ${data} from ${socket.name} readed`;
                console.log(clientData);
                sender.readCommand(data, command, (data) => {
                    broadcast(data);
                });
            }
        });

        socket.on('end', () => clients.splice(clients.indexOf(socket), 1));

        function broadcast(message) {
            clients.forEach((client) => {
                client.write(message);
            });
            console.log(`brdcst: ${message}`);
        }


    }).listen(port);

    console.log("Server running at port", port);

});