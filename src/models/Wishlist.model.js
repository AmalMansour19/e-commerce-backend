import mongoose, { Mongoose } from "mongoose";
let wishListSchema = new mongoose.Schema({
    user : {
         type : mongoose.
         Schema.Types.ObjectId,
          ref : "User",
          unique: true,
          index:true,
        },
    products : [{
        type : mongoose.Schema.Types.ObjectId 
        , ref : "Product"
}],

}) 
const WishList=Mongoose.model("WishList",wishListSchema)
module.exports=WishList
