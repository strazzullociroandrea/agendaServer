const socket = io();
const email = document.getElementById("email");
const password = document.getElementById("password");
const login = document.getElementById("login");
const error = document.getElementById("error");

login.onclick = () => {
  if(email.value.includes("@") && email.value != "" && password.value != ""){
    socket.emit("login", {
      email: email.value,
      password: password.value,
    });
    error.classList.add("d-none");
  }else{
    error.classList.remove("d-none");
  }
};

socket.on("loginSuccess", (message) => {
  if(message.login){
    sessionStorage.setItem("email", email.value);
    sessionStorage.setItem('socketURL', socket.io.uri); // Salva l'URL del server nella sessionStorage
    sessionStorage.setItem('socketOptions', JSON.stringify(socket.io.opts)); // Salva le opzioni di connessione nella sessionStorage
    email.value = password.value = "";
    window.location.href = "./areaPersonale.html";
  }else{
    error.classList.remove("d-none");
  }
});
