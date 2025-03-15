import {check,oneOf} from 'express-validator';


const validateUser=
{
    // for user.controlller/registerUser 
    registerUser:
    [
        (req, res, next) => {
            console.log("✅ Inside validateUser.registerUser Middleware");
            console.log(req.body);
            next();
        },
    check('username').notEmpty().withMessage('username cannot be empty').trim().isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
    check('fullName').notEmpty().withMessage('fullName cannot be empty').trim().matches(/^[A-Za-z\s]+$/).withMessage('fullName must contain only alphabets').isLength({min : 5}).withMessage('fullName must be at least 5 characters long'),
    check('email').notEmpty().withMessage('email cannot be empty').isEmail().withMessage('Invalid email address'),
    check('password').notEmpty().withMessage('password cannot be empty').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],

    // for user.controlller/loginUser 
    loginUser:
    [
    oneOf
    ([
    check('username').notEmpty().withMessage('username cannot be empty').trim().isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
    check('email').notEmpty().withMessage('email cannot be empty').isEmail().withMessage('Invalid email address')
    ],
    "Either email or username is required"
    ),
    check('password').notEmpty().withMessage('password cannot be empty').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ]
}

export {validateUser}