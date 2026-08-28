const dotenv = require("dotenv")
const app = require("./app")
const connectDB =require("./DB/connection")


dotenv.config()

const PORT =process.env.PORT || 5000


connectDB()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})