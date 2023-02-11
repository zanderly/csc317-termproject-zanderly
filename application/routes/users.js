var express = require('express');
var router = express.Router();
var db = require('../conf/database');
const bcrypt = require('bcrypt');
const { successPrint, errorPrint } = require('../helpers/debug/debugprinters');
const UserError = require('../helpers/error/UserError');
const UserModel = require('../models/Users');
const res = require('express/lib/response');




/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', (req, res, next) => {
    let username = req.body.usrname;
    let email = req.body.email;
    let password = req.body.passw;
    let confpw = req.body.confpw;



    
    db.execute("SELECT * FROM users WHERE username=?", [username])
    .then(([results, fields]) => {
        if (results && results.length == 0) {
            return db.execute("SELECT * FROM users WHERE email=?", [email]);
        }
        else {
            throw new UserError("Registration Failed: Username already exists",
                '/registration',
                200);
        }
    })
    .then(([results, fields]) => {
        if (results && results.length == 0) {
            return bcrypt.hash(password, 15);
        } else {
            throw new UserError(
                "Failed Registration, Email already exists",
                "/registration",
                200
            );
        }
    })
    // .then(([results, fields]) => {
    //     if (results && results.length == 0) {
    //         let baseSQL = "INSERT INTO users(username, email, password, created) VALUES (?,?,?,now());"
    //         return db.execute(baseSQL, [username, email, password]);
    //     } else {
    //         throw new UserError(
    //             "Failed Registration, Email already exists",
    //             "/registration",
    //             200
    //         );
    //     }
    // })
    .then((hashedPassword) => {
        let baseSQL =
            "INSERT INTO users (username, email, password, created) VALUES (?,?,?, now());";
        return db.execute(baseSQL, [username, email, hashedPassword]);
    })
    .then(([results, fields]) => {
        if (results && results.affectedRows) {
            successPrint("User created");
            req.flash('success', 'User account has been made');
            res.redirect('/login');
        }
        else {
            throw new UserError(
                "Error, couldnt create user",
                "/registration",
                500
            );
        }
    })
    .catch((err) => {
        errorPrint("Unable to create user", err);
        if (err instanceof UserError) {
            errorPrint(err.getMessage());
            req.flash('error', err.getMessage());
            res.status(err.getStatus());
            res.redirect(err.getRedirectURL());
        }
        else {
            next(err);
        }
    });

    

    
});

router.post('/login', (req, res, next) => {
    let username = req.body.usrname;
    let password = req.body.passw;

    let baseSQL = "SELECT id, username, password FROM users WHERE username=?;"
    let userId;
    db.execute(baseSQL, [username])
        .then(([results, fields]) => {
            if (results && results.length == 1) {
                let hashedPassword = results[0].password;
                //successPrint(`User ${username} is logged in`);
                //req.session.username = username;
                userId = results[0].id;
                return bcrypt.compare(password, hashedPassword);
                //res.locals.logged = true;    
                //res.render('index');
            }
            else {
                throw new UserError("invalid username and/or password", "/login", 200);
            }
        }) 
        .then((passwordsMatched) => {
            if (passwordsMatched) {
                successPrint(`User ${username} is logged in`);
                req.session.username = username;
                req.session.userid = userId;
                res.locals.logged = true;
                req.flash('success', 'You have been Logged in');;
                res.redirect("/");
            }
            else {
                throw new UserError("Invalid username and/or password", "/login", 200);
            }
        })
        .catch((err) => {
            errorPrint("User login failed");
            if (err instanceof UserError) {
                errorPrint(err.getMessage());
                req.flash('error', err.getMessage());
                res.status(err.getStatus());
                res.redirect('/login');
            }
            else {
                next(err);

            }
        })

})

router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            errorPrint('Unable to destroy session');
            next(err);
        }
        else {
            successPrint("Successful destruction of session");
            res.clearCookie('csid');
            res.json({ status: "OK", message: "User has been logged out" });
        }
    })
});

module.exports = router;
