//for REGISTRATION+LOGIN--we need jwt,bcrypt
const bcrypt = require("bcryptjs")
//jwt
const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const User = require("../models/User")
//generate token for jwt
const generateToken = (userId) =>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
};
//Register..
exports.register = async(req,res) =>{
    try {
        //first get the name emIL PASSWORD FROM REQ.BODY
        const {name,email,password} =  req.body;
        if(!name || !email || !password){
             return res.status(400).json({ message: 'All fields are required' });
        }
        //now find existing user
        const existingUser = await User.findOne({email});
        if(existingUser){
             return res.status(400).json({ message: 'Email already registered' });
        }
        //now usuing jwt-crypto to crptic way matching pasword
        const salt = await bcrypt.genSalt(10); //10-rounds-alteration--safe !!
        const hashedPassword = await bcrypt.hash(password,salt)
        const user = await User.create({name,email,password:hashedPassword});
        //genrate token
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// LOGIN
exports.login = async(req,res)=>{
    try {
        const{name,email,password} = req.body;
        //find the user based on email
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        //password-matching 
        const isMatchedPassword = await bcrypt.compare(password,user.password);
         if (!isMatchedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    //IF--ALL OKYY--200

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // In production this gets emailed. For now, return it directly for testing.
    res.status(200).json({
      message: 'Reset token generated',
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};