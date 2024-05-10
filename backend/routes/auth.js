const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_TOKEN = 'pavan$sharma#@123';

// ROUTE 1: Create a user using: POST "/api/auth/createuser". Doesn't require login.

router.post('/createuser',
    [
        body('name', 'Enter a valid name.').isLength({ min: 3 }),
        body('email', 'Enter a valid email. ').isEmail(),
        body('password', 'Password must be 5 characters long. Short password not accepted.').isLength({ min: 5 }),
    ],
    async (req, res) => {

        // If there are errors, return bad request.

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // check whether the user with same email exists already.

        try {

            let user = await User.findOne({ email: req.body.email });

            // if user exists, return bad request.

            if (user) {
                return res.status(400).json({ error: "Sorry a user with this email already exists." });
            }

            const salt = await bcrypt.genSalt(10);

            const secPass = await bcrypt.hash(req.body.password, salt);

            // If there are no errors, then save the user and return the user.

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass
            });

            const data = { user: { id: user.id } };
            const authtoken = jwt.sign(data, JWT_TOKEN);

            res.json({ authtoken });


        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error. Please contact admin.");
        }

    });

// ROUTE 2: Create a user using: POST "/api/auth/login". Doesn't require login.

router.post('/login',
    [
        body('email', 'Enter a valid email.').isEmail(),
        body('password', 'Password cann\'t be blank.').exists()
    ],

    async (req, res) => {

        // If any error, send error 

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // fetching data from requst body ( Destructuring ) 

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ error: "Please try to login with correct credentials." });
            }

            const passwordCompare = await bcrypt.compare(password, user.password);

            if (!passwordCompare) {
                return res.status(400).json({ error: "Please try to login with correct credentials." });
            }

            const data = {
                user: { id: user.id }
            }

            const authtoken = jwt.sign(data, JWT_TOKEN);

            res.json({ authtoken });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error. Please contact admin.");
        }

    });

// ROUTE 3: Get user logged in details usring: POST "/api/auth/getuser" Login Required

router.post('/getuser', fetchuser, async (req, res) => {

    try {

        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error. Please contact admin.');
    }

});

module.exports = router;