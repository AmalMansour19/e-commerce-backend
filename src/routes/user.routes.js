import express from "express"
import User from "../models/User.model.js"
import Admin from "../middleware/admin.middleware.js"
import Auth from "../middleware/auth.middleware.js"
import {createUserSchema , updateUserSchema , changePasswordSchema, userIdSchema} from "../validation/user.validation.js"

const router = express.Router();


//Add New User

router.post('/add' , Admin , async (req , res) => {
    try{
        const isValid = createUserSchema.validate(req.body)

        if(isValid.error)
            return res.status(400).json({ message: isValid.error.details[0].message });


        const user = new User (isValid.value);
        await user.save();

        res.status(201).send(user);
    }catch(e){
        res.status(500).send(e);
    }

})

//End

//Get All Users

router.get('/all' , Admin , async (req , res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(500).send(e);
    }
})

//End

//Get User By His Id

router.get('/:id' , Admin , async (req , res) => {
    try{
        const idValidation = userIdSchema.validate({id: req.params.id})

        if(idValidation.error)
            return res.status(400).json({ message: idValidation.error.details[0].message });

        const id = idValidation.value.id;
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

router.patch('/:id' , Auth , async (req , res) => {
    try{
        const idValidation = userIdSchema.validate({id: req.params.id})

        if(idValidation.error)
            return res.status(400).json({ message: idValidation.error.details[0].message });

        const id = idValidation.value.id;
        const isValid = updateUserSchema.validate(req.body);

        if(isValid.error)
            return res.status(400).json({ message: isValid.error.details[0].message });

        if(id.toString() !== req.user._id.toString())
            return res.status(403).json({ message: "Unauthorized access." });

        const updateUser = await User.findByIdAndUpdate(id , isValid.value, {
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

router.patch('/password' , Auth , async (req , res) => {
    try{
        const passwordValidation = changePasswordSchema.validate(req.body);

        if(passwordValidation.error)
            return res.status(400).json({ message: passwordValidation.error.details[0].message });

        const { currentPassword, newPassword } = passwordValidation.value;

        const user = await User.findById(req.user._id);

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

router.delete('/:id' , Admin , async (req , res) => {
    try{
        const idValidation = userIdSchema.validate({id: req.params.id})

        if(idValidation.error)
            return res.status(400).json({ message: idValidation.error.details[0].message });

        const id = idValidation.value.id;
        const deleteUser = await User.findByIdAndDelete(id);

        if(!deleteUser)
            return res.status(404).json({ message: "User not found" });

        res.status(200).send(deleteUser);
    }catch(e){
        res.status(500).send(e)
    }
})

//End