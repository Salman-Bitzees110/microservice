const connectDB = require('../config/connectdb')
const jwt = require('jsonwebtoken')
require("dotenv").config();
const { ethers } = require("ethers");
const db = require('../Dao/user')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');


exports.userController = async (req, res) => {
  try {
    const { id, utype, email } = req.body;

    // Validate user input
    if (!(utype || email || id)) return res.status(400).json({ status_code:400, message: 'All input are require, Missing Something Please check.' });

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
      token
    }

    // Storing Data in MySql DataBase
    const DBresult = db.StoreNewUserData(id, utype, email, PRIVATEencryptedString, PUBLICencryptedString)
    if (!DBresult) {
      return res.send()
    } else {
      res.json({ status_code: 200, msg: "Wallet Generared Successfully!!", data: [data] });
    }
  } catch (err) {
    return res.status(500).send({ status_code: 500, msg: err.message })
  }
}



module.exports.getbalance = async (req, res) => {
  try {
    const email = req.body.email
    if (!email) return res.status(400).send({ msg: "Please Enter email-id" })

    // Fetching user details from Database using email-id
    const DBresult = await db.getEmail(email)

    // Fetched publickey from email entered in req body
    const [Result] = DBresult.map(a => a.publickey)
    if (Result == undefined) return res.status(404).send({ msg: "Email not found!!" })

    // Decrypting  Publickey
    const decryptedString = cryptr.decrypt(Result);

    // GET BALANCE FROM GIVEN PUBLICKEY Using "eathers" Package
    const provider = new ethers.providers.JsonRpcProvider(process.env.provider)

    const balance = await provider.getBalance(decryptedString)
    return res.status(200).send({ status_code: 200, msg: "Successs!!", data: [{ ETH_Balance_Fetched_Successfully: `${ethers.utils.formatEther(balance)} ETH` }] })
  } catch (err) {
    return res.status(500).send({ status_code: 500, msg: err.message })
  }
}


// Api for Fund Transaction 
module.exports.TransferBalance = async (req, res) => {
  try {
      const id = req.body.id
      const email = req.body.email
      const account1 = req.body.account1
      const account2 = req.body.account2
      const TransferAmount = req.body.TransferAmount

      // Ensuring Input All Fields
      if (!account1 || !account2 || !TransferAmount || !email || !id) return res.status(400).send("Please provide all details")

      // Fetching privatekey using email-id from MySql Database
      const DBresult =await db.getEmail(email)
           if(!DBresult) return  res.status(400).send({status_code:400,msg:"Data not Found!!!"})
           else {
              const [Result] = DBresult.map(a => a.privatekey)
              // Decrypting privatekey
              const privateKey1 = cryptr.decrypt(Result);
              const provider = new ethers.providers.JsonRpcProvider(process.env.provider)
             
              // Signing in ether wallet using privatekey
              const wallet = new ethers.Wallet(privateKey1, provider)
              // Getting balance of sender and Receiver account Before Transaction
              const senderBalanceBefore = await  provider.getBalance(account1)
              const recieverBalanceBefore = await provider.getBalance(account2)

              const Sender_balance_before = `${ethers.utils.formatEther(senderBalanceBefore)}`
              console.log(`reciever balance before: ${ethers.utils.formatEther(recieverBalanceBefore)}\n`)

              // Confirming sufficient fund available for transaction
              if (TransferAmount > Sender_balance_before) return res.status(400).send({ msg: "Transaction failed!! Insufficient funds!!" })

              // Sending ETH to account2 using publickey 
              const tx = await wallet.sendTransaction({
                  to: account2,
                  value: ethers.utils.parseEther(TransferAmount)
              })
              await tx.wait()
              const TransactionHash = tx.hash
              console.log(TransactionHash)

              // Getting balance of sender and Receiver account Before Transaction
              const senderBalanceAfter = await provider.getBalance(account1)
              const recieverBalanceAfter = await provider.getBalance(account2)

              // Storing Data in MySql DataBase
              const data = db.StoreUserTxnDetails(email, id, TransactionHash)
                  if (!data) {
                      return res.status(400).send({status_code:400,msg:"Data Not Found!!"})
                  } else {
                      // Final Response
                      return res.status(200).send({status_code:200, msg:"Successs!!" ,data:[{
                          Sender_balance_before: `${ethers.utils.formatEther(senderBalanceBefore)}`,
                          reciever_balance_before: `${ethers.utils.formatEther(recieverBalanceBefore)}`,
                          Sender_balance_after: `${ethers.utils.formatEther(senderBalanceAfter)}`,
                          reciever_balance_after: `${ethers.utils.formatEther(recieverBalanceAfter)}`,
                          Transaction_Hash: tx.hash
                      }]})
                  }
          }
      }catch (err) {
      return res.status(500).send({ msg: err.message })
  }
}


