const User = require("../model/userModel");
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");
const {promisify} = require('util')
const Email = require('../utils/email')
const crypto  = require('crypto')

const signToken = id=>{
    return token = jwt.sign(
        {id:id} ,
        process.env.JWT_SECRET ,
        {expiresIn:process.env.JWT_EXPIRES_IN}
    )
}

const createAndSentToken = (user,statusCode , res)=>{
    const token = signToken( user._id)
    const cookieOptions = {expires:new Date(Date.now() + process.env.JWT_COOKIE_IN * 24 *60*60*1000) , 
    httpOnly:true}

    if (process.env.NODE_ENV == 'production') {
        cookieOptions.secure = true
    }
    user.password = undefined
    res.cookie('jwt' ,token,cookieOptions )
    res.status(statusCode).json({
        status:'success',
        token,
        data:{user}    
    })
}

exports.signup = catchAsync(async (req,res,next)=>{
    // const newUser = await User.create(req.body)
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role:req.body.role  
    })

    const url = `${req.protocol}://${req.get('host')}/me`
    console.log(url);
    await new Email(newUser , url).sendWelcome()
    createAndSentToken(newUser , 201 , res)

})



exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createAndSentToken(user , 200,res)
});


exports.protect =catchAsync(async (req, res,next)=>{
    //1) get token for check
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token  = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }




    if (!token) {
        return next(new AppError('you are not logged in !! please login' , 401))
    }
    //2)verification token
    const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET)

    //3)check if user still exist
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError('the token beloging to this token does no longer exist' , 401))
    }
    //4)check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password please log in again' , 401))
    }

    //5)set user on request
    req.user = currentUser
    res.locals.user = currentUser
    next()
})




exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createAndSentToken(user , 200,res)
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),httpOnly: true});
    res.status(200).json({ status: 'success' });
};


exports.isLoggedIn =async (req, res,next)=>{
    //1) get token for check
    if(req.cookies.jwt){
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt , process.env.JWT_SECRET)
        
            const currentUser = await User.findById(decoded.id)
            if (!currentUser) {
                return next()
            }
            if(currentUser.changedPasswordAfter(decoded.iat)){
                return next()
            }
            res.locals.user = currentUser
            return next()
        } catch (e) {
            return next()
        }

    }
    return next()
}


exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you do not hava permission to perform this action' ,403))
        }
        next()
    }

}

exports.forgetPassword =catchAsync(async (req,res,next)=>{
    //1) get user base on eamil was sent
    const user = await User.findOne({email:req.body.email})
    if (!user) {
        return next(new AppError('there is no user with that email' , 404))
    }
    //2)generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})

    //3)send it ti user's email
    
    
    try {
        const resetURL = `http://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
        await new Email(user , resetURL).sendPasswordReset()

        res.status(200).json({
            status:'success',
            message:"token sent to email"
        })
        
    } catch (e) {
        user.passwordResetToekn = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave:false})
        return next(new AppError('There was an error sending the email. please try again later' , 500))
    }
})


exports.resetPassword = catchAsync(async (req,res,next)=>{
    //1)get user base on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')


    //2)if token has not expired and there is user set new pass
    const user = await User.findOne({
        passwordResetToekn:hashedToken ,
        passwordResetExpires: { $gt:Date.now() }
    })
    if (!user) {
        return next(new AppError('token is invalid or expired' , 400))
    }

    //3)update changedPasswordAt
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToekn = undefined
    user.passwordResetExpires = undefined
    await user.save()
    //4)log the user send JWT
    createAndSentToken(user , 201,res)
})


exports.updatePassword = catchAsync(async(req,res,next)=>{
    //1)get user from collection
    const user = await User.findById({_id:req.user.id}).select('+password')

    //2)pre pass is correct 
    if (!user.correctPassword(req.body.passwordCurrent  , user.password)) {
        return next(new AppError('your current password is wrong' , 401))
    }

    //3)update pass
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    //4)log user
    createAndSentToken(user , 201,res)
})