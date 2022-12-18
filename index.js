global.isObject = (obj) => {
  if (obj.constructor.name === 'Object') {
    return true;
  }
  return false;
};
  
const config = require('./config');
const mongoose = require('mongoose');

// mongoose.Promise = require('bluebird');
mongoose.Promise = global.Promise;

const connection =
  mongoose.connect(config.database.connection, config.database.option);

require('./modules/auto-increment').init(connection);
 
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');
const session = require('express-session');

const app = express();

//const upload = multer({ dest: '/public/uploads/' })
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    const namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(
  session(
    {
      secret: config.session.key,
      resave: true,
      key: 'user',
      saveUninitialized: true
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.response_message = req.flash('response_message');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', require('./routes/index'));
app.use('/', require('./routes/user'));
app.use('/admin', require('./routes/admin'));
app.use('/admin/category', require('./routes/admin-category'));
app.use('/admin/order', require('./routes/admin-order'));
app.use('/admin/product', require('./routes/admin-product'));
app.use('/admin/user', require('./routes/admin-user'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', config.app.port);

/**
 * Create HTTP server.
 */
const server = require('http').createServer(app);

server.listen(config.app.port);

server.on('error', (error) => {
  console.error(error);
  console.log(error);
  throw error;
});

server.on('listening', () => {
  require('debug')('shopping:server')(`Listening on ${server.address()}:${config.app.port}`);
});
