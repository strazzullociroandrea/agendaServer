const titolo = document.getElementById("titolo");
const descrizione = document.getElementById("descrizione");
const creaEvento = document.getElementById("creaEvento");
const logout = document.getElementById("logout");
const eventi = document.getElementById("eventi");
const utentiInvito = document.getElementById("utenti");
const userInv = document.getElementById("userInv");
const creaSocket = () =>{
    return new Promise((resolve, reject)=>{
        const socketURL = sessionStorage.getItem('socketURL');
        const socketOptions = JSON.parse(sessionStorage.getItem('socketOptions'));
        const socket = io(socketURL, socketOptions);
        resolve(socket);
    })
}
let socket = await creaSocket();
const templateEvento = `
<section class="py-4 py-xl-2 rounded">
    <div class="container">
        <div class="bg-light border rounded border-0 border-light d-flex flex-column justify-content-between flex-lg-row p-4 p-md-5">
            <div class="row align-items-center justify-content-between">
                <div class="col-lg-7">
                    <div class="pb-2 pb-lg-1">
                        <h2 class="fw-bold mb-2 %COM">%TITOLO</h2>
                        <p class="mb-0 %COM">%DESCRIZIONE</p>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="d-flex justify-content-end">
                        <div class="my-2 me-2"><button class="btn btn-primary fs-8 py-2 completaEvento" id="%ID" role="button" %DIS>Completato</button></div>
                        <div class="my-2"><button class="btn btn-danger fs-8 py-2 eliminaEvento" id="%ID" role="button" >Elimina</button></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`;
logout.onclick = () =>{
  sessionStorage.removeItem("email");
  window.location.href="./index.html";
}
const renderInvitati = (utenti) =>{
  userInv.innerText = utenti;
}
const render = (element) =>{
  eventi.innerHTML = "";
  if(element?.rsp.result?.value){
    const event  = JSON.parse(element.rsp.result.value);
    console.log(event);
    if(event.length > 0){
        event.map((val, index)=>{
            if(val){
                val = JSON.parse(val);
                const {titolo, descrizione, completato} = val;
                eventi.innerHTML += templateEvento.replaceAll("%COM", completato ? "text-success": "text-black").replaceAll("%DIS", completato ? "disabled": "").replaceAll("%ID", index).replace("%TITOLO",titolo).replace("%DESCRIZIONE",descrizione);//"<tr><td>"+titolo+"</td><td>"+descrizione+"</td></tr>";    
            }
            })
          //Gestione click button - completa evento
          document.querySelectorAll(".completaEvento").forEach(button =>{
              button.onclick = () =>{
                  socket.emit("completaEvento", {
                      email: sessionStorage.getItem("email"),
                      idEvento: button.id
                  });
              }
          })
          //Gestione click button - elimina evento
          document.querySelectorAll(".eliminaEvento").forEach(button =>{
              button.onclick = () =>{
                  socket.emit("eliminaEvento", {
                      email: sessionStorage.getItem("email"),
                      idEvento: button.id
                  });
              }
          })
    }
    
  }
  //view degli utenti
  utentiInvito.innerHTML = "<option>Seleziona un utente da invitare</option>";
  element.utenti.result.forEach(utente =>{
  utentiInvito.innerHTML += "<option value='"+utente+"' class='seleziona'>"+utente+"</option>";
  })
  utentiInvito.addEventListener("change", (event) => {
    let utenti = sessionStorage.getItem("utentiInvitati");
    if (utenti) {
      utenti = JSON.parse(utenti); // Converti la stringa JSON in un array
      utenti.push(event.target.value);
      renderInvitati(utenti);
    } else {
      utenti = [event.target.value];
      renderInvitati(utenti);
    }
    sessionStorage.setItem("utentiInvitati", JSON.stringify(utenti));
  });

}


window.onload = () =>{
    if(sessionStorage.getItem("email") && socket){
        socket.emit("ottieniDati", {
        email: sessionStorage.getItem("email")
        });
    }else{
        window.location.href="./index.html";
    }
}

creaEvento.onclick = () =>{
  socket.emit("creaEvento", {
    email: sessionStorage.getItem("email"),
    dettagli: {
      titolo: titolo.value,
      descrizione: descrizione.value
    },
    invitati: sessionStorage.getItem("utentiInvitati") ?JSON.parse(sessionStorage.getItem("utentiInvitati")) : []
  });
  sessionStorage.setItem("utentiInvitati","");
}

socket.on("ottieniSuccess", (message) => {
  render(message);
  titolo.value = descrizione.value = "";
});
socket.on("CreaSuccess", (message) => {
  window.onload();
});
socket.on("completaSuccess", (message) => {
    window.onload();
});
socket.on("eliminaSuccess", (message) => {
    window.onload();
});
  
socket.on("notificaInvito", (eventId) => {
  console.log("ciao");
  alert("Sei stato invitato ad un evento con codice: "+ JSON.stringify(eventId));
});