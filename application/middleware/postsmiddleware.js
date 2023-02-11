var db = require("../conf/database");
const postMiddleware = {}

postMiddleware.getRecentPosts = function (req, res, next) {

    let baseSQL = 'SELECT id, title, description, thumbnail, created FROM posts ORDER BY created DESC LIMIT 8';
    db.execute(baseSQL,[])
    .then(([results, fields]) => {
        res.locals.results = results;
        if (results && results.length == 0) {
            req.flash('error', 'There are no posts created yet')
        }
        next();
    })
        


}

postMiddleware.getPostById = async function (req, res, next) {
    try {     
        let postId = req.params.id;
        let results = await getPostById(postId);

        if (results && results.length) {
            res.locals.currentPost = results[0];
            next();
        }
        else {
            req.flash("error", "This is not the post you are looking for.");
            res.redirect('/');
        }     
    }
    catch (err) {
        next(err);
    }
}

postMiddleware.getCommentsByPostId = async function (req, res, next) {
    let postId = req.params.id;
    try {
        let results = await getCommentsForPost(postId);
        res.locals.currentPost.comments = results;
        next();
    }
    catch (err) {
        next(err);
    }
}

module.exports = postMiddleware;