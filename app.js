import express from 'express';
import {PORT} from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionsRouter from './routes/subscriptions.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './controllers/arcjet.controller.js';

const app = express();

app.use(arcjetMiddleware);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use(errorMiddleware);

app.get('/', async (req, res)=> {
    res.send('Welcome to Subscription tracker API');
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port http://localhost:${PORT}`);
    connectToDatabase();
});

export default app;