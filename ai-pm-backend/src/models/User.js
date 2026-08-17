//importing mongoose so that we can create schemas usuin it
const mongoose = require("mongoose");
//defining userSchema
const userSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    }
      },
    {timestamps:true}
);
module.exports = mongoose.model('User',userSchema)