import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'

dotenv.config();

import v1 from './routes/v1/v1';

const app = express();

const swaggerDefinition = {
    info: {
        title: 'Auth Service',
        version: '0.1',
        description: 'Auth API'
    },
    host: 'localhost:5000',
    basePath: '/'
};

const options = {
    swaggerDefinition,
    apis: ['./routes/v1/api.js']
};

const swaggerSpec = swaggerJSDoc(options);

app.set('port', process.env.PORT || 5000);

app.use(express.json());
app.use(
    express.urlencoded( {
        extended: false
    })
);
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/v1', v1);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
    res.sendStatus(404);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.json({
        code: 500,
        v: 'v1',
        status: 'ERR_SERVER'
    });
});

app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});