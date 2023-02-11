var express = require('express');
var router = express.Router();
var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;
var getRecentPosts = require('../middleware/postsmiddleware').getRecentPosts;
var db = require("../conf/database");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'My application'});
});

router.get('/login', (req, res, next) => {
    res.render('login', { title: "Log In"});
});

router.get('/registration', (req, res, next) => {
    res.render('registration', { title: "Register"});
});

router.use('/postimage', isLoggedIn);

router.get('/postimage', (req, res, next) =>{
    res.render('postimage', { title: "Create A Post"});
});

router.get('/viewpost', (req, res, next) => {
    res.render('viewpost');
});

router.get('/post/:id(\\d+)', (req, res, next) => {
    //res.send({params:req.params.id});
    let baseSQL =
    "SELECT u.username, p.title, p.description, p.photopath, p.created \
    FROM users u \
    JOIN posts p \
    ON u.id=fk_userid \
    WHERE p.id=?;";

    let postId = req.params.id;

    db.execute(baseSQL,[postId])
    .then(([results, fields]) => {
        if(results && results.length){
            let post = results[0];
            res.render('imagepost', {currentPost: post});
        }
        else{
            req.flash('error', 'This is not the post you are looking for');
            res.redirect('/');
        }
    })
});

// router.get('/post/help', (req, res, next) => {
//     res.send({literal: "literal help"});
// });

module.exports = router;
