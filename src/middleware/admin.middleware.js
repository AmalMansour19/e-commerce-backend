// needs auth middleware to run first and give req.user
// TODO: setup to use error handling from "error.middleware" once it exists
const adminPerms = (req, res,next) =>{
    if (!req.user){
        return res.status(401).json({ message: "user not authenticated" });
    }

    if (req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied. you aren't an admin" });
    }

    next();
}


export default  adminPerms