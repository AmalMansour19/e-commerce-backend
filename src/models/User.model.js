const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate(val) {
                if (!validator.isEmail(val)) {
                    throw new Error("Email is INVALID");
                }
            },
        },

        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            select: false,
        },

        phone: {
            type: String,
            trim: true,
        },

        

        role: {
            type: String,
            enum: ["admin", "customer"],
            default: "customer",
        },

        addresses: [
            {
                fullName: {
                    type: String,
                    required: true,
                    trim: true,
                },

                phone: {
                    type: String,
                    required: true,
                    trim: true,
                },

                country: {
                    type: String,
                    required: true,
                    trim: true,
                },

                city: {
                    type: String,
                    required: true,
                    trim: true,
                },

                address: {
                    type: String,
                    required: true,
                    trim: true,
                },

                postalCode: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],

        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        avatar: {
            type: String,
            trim: true,
            default: "https://placehold.co/150x150",
        },

        resetPasswordToken: {
            type: String,
        },

        resetPasswordExpire: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

////////////////////////////////////////////////////////////////////////////////////////
// Hash Password

userSchema.pre("save", async function () {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcryptjs.hash(user.password, 10);
    }
});

////////////////////////////////////////////////////////////////////////////////////////
// Compare Password

userSchema.methods.comparePassword = async function (enteredPassword) {
    const user = this;

    return await bcryptjs.compare(enteredPassword, user.password);
};

////////////////////////////////////////////////////////////////////////////////////////

const User = mongoose.model("User", userSchema);

module.exports = User;


