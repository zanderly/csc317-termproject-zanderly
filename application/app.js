var createError = require("http-errors");
var express = require("express");
var favicon = require('serve-favicon');
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var handlebars = require("express-handlebars");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
var flash = require('express-flash');
var sessions = require('express-session');
var mysqlSession = require('express-mysql-session')(sessions);

const app = express();

app.use(express.static('public'));

app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "views/layouts"), //where to look for layouts
    partialsDir: path.join(__dirname, "views/partials"), // where to look for partials
    extname: ".hbs", //expected file extension for handlebars files
    defaultLayout: "layout", //default layout for app, general template for all pages in app
    helpers: {}, //adding new helpers to handlebars for extra functionality
  })
);

var mysqlSessionStore = new mysqlSession(
  {
    /* using default options */
  },
  require('./conf/database')
  );

  app.use(sessions({
    key: "csid",
    secret: "this is a secret from csc317",
    store: mysqlSessionStore,
    resave: false,
    saveUninitialized: false
  }));

app.use(flash());
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));


// app.use(sessions({ cookie: { maxAge: 60000 }, 
//   secret: 'woot',
//   resave: false, 
//   saveUninitialized: false}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if(req.session.username){
    res.locals.logged = true;
  }
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
//app.use('/comments', commentsRouter);

/**
 * Catch all route, if we get to here then the 
 * resource requested could not be found.
 */
app.use((req,res,next) => {
  next(createError(404, `The route ${req.method} : ${req.url} does not exist.`));
})
  

/**
 * Error Handler, used to render the error html file
 * with relevant error information.
 */
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
