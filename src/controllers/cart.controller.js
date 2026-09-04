import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";


const getCart=async(req,res,next)=>{
    try{
        let cart =await Cart.findOne({user:req.user._id}).populate('items.product');

if(!cart){
    cart=await Cart.create({
        user:req.user._id,
        items:[],
    })
}

res.status(200).json({
    success:true,
    message:"Cart fetched successfully",
    cart,
})
    }catch(error){
        next(error);
    }

}


const addItemToCart=async (req,res,next)=>{
   try{
    const {productId,quantity}=req.body;

    if(!productId || !quantity ||quantity<=0){
     const  error=new Error("ProductId and quantity are required and quantity should be greater than 0");
     error.statusCode=400;
     return next(error);
    }
    
    const product = await Product.findById(productId);
    if(!product){
        const error =new Error("Product not found");
        error.statusCode=404;
         return next(error);
    }

    if(product.stock<quantity){
        const error=new Error("NO enough stock avaliable");
        error.statusCode=400;
        return next(error);
    }
  let cart=await Cart.findOne({user:req.user._id});
  if(!cart){
    cart= new Cart({
        user:req.user._id,
        items:[],
    })
  }

  cart.addItem({
    product:product._id,
    name:product.name,
    price:product.price,
    image:product.images && product.images.length>0 ? product.images[0].url : "",
    quantity,
  })

product.stock-=quantity;
await cart.save();
await product.save();
await cart.populate('items.product');


res.status(200).json({
    success:true,
    message:"item added successfully",
    cart,
})

   }catch(error){
     next(error);
   }
}

const updateItemQuantity=async(req,res,next)=>{
    try{
    const {productId,quantity}=req.body;

    if(!productId || !quantity ||quantity<=0){
     const  error=new Error("ProductId and quantity are required and quantity should be greater than 0");
     error.statusCode=400;
     return next(error);
    }

    let cart=await Cart.findOne({user:req.user._id});
    if(!cart){
        const error=new Error("Cart not found");
        error.statusCode=404;
        return next(error);
    }

    const item= cart.items.find((item)=>{
        return item.product.toString()===productId;
    })

    if(!item ){
         const error=new Error("Item not found in the cart!");
        error.statusCode=404;
        return next(error);
    }

    const product= await Product.findById(productId);
    if(!product){
        const error=new Error("Product is not found!");
        error.statusCode=404;
        return next(error);

    }
    const oldQuantity=item.quantity;
    const quantityDifference=quantity-oldQuantity;
    

    if(quantityDifference>0){
        if(product.stock<quantityDifference){
            const error=new Error("Not enough stock available!");
            error.statusCode=400;
            return next(error);
        }
        product.stock-=quantityDifference;

    }else if(quantityDifference<0){
        product.stock+=Math.abs(quantityDifference);

    }
    
    item.quantity=quantity;

    await cart.save();
    await product.save();
    await cart.populate('items.product');


res.status(200).json({
    success:true,
    message:"Cart item quantity updated successfully!",
    cart,
})
  


    }catch(error){
        next(error);
    }
}

const removeItemFromCart =async (req,res,next)=>{
    try{
      const{productId}=req.params;
      
    let cart=await Cart.findOne({user:req.user._id});
    if(!cart){
        const error=new Error("Cart not found");
        error.statusCode=404;
        return next(error);
    }

    const itemIndex=cart.items.findIndex((item)=>item.product.toString()===productId);

    if(itemIndex===-1){
        const error=new Error("Item not found in the cart!");
        error.statusCode=404;
        return next(error);
    }

    const item= cart.items[itemIndex];
    const product=await Product.findById(productId);
     if(product){
       product.stock+=item.quantity;
       await product.save();

    }

    cart.items.splice(itemIndex,1);
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
    success:true,
    message:"Item is removed from cart successfully!",
    cart,
})


    }catch(error){
        next(error);
    }
}

const clearCart= async(req,res,next)=>{
    try{
    const cart= await Cart.findOne({user:req.user._id});
    if(!cart){
        const error=new Error("Cart not found!");
        error.statusCode=404;
        return next(error);
    }

    for(const item of cart.items){
        const product=await Product.findById(item.product);
        if(product){
            product.stock+=item.quantity;
            await product.save();        }
    }
   cart.items=[];
   await cart.save();

   res.status(200).json({
    success: true,
    message:"Cart cleared successfully!",
    cart,
   })


    }catch(error){
     next(error);
    }
}


export {getCart,addItemToCart,updateItemQuantity,removeItemFromCart,clearCart};