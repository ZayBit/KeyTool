const generateNewPass = (config = {}) => {
    let default_config = {
      letters: true,
      numbers: true,
      specials: false,
      capitalLetter: false,
      max: 12,
    };
  
    config = Object.keys(config).length ? config : default_config;
  
    const { letters, numbers, specials, capitalLetter, max } = config;
  
    let abc = "abcdefghijklmnñopqrstuvwxyz".split("");
    let numbs = "0123456789".split("");
    let symbols = "#$%&'()*+-./:;<=>?@[]^_`{|}~".split("");
  
    let finalKey = "";
    let configCount = 0;
    Object.keys(config).forEach((key) => {
      if (key !== "max") {
        if (config[key]) {
          configCount++;
        }
      }
    });
  
    if (!configCount) return "123";
  
    const getRandIdx = (arr) => {
      let arr_length = arr.length;
      let idxRand = Math.floor(Math.random() * arr_length);
      return idxRand;
    };
    let countChar = 0;
  
    for (let i = 0; i < max; i++) {
      if (letters && countChar < max) {
        countChar++;
        finalKey += abc[getRandIdx(abc)];
      }
      if (numbers && countChar < max) {
        countChar++;
        finalKey += numbs[getRandIdx(numbs)];
      }
      if (capitalLetter && countChar < max) {
        countChar++;
        finalKey += abc[getRandIdx(abc)].toLocaleUpperCase();
      }
      if (specials && countChar < max) {
        countChar++;
        finalKey += symbols[getRandIdx(symbols)];
      }
    }
    if (finalKey.split("").length > max) {
      finalKey = finalKey.split("").slice(1, finalKey.split("").length);
    }
    return finalKey.toString().replace(/,/g, "");
  };

module.exports = generateNewPass