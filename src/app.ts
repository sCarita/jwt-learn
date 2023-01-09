require('dotenv').config();
import express, {
    NextFunction, 
    Request, 
    Response, 
    response
} from 'express';
import customConfig from './config/default';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import { AppError } from './utils/appError';

const prisma = new PrismaClient();
const app = express();

async function bootstrap() {
    // TEMPLATE ENGINE
    app.set('view engine', 'pug');
    app.set('views', `${__dirname}/views`);

    // MIDDLEWARE
    // 1.Body Parser
    app.use(express.json({ limit: '10kb' }));
    // 2. Cookie Parser
    app.use(cookieParser());

    // 2. Cors
    app.use(
        // We need to install the cors package to enable us to run both the frontend 
        // and backend on different domains.
        cors({
            origin: [customConfig.origin],
            // I used the CORS middleware and provided it with the domain the frontend 
            //   will be running on. Also, make sure you set credentials: true to 
            //   allow CORS to accept cookies from the cross-origin request.
            credentials: true,
        })
    );
    // 3. Logger
    if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

    // ROUTES
    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);

    // Testing
    app.get('/api/healthchecker', (_, res: Response) => {
        res.status(200).json({
            status: 'success',
            message: 'here',
        });
    });

    // UNHANDLED ROUTES
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
        next(new AppError(404, `Route ${req.originalUrl} not found`));
    });

    // GLOBAL ERROR HANDLER
    app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
        err.status = err.status || 'error';
        err.statusCode = err.statusCode || 500;

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    });

    const port = customConfig.port;
    app.listen(port, () => {
        console.log(`Server on port: ${port}`);
    });
}

bootstrap()
    .catch((err) => {
        throw err;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
