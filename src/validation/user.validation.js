const express = require ('express');
const User = require('../models/User.model');
const router = express.Router();
const Admin = require('../middleware/admin.middleware');
const Auth = require('../middleware/auth.middleware');

router.post('/users/add' , Admin , async (req , res) => {
    try{
        const user = new User (req.body);
        await user.save();

        res.status(201).send(user);
    }catch(e){
        res.status(400).send(e);
    }

})

router.get('/users/all' , Admin , async (req , res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(500).send(e);
    }
})

router.get('/users/:id' , Admin , async (req , res) => {
    try{
        const id = req.params.id;
        const user = await User.findById(id);

        if(!user)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(user);
    }catch(e){
        res.status(400).send(e);
    }
})

router.patch('/users/:id' , Auth , async (req , res) => {
    try{
        const id = req.params.id;
        const update = req.body;
        const updateUser = await User.findByIdAndUpdate(id , update, {
            new: true, 
            runValidators: true 
        });

        if(!updateUser)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(updateUser);
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/:id' , Admin , async (req , res) => {
    try{
        const id = req.params.id;
        const deleteUser = await User.findByIdAndDelete(id);

        if(!deleteUser)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(deleteUser);
    }catch(e){
        res.status(400).send(e)
    }
})