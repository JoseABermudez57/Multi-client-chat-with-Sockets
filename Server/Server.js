const net = require("net");
const kleur = require("kleur");

let clients = [];

let port = 8001;
let host = "192.168.89.201";

const server = net.createServer((socket) => {
  let hasName = false; // Al inicio un cliente no tiene nombre
  let existingName = false;
  let name;

  console.log(kleur.green().bold("\nCliente conectado"));

  socket.on("data", (data) => {
    // Nuevo cliente
    if (!hasName) {
      // Si no tiene nombre
      name = data.toString().trim();
      // Si ya hay un cliente con ese nombre
      clients.forEach((client) => {
        if (client.name.toLowerCase() === name.toLowerCase()) {
          existingName = true;
        }
      });
      if (existingName) {
        socket.write(kleur.red().bold("Ya hay un usuario con este nombre\n"));
        socket.end();
        broadcast(
          kleur.red().bold(name + "(1),m pero se desconecto del servidor\n"),
          socket
        );
      }
      clients.push({ name, socket }); // El cliente solo se guarde una vez
      hasName = true;
    }

    if (!existingName) {
      // Pasamos el mensaje y el cliente que realiza la accion de enviar el mensaje
      broadcast(data, socket);
    }
  });

  socket.on("close", () => {
    console.log(kleur.red().bold("Cliente desconectado"));
  });

  socket.on("error", (err) => {
    console.log(err.message);
  });
});

// Asignacion del puerto y la direccion IP en donde se iniciará el servidor
server.listen(port, host, () => {
  console.log(
    "\nServidor iniciado en el puerto " + port + "\nY host en " + host
  );
});

// Transmision simultanea a todos los clientes
function broadcast(message, sender) {
  if (message == "exit") {
    const index = clients.indexOf(sender);
    clients.splice(index, 1);
  } else {
    clients.forEach((client) => {
      if (client.socket !== sender) {
        // Si el cliente es diferente del que envia el mensaje
        client.socket.write(message);
      }
    });
  }
}
