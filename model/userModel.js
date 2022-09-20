const { default: mongoose } = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto  = require('crypto')

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true,'[please tell us your name'] 
    },
    email:{
        type:String,
        unique:true,
        required:[true,'[please provide your eamil'],
        lowercase:true,
        validate:[validator.isEmail , 'please provide a vaild email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user' , 'guide' , 'lead-guide' , 'admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true, 'please provide a password'],
        minlength:8,
        select:false    
    },
    passwordConfirm:{
        type:String,
        required:[true, 'please confirm  password'],
        validate:{
            //only works on save not update
            validator:function(val){
                return val === this.password
            },
            message:'confirm password is not as same as password'
        }
    },
    passwordChangedAt:Date,
    passwordResetToekn:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre ('save' ,async function(next){
    const user = this
    
    if (!user.isModified('password')) {
        return next()
    }
    user.password =await bcrypt.hash(user.password , 12)
    user.passwordConfirm  = undefined
    next()
})

userSchema.pre('save' , function(next){
    const user = this
    if (!user.isModified('password') || user.isNew) {
        return next()
    }
    user.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/ , function(next){
    const user = this
    user.find({active:{$ne:false}})
    next()
})

userSchema.methods.correctPassword =async function(candidatePassword , userPassword){
    return await  bcrypt.compare(candidatePassword , userPassword)
}

userSchema.methods.changedPasswordAfter= function(JWTTimestamp){
    const user = this
    if (user.passwordChangedAt) {
        const changedTimeStamp = parseInt(user.passwordChangedAt.getTime()/1000)
        return JWTTimestamp < changedTimeStamp
    }
    //false mean not changed
    return false
}


userSchema.methods.createPasswordResetToken = function(){
    const user = this

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToekn = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.passwordResetExpires = Date.now() + 10*60*1000
    
    return resetToken
}

const User = mongoose.model('User'  , userSchema)


module.exports = User