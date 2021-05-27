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
  // console.log(socket.handshake);
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
    const username = nsSocket.handshake.query.username;
    console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    // A socket has connected to one of our chat group namespaces
    // Send that ns group info back
    nsSocket.emit("nsRoomLoad", namespace.rooms);
    nsSocket.on("joinRoom", async (roomToJoin, numberOfUsersCallback) => {
      // Deal with history

      // console.log(Array.from(nsSocket.rooms));
      const roomToLeave = Array.from(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);
      // console.log(roomTitle);
      // Join Room
      nsSocket.join(roomToJoin);

      // try {
      //   const clients = await io.of("/wiki").in(roomToJoin).allSockets();
      //   console.log(Array.from(clients).length);
      //   numberOfUsersCallback(Array.from(clients).length);
      // } catch (error) {
      //   console.log(error);
      // }

      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin;
      });

      nsSocket.emit("historyCatchUp", nsRoom.history);
      updateUsersInRoom(namespace, roomToJoin);
    });

    nsSocket.on("newMessageToServer", (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: "https://via.placeholder.com/30",
      };
      // console.log(fullMsg);
      // Send the message to all the sockets that are in this the room that this socket is in
      // How to find what room this socket is in ?

      // The user will be in the 2nd room in the object list
      // This is because the socket always joins its own room on connection
      const roomTitle = Array.from(nsSocket.rooms)[1];
      // console.log(roomTitle);
      // The reason why we did io.of() instead of nsSocket.of() is because in that case it
      // will not come up to the socket who sent it

      // We need to find the room object for this room
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomTitle;
      });
      // console.log(nsRoom);
      nsRoom.addMessage(fullMsg);
      io.of(namespace.endpoint).to(roomTitle).emit("messageToClients", fullMsg);
    });
  });
});

async function updateUsersInRoom(namespace, roomToJoin) {
  // Send back the number of users in this room to all all sockets connected to this room
  try {
    const clients = await io.of(namespace.endpoint).in(roomToJoin).allSockets();
    console.log(`There are ${Array.from(clients).length} in this room`);
    io.of(namespace.endpoint)
      .in(roomToJoin)
      .emit("updateMembers", Array.from(clients).length);
  } catch (error) {
    console.log(error);
  }
}
