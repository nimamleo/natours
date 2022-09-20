const { default: mongoose } = require("mongoose");
const Tour = require("./tourModel");


const reviewSchema = mongoose.Schema({
    review:{
        type:String,
        required:[true, 'review can not be empty']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tour",
        required:[true, 'review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, 'review must belong to a user']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


// reviewSchema.index({rating:1})


reviewSchema.pre( /^find/ , function(next){
    const review = this
    review
        .populate({
            path:'user',
            select:'name photo'
        })
        
    next()

})


reviewSchema.statics.calcAverageRatings =async function(tourId){
    const stats = await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    if (stats.length >0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });



reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.post('save', function() {
    // this points to current review
    const review = this
    review.constructor.calcAverageRatings(review.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    const review = this
    review.r = await review.clone();
    // console.log(review.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    const review = this
    await review.r.constructor.calcAverageRatings(review.r.tour);
});



const Review = mongoose.model('Review' , reviewSchema)

module.exports = Review