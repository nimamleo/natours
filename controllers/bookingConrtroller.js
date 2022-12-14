const  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Tour = require("../model/tourModel")
const catchAsync = require("../utils/catchAsync")

exports.getChecoutSession =catchAsync( async (req,res,next)=>{
    const tour = await Tour.findById(req.params.tourId)

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `http://${req.get('host')}/`,
        cancel_url: `http://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`http://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: parseInt(tour.price) * 100,
                currency: 'usd',
                quantity: 1,
            }
        ]
    })

    res.status(200).json({
        status:'success',
        session
    })
})