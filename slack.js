const express = require("express");
const app = express();
const socketio = require("socket.io");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

// connect or connection events are predefined in socket io which is fired upon a connection from the client
// socket parameter is the underline socket or the client that has just connected
io.on("connection", (socket) => {
  socket.emit("messageFromServer", { data: "Welcome to the socket io server" });
  socket.on("messageToServer", (dataFromClient) => {
    console.log(dataFromClient);
  });
  socket.on("newMessageToServer", (msg) => {
    io.emit("messageToCliets", { text: msg.text });
  });

  // The server can still communicate across namespaces
  // but on the clientInformation, the socket needs to be in that namespace
  // in order to get the events
  setTimeout(() => {
    io.of("/admin").emit("Wekcome to the admin channel, from the main channel");
  }, 2000);
});

io.of("/admin").on("connection", (socket) => {
  console.log("Someone connected to the admin channel");
  io.of("/admin").emit("welcome", "Welcome to the admin channel");
});
