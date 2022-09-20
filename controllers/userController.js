const multer = require("multer")
const sharp = require("sharp")
const User = require("../model/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factory = require('./handlerFunctory')

/////////////////////////////////users functions///////////////////////////
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto =  upload.single('photo')

exports.resizeUserPhoto =catchAsync(async (req,res,next)=>{
    if (!req.file) return next()
    
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500 , 500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})



const filterObj = (obj , ...allowedFields)=>{
    let newObj = {}
    Object.keys(obj).forEach(i=>{
        if (allowedFields.includes(i)) {
            newObj[i] = obj[i]  
        }
    })
    return newObj
}


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


exports.updateMe = catchAsync(async (req,res,next)=>{
    //1)user can not update password in this rout
    if (req.body.password || req.body.passeordConfirm) {
        return next(new AppError('this rout is not for password updating please use updateMyPassword Route' , 400))
    }
    //2)update user info
    const filteredBody = filterObj(req.body , 'name' , 'email')
    if (req.file) {
        filteredBody.photo = req.file.filename
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id ,filteredBody ,{new:true , runValidators:true})

    
    res.status(200).json({
        status:'success',
        data:{user:updatedUser}

    })
})


exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id , {active:false})
    res.status(204).json({
        status:'success',
        data:null
    })
})

exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        maessage:'this route is not defined yet please sign up instead'
    })
}


exports.getAllUsers  = factory.getAll(User)
exports.getUser      = factory.getOne(User)
exports.deleteUser   = factory.deleteOne(User)
exports.updateUser   = factory.updateOne(User)




