class APIFeatures{
    constructor(query , queryString){
        this.query = query
        this.queryString = queryString
    }
    filter(){
        // =====================build query========================

        const queryObj = {...this.queryString};                                                                          //make a copy form req.query
        const excludedFields = ['page','sort','limit' , 'fileds']                                                   //there items will delete from copy one
        excludedFields.forEach(i=>delete queryObj[i]);

        // =============================filtering===================

        let queryStr = JSON.stringify(queryObj)                                                                     //creating filtering form based on mongoose docs {$gte:3}
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g ,match=> `$${match}`) 
        this.query = this.query.find(JSON.parse(queryStr))        
        return this                                                                                                 //usong RGEX
    }
    
    sort(){
        if (this.queryString.sort) {                                                                             //enable the filtered items 
            const sortBy = this.queryString.sort.split(',').join(' ')                                            //mongoose undrastand something like this {sort:price duration}
            this.query = this.query.sort(sortBy)                                                                 //so we are trying to convert {sort: price,duration} to {sort:price duration}
        }else{
            this.query = this.query.sort('createdAt')                                                            //if user did not set any sort params we will set default sorting by createdat
        }
        return this
    }

    limitFields(){
        // =============================field limiting ================================
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')  
            this.query   = this.query.select(fields)                                                               //WE CAN REMOVE SOME FIELD BY SELECT IN MONGOOSE 
        }else{                                                                                                  // -name '-'  MEASN JUST REMOVE THIS ITEM AND IF DO NOT TYPE ANY THING IT WILL SELECT THE ITEMS WHICH WRITTEN
            this.query   = this.query.select('-__v')
        }
        return this
    }


    paginate(){
        // =============================paganition ================================
        const page = this.queryString.page * 1 ||1
        const limit =this.queryString.limit * 1 ||100
        const skip  = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}


module.exports = APIFeatures