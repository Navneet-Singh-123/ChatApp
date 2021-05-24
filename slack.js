const express = require("express");
const app = express();
const socketio = require("socket.io");

let namespaces = require("./data/namespaces");
app.use(express.static(__dirname + "/public"));
const expressServer = app.listen(9000);
const io = socketio(expressServer);

// connect or connection events are predefined in socket io which is fired upon a connection from the client
// socket parameter is the underline socket or the client that has just connected

// Here as soon as somebody connects, build the array of namespaces(img, endpoint) and send it to that client (socket)
io.on("connection", (socket) => {
  // Build and array to send back with the image and endpoint for each namespace
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  // Send nsData back to the client
  // We need to use socket, NOT io, because we want it to go to just this client
  socket.emit("nsList", nsData);
  // io.emit("nsList", nsData); This would send it to every body connected to the main namespace
  // As soon as somebody joined the server, every body would get the list which we don't want
});

// Loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
  // console.log(namespace);
  io.of(namespace.endpoint).on("connection", (nsSocket) => {
    console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    // A socket has connected to one of our chat group namespaces
    // Send that ns group info back
    nsSocket.emit("nsRoomLoad", namespaces[0].rooms);
  });
});
