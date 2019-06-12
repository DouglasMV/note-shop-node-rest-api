const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

//mongoose.connect('mongodb+srv://douglas:'+ process.env.MONGO_ATLAS_PW +'@note-shop-node-rest-api-jjlme.mongodb.net/test?retryWrites=true',
//{
//    useNewUrlParser: true
//});

mongoose.connect('mongodb://localhost:27017/note-shop-node-rest-api',
{
    useNewUrlParser: true
});

mongoose.Promise = global.Promise;

app.use(helmet());
app.use(morgan('dev'));
app.use('/upload', express.static('upload'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

// const productsLimiter = rateLimit({
//     windowMs: 1 * 1000, // 1 segundo
//     max: 3
// });

const userLimiter = rateLimit({
    windowMs: 1 * 1000, // 1 minuto
    max: 3
});

app.use('/products', /*productsLimiter,*/ productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userLimiter, userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;