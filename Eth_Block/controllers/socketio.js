// // Regular Websockets

// // const socket = new WebSocket('ws://localhost:8080');

// // Listen for messages
// exports.notify= (req,res)=>{
// socket.onmessage = ({ data }) => {
//     console.log('Message from server ', data);
// };

// document.querySelector('button').onclick = () => {
//     socket.send('hello');
//     return res.send("done!!")
// }}


// server.js  

// // Regular Websockets

// const WebSocket = require('ws')

// const server = new WebSocket.Server("wss://eth.getblock.io/goerli/?api_key=f95df379-c65d-4cc2-90ea-9ca85a3a2350")
// exports.webSocket =(req,res)=>{
// server.on('connection', socket => { 

//   socket.on('message', message => {
//     socket.send(`Roger that! ${message}`);
// return res.send(socket.send(`Roger that! ${message}`))
  
//   });

// });
// }