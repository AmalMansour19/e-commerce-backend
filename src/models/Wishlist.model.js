import mongoose from "mongoose";
let wishListSchema = new mongoose.Schema({
    user : {
         type : mongoose.Schema.Types.ObjectId,
          ref : "User",
          require:true,
          uniqued: true,
          index:true,
        },
    products : [{
        type : mongoose.Schema.Types.ObjectId ,
         ref : "Product"
}],

}) ;

wishListSchema.pre(/^find/,function(next){
    this.populate("products")
    next()
})

const WishList=mongoose.model("wishList",wishListSchema)
export default WishList