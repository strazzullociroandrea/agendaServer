const socket = io();
const email = document.getElementById("email");
const password = document.getElementById("password");
const registrami = document.getElementById("registrami");
const error = document.getElementById("error");
const contenuto = document.getElementById("contenuto");


registrami.onclick = () =>{
   if(email.value.includes("@") && email.value != "" && password.value != ""){
    socket.emit("register", {
      email: email.value,
      password: password.value
    });
     error.classList.add("d-none");
     contenuto.innerText = "";
  }else{
     error.classList.remove("d-none");
     contenuto.innerText = "Inserisci un email ed una password valida";
     email.value = password.value = "";
  }
}

socket.on("registrationSuccess", (message)=>{
   error.classList.remove("d-none");
   contenuto.innerText = message.result;
   email.value = password.value = "";
});