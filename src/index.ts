import express, { Application } from 'express';
import * as process from 'node:process';
import morgan from 'morgan';
import 'dotenv/config';
import { threekitRoutes } from './routes/threekit.routes';

const app: Application = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('public'));

app.use('/api/v1/threekit', threekitRoutes);

app.use('*', (req, res) => {
    res.status(404).send('The requested page does not exist');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
