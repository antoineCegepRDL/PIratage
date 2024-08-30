const express = require("express");
const path = require("path");
const url = require("url");
const fs = require('fs').promises;
const _ = require('lodash');
const { authenticate, verifyToken } = require("./middleware");
const { SECRET_KEY } = require("./config");

const router = express.Router();
let blogMessage = '';
let user = { user: { name: 'user' } }

router.get("/ping", (req, res) => {
  res.json("pong");
});

router.get('/profile', async (req, res) => {
  let htmlContent = await fs.readFile(path.join(__dirname, "/profile.html"), 'utf-8');
  htmlContent = htmlContent.replace('${0}', `JSON.stringify(user) <code> ${JSON.stringify(user)} </code> <br>user.IsAdmin? :<code> ${user.isAdmin} </code>  <br>{}.isAdmin?<code>  ${{}.isAdmin}</code> `);
  res.send(htmlContent);
});

router.put('/profile', (req, res) => {
  user = _.merge({}, user, req.body)
  res.json({ message: 'Request body logged successfully' });
});

// insecure design
router.get("/init", (req, res) => {
  // logique pour créer les users et les squelette du site.
  // ajoutons une condition avec un if?
  res.json("website is inited, do not use this route once the website is inited!");
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

router.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/home.html"));
});

router.get("/blog", async (req, res) => {
  let htmlContent = await fs.readFile(path.join(__dirname, "/blog.html"), 'utf-8');
  htmlContent = htmlContent.replace('${0}', blogMessage);
  res.send(htmlContent);
});

router.post('/blog', (req, res) => {
  blogMessage = req.body.content;
  res.json({ message: 'Request body logged successfully' });
});

router.get("/resetBlog", async (req, res) => {
  blogMessage = ''
  res.redirect('/blog')
});

router.post("/authenticate", authenticate);

router.get("/creditCards", verifyToken, (req, res) => {
  res.json("4550-1231-4584-8844");
});

router.get("/transferAcount", verifyToken, (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { query } = parsedUrl;
  if (query.name) {
    res.json(`Le tranfert de de votre carte est réussie! :${query.name} possède maintenant votre carte.`);
  } else {
    res.json("il manque le parameter name pour effectuer le tranfert de carte de crédit");
  }
});

router.get("/dropTables", verifyToken, (req, res) => {
  if (req.user.role === "administrator") {
    res.json("All tables were dropped, we are doomed! :(");
  } else {
    res.status(401).send("cannot drop table. Only use once when initiating the server");
  }
});

module.exports = router;