const express = require ('express');
const User = require('../models/User.model');
const router = express.Router();
const Admin = require('../middleware/admin.middleware');
const Auth = require('../middleware/auth.middleware');
const {createUserSchema , updateUserSchema , changePasswordSchema, userIdSchema} = require('../validation/user.validation')


//Add New User

router.post('/users/add' , Admin , async (req , res) => {
    try{
        const {error , value} = createUserSchema.validate(req.body)

        if(error)
            return res.status(400).json({ message: error.details[0].message });


        const user = new User (value);
        await user.save();

        res.status(201).send(user);
    }catch(e){
        res.status(500).send(e);
    }

})

//End

//Get All Users

router.get('/users/all' , Admin , async (req , res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(500).send(e);
    }
})

//End

//Get User By His Id

router.get('/users/:id' , Admin , async (req , res) => {
    try{
        const {error , value} = userIdSchema.validate({id: req.params.id})

        if(error)
            return res.status(400).json({ message: error.details[0].message });

        const id = value.id;
        const user = await User.findById(id);

        if(!user)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(user);
    }catch(e){
        res.status(500).send(e);
    }
})

//End

//Change User Information

router.patch('/users/:id' , Auth , async (req , res) => {
    try{
        const {error , value} = userIdSchema.validate({id: req.params.id})

        if(error)
            return res.status(400).json({ message: error.details[0].message });

        const id = value.id;
        const {error: error2, value: value2} = updateUserSchema.validate(req.body);

        if(error2)
            return res.status(400).json({ message: error2.details[0].message });

        const updateUser = await User.findByIdAndUpdate(id , value2, {
            new: true, 
            runValidators: true 
        });

        if(!updateUser)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(updateUser);
    }catch(e){
        res.status(500).send(e)
    }
})

//End

//Update Password

router.patch('/users/:id/password' , Auth , async (req , res) => {
    try{
        const idValidation = userIdSchema.validate({
            id: req.params.id
        });

        if(idValidation.error)
            return res.status(400).json({ message: idValidation.error.details[0].message });

        const passwordValidation = changePasswordSchema.validate(req.body);

        if(passwordValidation.error)
            return res.status(400).json({ message: passwordValidation.error.details[0].message });

        const { currentPassword, newPassword } = passwordValidation.value;

        const user = await User.findById(idValidation.value.id);

        if(!user)
            return res.status(404).json({ message: "User not found" });

        const isMatch = await user.comparePassword(currentPassword);

        if(!isMatch)
            return res.status(400).json({ message: "Password is incorrect" });

        user.password = newPassword;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    }catch(e){
        res.status(500).send(e);
    }
})

//Delete User By His Id

router.delete('/users/:id' , Admin , async (req , res) => {
    try{
        const {error , value} = userIdSchema.validate({id: req.params.id})

        if(error)
            return res.status(400).json({ message: error.details[0].message });

        const id = value.id;
        const deleteUser = await User.findByIdAndDelete(id);

        if(!deleteUser)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(deleteUser);
    }catch(e){
        res.status(500).send(e)
    }
})

//End