const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs')
const Tour = require("./model/tourModel")
const Review = require("./model/reviewModel")
const User = require("./model/userModel")



dotenv.config({path:'./config.env'})
const app = require('./app');

const DB = process.env.DATABASE_LOCAL 
// const DB = process.env.DATABASE
mongoose.connect(DB )
.then(i=>{
    console.log('database connected');
})


const tours = JSON.parse(fs.readFileSync('./4-natours/after-section-14/dev-data/data/tours.json' , 'utf-8'))
const users = JSON.parse(fs.readFileSync('./4-natours/after-section-08/dev-data/data/users.json' , 'utf-8'))
const reviews = JSON.parse(fs.readFileSync('./4-natours/after-section-14/dev-data/data/reviews.json' , 'utf-8'))
const importfile = async ()=>{
    try {
        // await Tour.create(tours , {validateBeforeSave:false})
        await User.create(users , {validateBeforeSave:false})   
        // await Review.create(reviews)
        console.log('added');
        process.exit()
    } catch (e) {
        console.log(e);
    }
}

const deleteFunc = async ()=>{
    try {
        // await Tour.deleteMany()
        await User.deleteMany()
        // await Review.deleteMany()
        console.log('deleted');
        process.exit()
    } catch (e) {
        console.log(e);
    }
}

if (process.argv[2] == '--import') {
    importfile()
}else if (process.argv[2] =='--delete'){
    deleteFunc()
}
console.log(process.argv);