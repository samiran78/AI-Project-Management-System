require('dotenv').config();
const express = require('express')
const cors = require("cors")
const connectDB = require("./config/db")
//router-APIS for authetication
const authRoutes = require('./routes/authRoutes');
const app = express(); //installing express
//connectDb
connectDB();
app.use(cors()); //usuing cors middleware to avid browser-matching issue!!
app.use(express.json())
app.use('/api/auth',authRoutes)
//decicing PORTS
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))