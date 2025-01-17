import express, { Application } from 'express';
import * as process from 'node:process';
import morgan from 'morgan';
import 'dotenv/config';
import { threekitRoutes } from './routes/api.routes';
import cors from 'cors';
import bodyParser from 'body-parser';

const app: Application = express();
const port = process.env.PORT || 5000;

app.use(
    express.json({
        limit: '250mb',
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: '250mb',
        parameterLimit: 50000,
    })
);
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '250mb' }));

// CORS
app.use(cors());

// Trim all the incoming request body strings
app.use((req, res, next) => {
    for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim();
        }
    }
    next();
});

app.use('/', threekitRoutes);

app.use('*', (req, res) => {
    res.status(404).send('The requested page does not exist');
});

app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Server listening on port ${port}`);
});
