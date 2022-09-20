const express = require('express')
const fs = require('fs') 
const morgan = require("morgan")
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const cookieParser = require('cookie-parser')

const globalErrorHandeler = require('./controllers/errorController')
const AppError = require('./utils/appError')
const tourRouter = require('./routers/tourRouts')
const userRouter = require('./routers/userRouts')
const reviewRouter = require('./routers/reviewRouts')
const bookingRouter = require('./routers/bookingRoutes')
const viewRouter = require('./routers/viewRoutes')
const compression = require('compression')
const app = express()



app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//set security HTTP headers
app.use(helmet())





app.use(compression())
// console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//body parser
app.use(express.static(path.join(__dirname,'public')))

//serving static files
app.use(express.json({limit:'10kb'}))
app.use(cookieParser())
app.use(express.urlencoded({extended:true , limit:'10kb'}))

//data sanitization against nosql 
app.use(mongoSanitize())

//data sanitization againt  XSS
app.use(xss())


app.use(function(req, res, next) { 
    res.setHeader( 'Content-Security-Policy', "script-src 'self' https://cdnjs.cloudflare.com" ); 
    next(); 
})





//prevent parameter query   ====> if we use two query with same key app will crash but with this package we prevent this bug but for adding some exeption we can deine the parameters in a array in a whitlist
app.use(hpp({whitelist:['duration' , 'ratingQuantity' ,'ratingsAverage' , 'maxFroupSize' , 'difficulty','price']}))   

//limit request
const limiter = rateLimit({  
    max:100,
    windowMs:60*60*1000,
    message:'Too many request from this IP , please try again'
})
app.use('/api',limiter)




app.use('/' , viewRouter)
app.use('/api/v1/tours' , tourRouter)
app.use('/api/v1/users' , userRouter)
app.use('/api/v1/reviews' , reviewRouter)
app.use('/api/v1/booking' , bookingRouter)
app.all('*' , (req,res,next)=>{
    next(new  AppError(`can not find ${req.originalUrl} on the server`))
    
})


app.use(globalErrorHandeler)

module.exports = app