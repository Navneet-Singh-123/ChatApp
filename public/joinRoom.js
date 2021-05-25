function joinRoom(roomName) {
  // Send this room name to the server so that the server can join
  // This is because the client is totally unaware of the rooms
  // The client does join namespaces but only the server can manage the rooms

  // We are sending that call back (Optional third arg) over to the joinRoom event
  nsSocket.emit("joinRoom", roomName, (newNumberOfMembers) => {
    // We want to update the room member total now that we have joined
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });

  nsSocket.on("historyCatchUp", (history) => {
    // console.log(history);
    const messagesUL = document.querySelector("#messages");
    messagesUL.innerHTML = "";
    history.forEach((msg) => {
      const newMsg = buildHTML(msg);
      const currentMessages = messagesUL.innerHTML;
      messagesUL.innerHTML = currentMessages + newMsg;
    });
    messagesUL.scrollTo(0, messagesUL.scrollHeight);
  });

  nsSocket.on("updateMembers", (numMembers) => {
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`;
    document.querySelector(".curr-room-text").innerText = `${roomName}`;
  });
}
