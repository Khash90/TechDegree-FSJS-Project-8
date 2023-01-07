var express = require('express');
var path = require('path');
const Sequelize = require('./models/index.js').sequelize;
var indexRouter = require('./routes/index');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// database connection
(async () => {
  try {
    await Sequelize.sync();
    await Sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use( (req, res, next) => {
  const err = new Error();
  err.statusCode = 404;
  err.message = "Sorry ! the page you are looking for doesn't exist";
  res.render('page-not-found', {title: "Page Not Found", err});
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  err.status = err.status ? err.status : 500;
  err.message = err.message ? err.message : "Sorry,,,The was an issue with the server!";

  console.log(err.status, err.message)

  // render the error page
  res.status(err.status);
  res.render('error', {title: "Page Not Found" , err});
});

module.exports = app;
