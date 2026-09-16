import mongoose from "mongoose";
let wishListSchema = new mongoose.Schema({
    user : {
         type : mongoose.Schema.Types.ObjectId,
          ref : "User",
          required:true,
          unique: true,
          index:true,
        },
    products : [{
        type : mongoose.Schema.Types.ObjectId ,
         ref : "Product"
}],

}) ;

wishListSchema.pre(/^find/,function(){
    this.populate("products")
})

const WishList=mongoose.models.wishList||
mongoose.model("wishList",wishListSchema)
export default WishList
