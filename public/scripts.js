const socket = io("http://localhost:9000"); // Entry to main (/) namespace
let nsSocket = "";

// Listen for nsList which is a list of all the namespaces
socket.on("nsList", (nsData) => {
  console.log("The list of namespace has arrived");

  let namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.img}" /></div>`;
  });

  // Add a click listener for each namespace
  Array.from(document.getElementsByClassName("namespace")).forEach((elem) => {
    elem.addEventListener("click", (e) => {
      const nsEndpoint = elem.getAttribute("ns");
      console.log(nsEndpoint);
    });
  });

  joinNS("/wiki");
});
