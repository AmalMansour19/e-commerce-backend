import dotenv from "dotenv"
import app from "./app.js"
import connectDB from  "./DB/connection.js"


dotenv.config()

const PORT =process.env.PORT || 3000


connectDB()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})