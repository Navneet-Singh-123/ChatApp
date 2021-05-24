const socket = io("http://localhost:9000");
socket.on("messageFromServer", (dataFromServer) => {
  console.log(dataFromServer);
  socket.emit("messageToServer", { data: "Data from the Client!" });
});
document.querySelector("#message-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  socket.emit("newMessageToServer", { text: newMessage });
});

socket.on("messageToCliets", (msg) => {
  document.querySelector("#messages").innerHTML += `<li>${msg.text}</li>`;
});
