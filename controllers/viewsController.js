const Tour = require("../model/tourModel")
const User = require("../model/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")





exports.getOverview = catchAsync(async (req,res)=>{

    const tours = await Tour.find()
    res.status(200).render('overview' , {
        title:'All Tours',
        tours
    })
})


exports.getTour =catchAsync(async (req,res)=>{
    const tour = await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fileds:'review rating user'
    })
    res.status(200).render('tour' , {
        title:`${tour.name} tour`,
        tour
    })
    if (!tour) {
        return next(new AppError('there is no tour with that name',404))
    }
})


exports.getLoginForm = (req,res)=>{
    res.status(200).render('login' , {
        title:'Log into tour account'
    })
}



exports.getAccount = (req,res)=>{
    res.render('account' ,{
        title:'Your account'
    })
}

exports.updateUserData =catchAsync(async (req,res , next)=>{
    const updatedUser =await User.findByIdAndUpdate(req.user.id , {
        name:req.body.name,
        email:req.body.email
    } , 
    {
        new:true , runValidators:true
    }) 
    res.status(200).render('account' , {
        title:'Your account',
        user:updatedUser
    })
}) 