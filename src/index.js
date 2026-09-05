const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const connectDB =require("./DB/connection");
const PORT =process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});