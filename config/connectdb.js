// const{ createPool } = require('mysql'); // We can create pool of connections and we can execute the query parallaly 

//Connect to the database
const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Salman@110",
    database:"crypto_blockchain_db"
  });
  
  //Connect to the database
  mysqlConnection.connect((err)=>{
    if(err){
      console.warn("error")
    }
    else
    {
      console.warn("connected")
    }
  });

 module.exports = mysqlConnection