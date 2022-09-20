const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingConrtroller')
const authController = require('../controllers/authController')


router.get('/checkout-session/:tourId' , authController.protect , bookingController.getChecoutSession)

module.exports = router