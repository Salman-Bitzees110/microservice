const gateway = require('fast-gateway')

const server = gateway({
    routes:[
        {
            prefix:'/eth',
            target:'http://localhost:3000'
        }
    ]
})

server.get('/testing',(req,res)=>{res.send("Server is from APi-Gateway")})

server.start(4000).then(console.log('Running on port 4000 for Api-Gateway'))

