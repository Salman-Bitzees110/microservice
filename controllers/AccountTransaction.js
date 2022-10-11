const { ethers } = require("ethers");
const { id } = require("ethers/lib/utils");
const connectDB = require('../config/connectdb')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');

var provider = new ethers.providers.JsonRpcProvider(process.env.provider)


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
        connectDB.query("SELECT * FROM `user` WHERE `email`=?", [email], async function (err, result, fields) {
            if (err) throw err;
            else {
                const [Result] = result.map(a => a.privatekey)
                console.log({ "privatekey": Result })

                // Decrypting privatekey
                const privateKey1 = cryptr.decrypt(Result);

                // Signing in ether wallet using privatekey
                const wallet = new ethers.Wallet(privateKey1, provider)

                // Getting balance of sender and Receiver account Before Transaction
                const senderBalanceBefore = await provider.getBalance(account1)
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
                connectDB.query("INSERT INTO transaction_data VALUES(?,?,?)", [email, id, TransactionHash], function (err, rows, fields) {
                    if (!!err) {
                        return res.status(400).send(err.message)
                    } else {
                        // Final Response
                        return res.send({
                            msg: "ETH TRANSACTION SUCCESFUL!!",
                            Sender_balance_before: `${ethers.utils.formatEther(senderBalanceBefore)}`,
                            reciever_balance_before: `${ethers.utils.formatEther(recieverBalanceBefore)}`,
                            Sender_balance_after: `${ethers.utils.formatEther(senderBalanceAfter)}`,
                            reciever_balance_after: `${ethers.utils.formatEther(recieverBalanceAfter)}`,
                            Transaction_Hash: tx.hash
                        })
                    }
                });
            }
        })
    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}
