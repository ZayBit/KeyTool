const path = require("path");
const fs = require("fs");
// resolver rutas para acceder a los modulos
module.paths.push(path.resolve(__dirname, "..", "..", "app", "node_modules"));
module.paths.push(path.resolve("node_modules"));
module.paths.push(
  path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "..",
    "src",
    "public",
    "js"
  )
);
module.paths.push(path.resolve("./resources", "app", "src", "public", "js"));

const generateNewPass = require("utils/generateNewPass");

const { shell, ipcRenderer } = require("electron");
const { default: axios } = require("axios");
const generateKeyForm = document.getElementById("generateKey");

const btnDestroySession = document.querySelector('.btn-destroy-session')
btnDestroySession.addEventListener('click',()=>{
  localStorage.clear("access")
  setTimeout(()=>{
    ipcRenderer.send("reloadApp", true);
    // ipcRenderer.send("returnLogin", true);
  },300)
})


let axiosDataConfirm = {};

const btnConfirmCreate = document.querySelector(".btn-confirm-create");
if (btnConfirmCreate) {
  btnConfirmCreate.addEventListener("click", () => {
    if (Object.keys(axiosDataConfirm).length) {
      axios.post("/list", axiosDataConfirm).then((res) => {
        window.location.href = res.data.query;
      });
    }
  });
}

if (generateKeyForm) {
  generateKeyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let target = e.target;
    let inputPass = generateKeyForm.querySelector(".input-pass");
    let pass = "";

    pass = generateNewPass({
      letters: target.abc.checked,
      numbers: target.numbs.checked,
      specials: target.symbols.checked,
      capitalLetter: target.capitalLetter.checked,
      max: target.maxLength.value < 4 ? 4 : parseInt(target.maxLength.value),
    });

    inputPass.value = pass;

    let title = target.title.value;
    let url = target.url.value;
    axiosDataConfirm = {
      type: "create",
      data: {
        title,
        link: url,
        key: pass,
      },
    };
  });
}

const itemsContainer = document.querySelector(".items-container");
let messageClipboard =  document.querySelector('.message-clipboard')
let timeOutRemoveClass = false;
if (itemsContainer) {
  itemsContainer.addEventListener("click", (e) => {
    e.preventDefault();
    let target = e.target;

    if (target.tagName === "BUTTON") {
      if (target.classList.contains("btn-link")) {
        shell.openExternal(target.dataset.link);
      }
      if(target.classList.contains("btn-clipboard")){
        target.parentElement.querySelector('.hidden-key-input').select()
        document.execCommand('copy');
       
        if(messageClipboard.classList.contains('clipboard-visible')){

          messageClipboard.classList.remove('clipboard-visible')

          if(timeOutRemoveClass != false){
            console.log('remove');
            clearTimeout(timeOutRemoveClass)
          }
        }

        messageClipboard.classList.add('clipboard-visible')
        timeOutRemoveClass = setTimeout(()=>{
          messageClipboard.classList.remove('clipboard-visible')
        },800)
      }
    }
    if (target.tagName === "A") {
      axios.post(target.href)
      .then(res=>{
        window.location.href = res.data.query;
      })
    }
  });
}
