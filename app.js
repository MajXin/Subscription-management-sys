import express from 'express';
import {PORT} from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionsRouter from './routes/subscriptions.routes.js';
import connectToDatabase from './database/mongodb.js';

const app = express();

app.use('/api/v1/auth', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);

app.get('/', async (req, res)=> {
    res.send('Welcome to Subscription tracker API');
    connectToDatabase();
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

export default app;