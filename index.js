const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const Database = require("./server/Database.js");
const fs = require("fs");
const conf = JSON.parse(fs.readFileSync("./assets/conf.json"));
const { Server } = require("socket.io");



(async () => {
  const database = await Database(conf.db);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  const server = http.createServer(app);
  const io = new Server(server);
  const emailToSocketIdMap = {};

  app.use("/", express.static(path.join(__dirname, "public")));

  io.on("connection", async (socket) => {

    //Gestione registrazione
    socket.on("register", async (dizionario) => {
      const { email, password } = dizionario;
      if (email && email !== "" && password && password !== "") {
        const rsp = await database.register(email, password);
        io.to(socket.id).emit("registrationSuccess", rsp);
      }
    });

    //Gestione login
    socket.on("login", async (dizionario) => {
      const { email, password } = dizionario;
      if (email && email !== "" && password && password !== "") {
        const rsp = await database.login(email, password);
        io.to(socket.id).emit("loginSuccess", rsp);
        emailToSocketIdMap[email] = socket.id;
      }
    });

    //Gestione ottenere dati eventi utente + utenti registrati
    socket.on("ottieniDati", async (dizionario) => {
      const { email } = dizionario;
      if (email && email !== "") {
        const rsp = await database.getData(email, "eventi");
        const utenti = await database.getUser(email);
        io.to(socket.id).emit("ottieniSuccess", { rsp, utenti });
      }
    });

    //Gestione creazione evento - manca la possibilità di invitare persone
    socket.on("creaEvento", async (dizionario) => {
      let { email, dettagli, invitati } = dizionario;
      dettagli["completato"] = false;
      if (email && email !== "") {
        await database.insertData(
          email,
          "eventi",
          typeof dettagli === "string" ? dettagli : JSON.stringify(dettagli)
        );
        io.to(socket.id).emit("CreaSuccess", "ok");
      }
    });

    //Gestione completaEvento 
    socket.on("completaEvento", async (dizionario) => {
      let { email, idEvento} = dizionario;
      if (email && email !== "" && idEvento && idEvento !== "") {
        await database.completeEvent(
          email,
          idEvento
        );
        console.log(emailToSocketIdMap[email]);
        io.to(socket.id).emit("completaSuccess", "ok");
      }
    });

    //Gestione eliminaEvento 
    socket.on("eliminaEvento", async (dizionario) => {
      let { email, idEvento} = dizionario;
      if (email && email !== "" && idEvento && idEvento !== "") {
        await database.deleteEvent(
          email,
          idEvento
        );
        io.to(socket.id).emit("eliminaSuccess", "ok");
      }
    });

  });

  server.listen(conf.port, () => {
    console.log("---> server running on port " + conf.port);
  });
})();
