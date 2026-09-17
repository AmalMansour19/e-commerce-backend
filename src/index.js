import 'dotenv/config';
import app from "./app.js"
import connectDB from  "./DB/connection.js"



const PORT =process.env.PORT || 3000


connectDB()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})