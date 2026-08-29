import mongoose, { Mongoose } from "mongoose";
let wishListSchema = new mongoose.Schema({
    userId : {
         type : mongoose.
         Schema.Types.ObjectId,
          ref : "User",
          unique: true,
          index:true,
        },
    productId : [{
        type : mongoose.Schema.Types.ObjectId 
        , ref : "Product"
}],

}) 
const WishList=Mongoose.model("WishList",wishListSchema)
module.exports=WishList