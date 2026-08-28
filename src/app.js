const express= require("express")
const cors = require("cors")
const app= express()


app.use(cors())
app.use(express.json())


app.get("/", (req,res)=>{
    res.json({
        message: "E-Commerce API is running",
    })
})

module.exports= app