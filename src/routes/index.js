const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

require("colors");
require('dotenv').config();

let publicDir = path.join(__dirname, "..", "public");

const Interact = require(path.join(publicDir, "js/helpers/Interact"));

const checkSession = ()=>{
  let auth = fs.readFileSync(path.join(publicDir, "auth.json"),{encoding:'utf8'})
  return auth
}

router.get("/", async (req, res) => {
  let auth = checkSession()
  
  let type = ""
  if(JSON.parse(auth).key.trim() === ""){
    type = "singup"
  }else{
    type = "login"
  }
  res.render("verifyUser.html",{type});

});

router.get("/home", async (req, res) => {
  res.render("index.html");
});

router.get("/list", async (req, res) => {

  new Interact({
    dbPath: "./db/db.json",
    pagination: {
      totalItemsDisplay: 7,
      totalNumbersDisplay: 3,
    },
  });

  let res_keys = (await Interact.read("keys")) || [];

  let page = req.query.page || 1;

  page <= 0 ? 1 : page;

  let results = Interact.pagination({
    items: res_keys.reverse(),
    currentPage: page,
  });

  results = Object.keys(results).length ? results : [];

  res.render("list.html", {
    data: results.pageResults || [],
    pages: results.pages || [] ,
    total: results.total,
    page,
  });
});

router.post("/list", async (req, res) => {
  new Interact({
    dbPath: "./db/db.json",
    pagination: {
      totalItemsDisplay: 7,
      totalNumbersDisplay: 3,
    },
  });

  const type = req.body.type;
  const page = req.body.page || 1;

  if (req.query.delete) {

    let dbData = await Interact.read("keys");
    dbData.reverse();

    const deleteItem = await Interact.delete({
      where: "keys",
      id: parseInt(req.query.delete),
    });
    if (deleteItem) {
      res.send({ query: `/list?page=${req.query.page}` });
    }
  } else {
    if (type == "create") {
      let create = await Interact.create({
        where: "keys",
        data: { ...req.body.data },
      });
      if (create) {
        res.send({ query: `/list?page=${page}` });
      }
    }
  }
});

module.exports = router;
