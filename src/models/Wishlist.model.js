const mongoose=require("mongoose")
let wishListSchema = new mongoose.Schema({
    user : {
         type : mongoose.Schema.Types.ObjectId,
          ref : "User",
          require:true,
          unique: true,
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

const WishList=mongoose.model("WishList",wishListSchema)
module.exports=WishList