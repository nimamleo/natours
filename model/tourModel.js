const { default: mongoose, model } = require("mongoose");
const { default: slugify } = require("slugify");
const validator = require('validator');
const User = require("./userModel");
const tourSchmea  =new mongoose.Schema({
    name:{
        type:String,
        required:[true , 'tour must have name'],
        unique:true,
        trim:true,
        maxLength:[40 , 'a tour name must have less than 40 char'],
        minLength:[10 , 'a tour name must have more than 10 char'][[]]
        // validate:{
        //     validator:validator.isAlpha,
        //     message:"name should contain only Alpha char"
        // }
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'a tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true , 'a tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true , 'a tour must have a group difficulty'],
        enum:{
            values:['easy' , 'medium' , 'difficult'],
            message:'difficult  can be easy , medium , difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        default:5,
        min:[1 , 'rating must be above 1.0'],
        max:[5 , 'rating must be below 5.0'],
        set:val=>Math.round(val *10) / 10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true , 'tour must have price']
    },
    priceDiscount:{
        type: Number,
        validate:{
            //this will only work on create not update
            validator:function(val){
                return val < this.price
            },
            message:"discount should be less than price"
        }
    },
    summary:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true,
        required:[true , 'a tour must have a description']
    },
    imageCover:{
        type:String,
        required:[true , 'a tour must have a image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },

    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchmea.index({price:1 , ratingsAverage:-1})
tourSchmea.index({slug:1})
tourSchmea.index({startLocation:'2dsphere'})
// tourSchmea.index({price:1})

//Document midllware
tourSchmea.virtual('durationWeeks').get(function(){                                                                 //they wont show or save in data base , they are a virtual data
    return this.duration/ 7
})


tourSchmea.virtual('reviews' , {
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

tourSchmea.pre('save' , function(next){
    const tour = this
    tour.slug = slugify(tour.name, { lower: true });
    next()
})

tourSchmea.pre('save' ,async  function(next){
    const tour = this
    const guidesPromises = tour.guides.map(async id=>await User.findById(id))
    tour.guides = await Promise.all(guidesPromises)
    next()
})

//Query midllware
tourSchmea.pre(/^find/, function(next){
    const tour = this
    tour.find({secretTour : {$ne:true}})
    next()
})

tourSchmea.pre(/^find/, function(next){
    const tour = this
    tour.populate({
        path:'guides',
        select:"-__v -passwordChangedAt"
    })
    next()
})


//Aggregation midllware
tourSchmea.pre('aggregate', function(next){
    const tour = this
    tour.pipeline().unshift({$match : {secretTour: {$ne:true}}})
    next()
})




const Tour = mongoose.model('Tour' , tourSchmea)


module.exports = Tour