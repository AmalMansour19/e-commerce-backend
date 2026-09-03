import dotenv from "dotenv"
import app from "./app"
import connectDB from  "./DB/connection"


dotenv.config()

const PORT =process.env.PORT || 3000


connectDB()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})