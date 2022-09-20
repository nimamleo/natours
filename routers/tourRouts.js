const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const tourControllers = require('../controllers/tourController')
const reviewRouter = require('../routers/reviewRouts')



router.use('/:tourId/reviews' , reviewRouter)


router
    .route('/top-5-cheap')
    .get(tourControllers.aliasTopTours , tourControllers.getALlTours)


router
    .route('/tour-status')
    .get(tourControllers.getTourStats)

router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide' , 'guide'),
        tourControllers.getMonthlyPlan
    )



router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get( tourControllers.getToursWithin)

// router.param('id' , tourControllers.checkID)
////////////////////////////////////////////tour api////////////////////////////////// 
router
    .route('/') 
    .get(authController.protect,tourControllers.getALlTours) 
    .post(authController.protect , authController.restrictTo('admin', 'lead-guide') , tourControllers.creatTour)

router
    .route('/:id')
    .get(tourControllers.getTour )
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide') ,
        tourControllers.uploadTourImages,
        tourControllers.resizeTourImages,
        tourControllers.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourControllers.deleteTour
    );



module.exports = router