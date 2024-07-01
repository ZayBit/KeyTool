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
module.paths.push(path.resolve("./resources", "app", "src", "public","utils"));


const { ipcRenderer } = require("electron");
const axios = require("axios").default;
const jfe = require("json-file-encrypt");
const bcrypt = require("bcrypt");
const pathAuthFile = path.join("src", "public", "auth.json");
const pathDB = path.join("src", "public", "db", "db.json")

const {
  encryptAndDecrypt,
  getAuthKey,
  isEncryptFile,
  checkLogin,
  load
} = require("utils/authUtils");


// prevent open DevTools and fullscreen
document.addEventListener('keydown',(e)=>{
  console.log(e.key);
  if(e.ctrlKey || e.key == "F11"){
    e.preventDefault()
  }
})

checkLogin()

const authen = document.getElementById("authen");
const authenErrorMessage = authen.querySelector('.authen-error-message')
authen.addEventListener("submit", (e) => {
  e.preventDefault();
  let target = e.target;
  let type = target.type.value;
  let pass = target.password.value.trim();


  let auth = getAuthKey()

  let key = auth.key.trim()
  if (type == "login") {
    load();
    bcrypt.compare(pass, key, (err, results) => {
      if (err) throw err;

      load(false);

      if (results) {
        authenErrorMessage.classList.remove('error-message-visible')
        encryptAndDecrypt({
          encryptMode :false,
          hash:key
        })
        
        checkLogin(true)
      } else {
        authenErrorMessage.classList.add('error-message-visible')
        authenErrorMessage.innerHTML = "Contraseña incorrecta"
      }
    });
  } else if (type == "singup") {

    let pass2 = target.password2.value.trim();
    if (pass == "" || pass2 == "") return;

    if(pass != pass2){
      authenErrorMessage.classList.add('error-message-visible')
      authenErrorMessage.innerHTML = "Verifique la contraseña"
    }else{
      authenErrorMessage.classList.remove('error-message-visible')
      const saltRounds = 15;

      load();
  
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) throw err;
        
        bcrypt.hash(pass, salt, (err, hash) => {
          load(false);

          auth.key = hash;

          encryptAndDecrypt({
            encryptMode :true,
            hash
          })

          fs.writeFileSync(pathAuthFile, JSON.stringify(auth));
          window.location.reload()
        });
      });
    }


  }
});
