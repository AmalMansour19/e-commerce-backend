const mongoose= require('mongoose')

const OrderSchema=new mongoose.Schema({
user:{
    type:mongoose.Types.ObjectId,
    ref:"User",
    required:true,
},
items:[
    {
        name:{
            type:String,
            required:true
        },
        image:{
            type:String,
        },
        price:{
            type :Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            min:1
        }
    }
]  ,
shippingAddress:{
    type:{
        fullName:{
        type:String
    }
    ,
    phone:{
        type:String,
        validate:{
            validator:function (value){
                return /^[0-9]{11}$/.test(value)
            },
            message:"Invalid phone number"
        }
    },
    country:{type:String},
    city:{type:String},
    address:{type:String},
    postalCode:{type:String}
    },
    required:true
},
paymentMethod:{
    type:String,
     enum:["cash","stripe","paypal","paymob"],
    default:"cash"
    },
paymentStatus:{
    type:String,
    enum:["pending","paid","failed","refunded"],
    default:"pending"
},
transactionId:{
    type:String
},
subtotal:{
    type :Number,
    required:true
},
shippingFee:{
    type :Number,
    default:function(){
        return this.subtotal >=1000?0:50
    }
},
tax:{
    type :Number,
    default:function (){
        return 0.14*this.subtotal
    }
},
discount:{
    type:Number,
    default : 0

},
totalPrice:{
    type:Number,
    default : function (){
        return this.subtotal + this.shippingFee + this.tax - this.discount
    },
    required:true
},
status:{
    type:String ,
    enum :[
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned"
    ],
    default:"pending"
    },
    paidAt:{
        type:Date
    },
    deliveredAt: {
        type: Date
    },
    
    cancelledAt: {
        type: Date
    },
    customerNote:{
        type:String,
        maxlength:[1000, "customer note cannot exceed 1000 characters"]
    },
    adminNote:{
        type:String,
        maxlength:[1000, "Admin note cannot exceed 1000 characters"]
    },
}
, {
    timestamps: true
})
const Order=mongoose.model('Order',OrderSchema )

module.exports=Order