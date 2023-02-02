const net = require("net");
const kleur = require("kleur"); // Colores 

// Interfaz que permite la escritura y lectura en la terminal
const readLine = require("readline").createInterface({
  input: process.stdin, // Leer de la termina
  output: process.stdout, // Escribir en la terminal
});


// Esperar a que el usuario tenga un nombre
const waitForUser = new Promise((ressolve) => {
  readLine.question(
    kleur.yellow().italic("Ingrese su nombre para unirse: "),
    (answer) => {
      ressolve(answer); // Manda el resultado del readLine como respuesta de la promesa
    }
  );
});

// Una vez teniendo el nombre del usuario
waitForUser.then((user) => {

  // Configuración para la conexion al servidor
  // En caso de cambio de red modificar el host
  const options = {
    port: 8001,
    host: "127.0.0.1",
  };

  // net.connect realiza la conexion al servidor con los anteriores parametros
  const client = net.connect(options);

  // Cuándos se realiza la primera conexion
  client.on("connect", () => {
    // Mensaje para el cliente
    console.log(kleur.bgWhite().red('Para salir del chat escriba "exit"\n'));
    // Se le manda un mensaje a los demas clientes
    client.write(kleur.green().bold(user + " se unió al servidor!."));
  });

  // Metodo que realiza el procesamiento de los datos recibidos por consola
  readLine.on("line", (data) => {
    if (data.toLowerCase() === "exit") { // Si el cliente escribe
      client.write(kleur.red().bold(`${user} ha salido del chat`));
      client.setTimeout(500); // Genera un evento timeout
    } else {
      client.write(kleur.blue().bold(`${user}:`) + kleur.cyan(` ${data}`));
    }
  });

  // Evento que escucha los datos que recibe del lado del servidor
  client.on("data", (data) => {
    console.log(data.toString());
  });

  client.on("end", () => {
    process.exit();
  });

  client.on('close', ()=>{
    console.log(kleur.red().bold("Desconectado del servidor"))
  });

  // Cuando sucede el evento timeout despues de cierto tiempo se cierra la sesion2
  client.on("timeout", () => {
    client.end();
  });

  client.on("error", (err) => {
    console.log(kleur.red().bold("\nError en el servidor: " + err.message));
  });
});
