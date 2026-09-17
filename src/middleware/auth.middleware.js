import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';


const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({
        error: 'Please authenticate'});
    }
        const token = authHeader.replace('Bearer ', '');
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
           _id: decode._id
           });
        if (!user) {
              return res.status(401).json({
                error: 'Please authenticate'});}
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).json({
            error: 'Please authenticate'
        }); } };

export default auth;