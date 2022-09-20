const express = require('express')
const router = express.Router()


const userControllers = require('../controllers/userController')
const authController = require('../controllers/authController') 


////////////////////////////////////////////user api////////////////////////////////// 


router.post('/signup',authController.signup)
router.post('/login' , authController.login)
router.get('/logout' , authController.logout)

router.post('/forgetPassword' , authController.forgetPassword)
router.patch('/resetPassword/:token' , authController.resetPassword)



router.use(authController.protect)



router.patch('/updateMyPassword' , authController.updatePassword)

router.patch('/updateMe',userControllers.uploadUserPhoto ,userControllers.resizeUserPhoto, userControllers.updateMe)

router.delete('/deleteMe' , userControllers.deleteMe)

router.get('/me', userControllers.getMe , userControllers.getUser)


router.use(authController.restrictTo('admin'))


router
    .route('/')
    .get(userControllers.getAllUsers)
    .post(userControllers.createUser)

router
    .route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser)



module.exports = router