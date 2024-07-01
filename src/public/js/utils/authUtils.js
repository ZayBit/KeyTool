// Encrypt data and decript
const encryptAndDecrypt = (config = {}) => {
  let { encryptMode = true, hash = null } = config;

  if (hash === null) return;

  const dbData = fs.readFileSync(pathDB, { encoding: "utf8" });
  let data = "";
  hash = hash.substring(0, 32);

  if (encryptMode) {
    data = jfe.encrypt(hash, dbData);
  } else {
    data = jfe.decrypt(hash, dbData);
  }
  fs.writeFileSync(pathDB, data);
};

// get aunth key
const getAuthKey = () => {
  let auth = fs.readFileSync(pathAuthFile);
  return JSON.parse(auth);
};

const isEncryptFile = () => {
  const dbData = fs.readFileSync(pathDB, { encoding: "utf8" });
  try {
    JSON.parse(dbData);
    return true;
  } catch (err) {
    return false;
  }
};

const checkLogin = (set) => {
  if (!set) {
    let auth = getAuthKey();
    if (set === undefined && !localStorage.getItem("access")) {
      if (isEncryptFile() && auth.key != "") {
        encryptAndDecrypt({
          encryptMode: true,
          hash: auth.key.substring(0, 32),
        });
      }
    } else {
      if (auth.key.trim() != "") {
        // Open main window
        ipcRenderer.send("openMainWindow", true);
        // Destroy veryfiUser window
        ipcRenderer.send("veryfiUser", true);
      }else if(auth.key.trim() == "" && localStorage.getItem("access")){
        localStorage.removeItem("access")
      }
    }
  } else if (set === true) {
    localStorage.setItem("access", true);
    checkLogin(false);
  }
};

const load = (loading = true) => {
  let submitButton = authen.querySelector("button");
  let indicator = authen.querySelector(".indicator");

  if (loading) {
    submitButton.classList.add("submit-hidden");
    indicator.classList.add("indicator-visible");
  } else {
    submitButton.classList.remove("submit-hidden");
    indicator.classList.remove("indicator-visible");
  }
};

module.exports = {
  encryptAndDecrypt,
  getAuthKey,
  isEncryptFile,
  checkLogin,
  load,
};
