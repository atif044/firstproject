const { request } = require('express');
const express = require('express');
//const { users } = require('moongose/models');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'signedbymirzafuckingghalib'
const fetchuser = require('../middleware/fetchuser')
let successSign = false;
let successLog = false;
//Route 1 to create a user using POST request /api/auth/createuser
router.post('/createuser', [
    body("name", 'Must be of length 3 or more').isLength({ min: 3 }),
    body("email", 'Enter a valid Email address').isEmail(),
    body("password", 'Minimum length:5').isLength({ min: 5 }),

], async (request, response) => {
    //console.log(request.body);
    const errors = validationResult(request)
    //check for any errors
    if (!errors.isEmpty()) {
        successSign = false;
        return response.status(400).json({ successSign, errorr: errors.array() })
    }
    try {
        //check user exists or not
        let user = await User.findOne({ email: request.body.email });
        //if exists return error
        if (user) {
            successSign = false;
            return response.status(400).json({ successSign, errorr: "Email has already been taken" })
        }
        else {
            //securing password using salt
            const salt = await bcrypt.genSalt(10);
            //converting to hash after adding a salt to the password
            const securePass = await bcrypt.hash(request.body.password, salt)
            //creating user if not exist
            user = await User.create({
                name: request.body.name,
                email: request.body.email,
                password: securePass
            })
            successSign = true;
            const data = {
                user:
                {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET)

            response.json({ successSign, msg: "Successfully Signed up", authToken })

        }
    }
    catch (error) {
        successSign = false;
        console.error(error.message);
        response.status(500).send("Something Went Wrong!!");
    }
})

//Route 2 : authentication of a user using POST:/api/auth/login
router.post('/login', [
    body("email", 'Enter a valid Email address').isEmail(),
    body("password", 'Password minimum length is 5').isLength({ min: 3 })
], async (request, response) => {

    //check for any errors and return bad request + errors 
    const errors = validationResult(request)
    const { email, password } = request.body;
    if (!errors.isEmpty()) {
        successLog = false;
        return response.status(400).json({ successLog, msg: "Invalid Email or Password", errors: errors.array() })
    };
    try {
        let user = await User.findOne({ email });
        if (!user) {
            successLog = false;
            return response.status(400).json({ successLog, msg: 'Email or Password is incorrect' });
        }
        else {
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                successLog = false;
                return response.status(400).json({ successLog, msg: 'Email or Password is incorrect' });
            }
            else {
                const data = {
                    user:
                    {
                        id: user.id
                    }
                }
                const authToken = jwt.sign(data, JWT_SECRET)
                successLog = true;
                response.json({ successLog, msg: "Sucessfully logged in", authToken });
            }
        }
    }
    catch (error) {
        console.error(error.message);
        response.status(500).send("Internal Server Error!!");
    }
})
//Route 3: to get details of user "/api/auth/getuser" using POST 
router.post('/getuser', fetchuser, async (request, response) => {
    try {
        userId = request.user.id;
        const user = await User.findById(userId).select("-password");
        response.send(user);
        console.log(user.name)
    }
    catch (error) {
        console.error(error.message);
        response.status(500).send("Internal Server Error!!");
    }
})

module.exports = router
