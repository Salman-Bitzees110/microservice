const connectDB = require('../config/connectdb')
const jwt = require('jsonwebtoken')
require("dotenv").config();
const {ethers} = require("ethers");

const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');


exports.userController = async (req, res) => {
  
  const { id, utype, email, privatekey, publickey } = req.body;

  // Validate user input
   if (!(utype || email || id)) return res.status(400).json({ 'message': ' All input are require, Missing Something Please check.' });

  // Generate JWT Token
  const token = jwt.sign(email, `${process.env.JWT_SECRET_KEY}`);

  //Generate Public Key and Private Key
  const ethWallet = require('ethereumjs-wallet');
  var addressData = ethWallet['default'].generate();

  // Generate Private key
  const privkey = (`${addressData.getPrivateKeyString()}`);

  // Encrypt privatekey
     const PRIVATEencryptedString = cryptr.encrypt(privkey);

  // Generate PublicKey
  const pubkey = (`${addressData.getAddressString()}`);

  // Encrypt publickey
  const PUBLICencryptedString = cryptr.encrypt(pubkey);

   // Data Destructured for getting Proper Response
  const data = {
    id,
    utype,
    email,
    token,
    pubkey,
    privkey
  }

  // Storing Data in MySql DataBase
  connectDB.query("INSERT INTO user VALUES(?,?,?,?,?)", [id, utype, email, PRIVATEencryptedString, PUBLICencryptedString], function (err, rows, fields) {
    if (!!err) {
      data["user"] = console.log(err);
    } else {
      data["error"] = 0;
      data["user"] = "Wallet Generated Successfully";
    }
    res.json(data);
  });
}


// User Validation through user's JWT and Pulbickey
exports.Authentication = async (Request, Response) => {
  const token = Request.headers["token"]
  const Email = Request.body.email
  const publickey = await Request.body.publickey
  if (!token) return Response.status(403).send({ status: false, message: "Authentication failed!! Please enter Token" })

  let decodedToken = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`)
  if (!decodedToken) return Response.status(400).send({ status: false, message: "Token is invalid" });

  if (decodedToken) {
    connectDB.query("SELECT * FROM `user` WHERE `email`=?", [Email], async function (err, result, fields) {
      if (err) throw err;
      else {
        // Fetched publickey from email entered in req body
        const [Result] = result.map(a => a.publickey)
        console.log({ "Publickey": Result })
        // Decrypting and comparing user's publickey!!!
        const decryptedString = cryptr.decrypt(Result)
        if(decryptedString==publickey) return Response.status(200).send({msg:"User Verified successfully"})
        else return Response.status(400).send({msg:"User Verification failed!!!"})
      }
    });
  }
}


module.exports.getbalance = async(req, res) => {
  
  const email = req.body.email
  if(!email)  return res.status(400).send({msg:"Please Enter email-id"})

  // Fetetching user details from Database using email-id
  connectDB.query("SELECT * FROM `user` WHERE `email`=?", [email], async function (err, result, fields) {
      if (err) throw err.message;
     else {
      // Fetched publickey from email entered in req body
      const [Result] = result.map(a => a.publickey)
      console.log({result:Result})
      if(Result == undefined)  return res.status(404).send({msg:"Email not found!!"})

      // Decrypting  Publickey
      const decryptedString = cryptr.decrypt(Result);

       // GET BALANCE FROM GIVEN PUBLICKEY Using "eathers" Package
       const provider = new ethers.providers.JsonRpcProvider(process.env.provider)
       
       const balance = await provider.getBalance(decryptedString)
          return res.status(200).send(`\nETH balance of ${decryptedString} --> ${ethers.utils.formatEther(balance)} ETH \n`)
    }
  }) 
}







  // dataString = `{"jsonrpc": "2.0","method": "eth_getBalance", "params": [${publickey},0],"id": "getblock.io"}`;

      // return rpcUtils.getData(dataString, req, res);
     
        // const provider = new ethers.providers.JsonRpcProvider("https://eth.getblock.io/goerli/?api_key=f95df379-c65d-4cc2-90ea-9ca85a3a2350");
        // const balance = await provider.getBalance(
        //   publickey ,
        //   "latest"
        // );
        
        // console.log(balance);
        // res.end()


// // Nodejs encryption with CTR
// // const crypto = require('crypto');
// const algorithm = 'aes-256-cbc';
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16);

// function encrypt(text) {
//  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
//  let encrypted = cipher.update(text);
//  encrypted = Buffer.concat([encrypted, cipher.final()]);
//  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
// }

// function decrypt(text) {
//  let iv = Buffer.from(text.iv, 'hex');
//  let encryptedText = Buffer.from(text.encryptedData, 'hex');
//  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//  let decrypted = decipher.update(encryptedText);
//  decrypted = Buffer.concat([decrypted, decipher.final()]);
//  return {decryptedData: decrypted.toString()};
// }

// var hw = encrypt("Some serious stuff!!")
// console.log(hw)
// console.log(decrypt(hw))



