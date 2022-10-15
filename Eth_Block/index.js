
require("dotenv").config();
const mysql = require('mysql');
const express = require("express");
const bodyParser = require("body-parser");
const mysqlConnection = require("./config/connectdb");
const router = require ("./routes/userRoutes");

const app = express();
// we use JSON  for making API
app.use(bodyParser.json())


const port = 3000;


// we use JSON  for making API
app.use(express.json())

// Load Routes
app.use("/api/user", router)

//set app port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});