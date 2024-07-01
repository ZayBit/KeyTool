const fs = require("fs");
class Interact {
  static #initialConfig = {};
  static #dbData = [];
  constructor(initialConfig) {
    Interact.#initialConfig = initialConfig;
    Interact.#dbData = this.#init();
  }
 
  static async getDbData(ent = true){
    try {
      const path = require('path')
      if(ent){
        Interact.#initialConfig.dbPath = path.join(__dirname, "..","..",Interact.#initialConfig.dbPath);
      }
     
      Interact.#dbData = fs.readFileSync(Interact.#initialConfig.dbPath, { encoding: "utf-8" });

      return JSON.parse(Interact.#dbData);
    } catch (err) {
      throw err;
    }
  }

  static async refresh(){
    this.#dbData = this.getDbData(false)
  }

  async #init() {
   return Interact.getDbData()
  }
  static read() {
    return this.#dbData;
  }

  static async #validateObj(where) {
    let completeDb = await this.#dbData;

    let dbData = completeDb[where];

    if (dbData) {
      return {
        completeDb,
        result: dbData,
      };
    }
    return [];
  }

  static async read(where = null) {
    if (where != null) {
      const res = await this.#dbData;
      return res[where];
    }
    return this.#dbData;
  }

  static async update(params = {}) {
    const { where = "", set = {}, id } = params;

    let { result, completeDb } = await this.#validateObj(where);

    if (result && !isNaN(id)) {
      result.map((res) => {
        if (res.id == id) {
          Object.keys(set).forEach((item) => {
            res[item] = set[item];
          });
          return res;
        }
        return res;
      });

      completeDb[where] = result;
      this.#dbData = completeDb;

      fs.writeFileSync(
        this.#initialConfig.dbPath,
        JSON.stringify(completeDb)
      );
    }
    
  }

  static async delete(params = {}) {
    const { where = "", id } = params;

    let { result, completeDb } = await this.#validateObj(where);

    if (result) {
      if (result.find((findElement) => findElement.id == id)) {
        completeDb[where] = result.filter(
          (filterElement) => filterElement.id != id
        );
        this.#dbData = completeDb;
        fs.writeFileSync(
          this.#initialConfig.dbPath,
          JSON.stringify(completeDb)
        );
        return true;
      }
    }

    return false;
  }

  static async create(params) {
    let { where = "", data } = params;

    let { result, completeDb } = await this.#validateObj(where);

    if (result) {
      data = this.#organizerData(result, data, this.#generateID(result));

      result.push(data);
      completeDb[where] = result

      this.#dbData = completeDb;

      fs.writeFileSync(this.#initialConfig.dbPath, JSON.stringify(completeDb));

      return true
    }
    return false
  }
  static #organizerData(result, data, id) {
    if(result.length){
    const base = result[0];
    let newData = {};
    Object.keys(base).forEach((key) => {
      if (key == "id") {
        newData[key] = id;
      } else {
        newData[key] = data[key];
      }
    });
    return newData;
          
  }else{
    data.id = id
    return data
  }
  }
  static #generateID(result) {
    if (result.length) {
      return Math.max(...result.map((res) => res.id)) + 1;
    }
    return 0;
  }

  static async search( params = {} ){
    const { where, from } = params
    const dbData = await this.#dbData
    const resultDbData = dbData[where]
    if(resultDbData){
      let key = Object.keys(from)[0]
      let value = from[key]
      let filter = resultDbData.filter(el => el[key] == value)
      return filter
    }
    return []
  }
  static async deleteFile( params = {} ){
    const { files = [], endProcess } = params
    if(!Array.isArray(files)) return false
    
    let unlinkCount = 0;
    const unlinkFile = async ()=>{
      await fs.unlinkSync(`${this.#initialConfig.destFiles}${files[unlinkCount]}`)
      unlinkCount++

      if(unlinkCount < files.length){
        unlinkFile()
      }else{
        if( typeof endProcess === "function" ){
          endProcess()
        }
      }
    }
    unlinkFile()
  }
  static pagination( params = {}) {

    let { items, currentPage = 1 } = params;

    let { totalItemsDisplay = 4, totalNumbersDisplay = 3 } = this.#initialConfig.pagination || {}

    if(!items.length) return []

    currentPage = parseInt(currentPage)
    
    let total = Math.ceil(items.length / totalItemsDisplay);
    // Items
    const generateItems = (currentPage) => {
      currentPage = currentPage > total ? total : currentPage;
      let results = [];
      let maxItems =
        currentPage * totalItemsDisplay > items.length
          ? items.length
          : currentPage * totalItemsDisplay;
      let initialItems = currentPage * totalItemsDisplay - totalItemsDisplay;
  
      for (initialItems; initialItems < maxItems; initialItems++) {
        results.push(items[initialItems]);
      }
      return results;
    };
    // Pagination
    const generatePagination = (currentPage) => {
   
      let prevPage = 2;
      let nextPage = totalNumbersDisplay - prevPage;
      
      let max = currentPage + nextPage;

      let min = currentPage - 1;
      let pages = [];

      if (max > total) {
        max = total;
        min = total - totalNumbersDisplay + 1;
      }
      if (total > totalNumbersDisplay) {
        if (currentPage >= totalNumbersDisplay) {
          pages.push(1, "...");
          for (min; min <= max; min++) {
            pages.push(min);
          }
          if (currentPage <= total && max < total) {
            pages.push("...", total);
          }
        } else {
          for (let i = 1; i <= totalNumbersDisplay; i++) {
            pages.push(i);
          }
          pages.push("...", total);
        }
      } else {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      }
      return pages;
    };
    return {
      pageResults: generateItems(currentPage),
      pages: generatePagination(currentPage),
      total
    };
  }

  static async saveFile( params = {} ){

    let { files = [], checkStatus, endProcess } = params

    let distPath = this.#initialConfig.destFiles
   
    let filesLength = files.length

    if(!filesLength || !Array.isArray( files )) return false

    let nextFile = 0;
    let fileNames = []
    const processFile = ()=>{
      let file = files[nextFile]

      const { size } = fs.statSync(file)

      let process = 0
      let fileName = this.#generateNameFile(file)
      fileNames.push(fileName)
      const writer = fs.createWriteStream(`${distPath}/${fileName}`,{
        flags:'w'
      })
  
      fs.createReadStream(file).pipe(writer) 
      let totalProgress = ""

      fs.createReadStream(file).on('data',( data )=>{
        process += data.length

        totalProgress = `${parseInt((process / size) * 100)}%`
        if(typeof checkStatus === "function"){
          checkStatus( totalProgress )
        }

      }).on('close',()=>{
        nextFile++
        if(nextFile < filesLength){
          processFile()
        }else{
          if(typeof endProcess === "function"){
            endProcess( fileNames )
          }
        }
      })
    }

    processFile()

  }

  static #generateNameFile(file){

    let abc = 'abcdefghijklmnopqrstuvwxyz'.split('')

    let date = new Date()
    let miliSeconds = date.getMilliseconds()
    let seconds = date.getSeconds()

    let miliAndSeconds = miliSeconds * seconds
    let finalName = ""

    for(let i = 0; i < 10;i++){
      finalName += abc[Math.floor(Math.random() * abc.length)]
    }
    return finalName += `-${miliAndSeconds}${file.match(/.\w+$/)[0]}`
  }
}

module.exports = Interact