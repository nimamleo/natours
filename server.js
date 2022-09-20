const dotenv = require('dotenv');
const mongoose = require('mongoose');

// process.on('uncaughtException' , err=>{
//     console.log('shutting down');
//     process.exit(1)
// }) 

dotenv.config({path:'./config.env'})
const app = require('./app')

const DB = process.env.DATABASE_LOCAL 
// const DB = process.env.DATABASE
mongoose.connect(DB)
.then(i=>{
    console.log('database connected');
})


const port = process.env.PORT
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// process.on('unhandledRejection' , err=>{
//     console.log('shutting down');
//     server.close(()=>{
//         process.exit(1)
//     })
// })

