const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
// const debug = require('debug')('app:startup'); // Use only this if you only need one debugger in this file.
const courses = require('./routes/courses');
const home = require('./routes/home');

const logger = require('./middleware/logger');
const authenticator = require('./middleware/authenticator');

const app = express();

app.set('view engine', 'pug');
// app.set('views', './views'); // The default directory for views. This is the default value. You can overwrite it.
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/courses', courses);
app.use('/', home);

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  startupDebugger('Morgan enabled...'); // $env:DEBUG='app:startup'
}

// Database work...
dbDebugger('Connected to the database...'); // $env:DEBUG='app:db'

app.use(logger);
app.use(authenticator);

console.log(`Application name: ${config.get('name')}`);
console.log(`Mail server: ${config.get('mail.host')}`);
// console.log(`Mail Password: ${config.get('mail.password')}`); // $env:expressAppPassword='1234'

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}...`));