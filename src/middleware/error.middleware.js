const errorMiddleware=(err, req, res,next)=>{
   let statusCode=err.statusCode || 500;
   let message= err.message || "Internal Server Error";

   if (err.name === "ValidationError"){
    statusCode=400;
    message=err.message;
   }else if(err.name ==="CastError"){
    statusCode=400;
    message="Invalid ID format";
   }else if(err.code && err.code ===11000){
    statusCode=400;
    message="Duplicated value found";

   }else if(err.name === "JsonWebTokenError"){
    statusCode=401;
    message="Invalid token ,Please Login again!";

   }else if(err.name === "TokenExpiredError"){
    statusCode=401;
    message="Token has expired ,Please Login again!";
   } 

   res.status(statusCode).json({
    success:false,
    message:message
   })

   
}

export default errorMiddleware;