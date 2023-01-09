import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { CookieOptions, NextFunction, Request, Response } from 'express';
import { 
    CreateUserInput, 
    LoginUserInput
} from '../schemas/user.schema';
import {
  createUser,
  findUniqueUser,
  signTokens
} from '../services/user.service';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError';
import { signJwt, verifyJwt } from '../utils/jwt';

import customConfig from '../config/default';
import redisClient from '../utils/redis';


const cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
};
if (customConfig.env === 'production') cookiesOptions.secure = true;


const accessTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(
      Date.now() + customConfig.accessTokenExpiresIn * 60 * 1000
    ),
    maxAge: customConfig.accessTokenExpiresIn * 60 * 1000,
};


const refreshTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(
      Date.now() + customConfig.refreshTokenExpiresIn * 60 * 1000
    ),
    maxAge: customConfig.refreshTokenExpiresIn * 60 * 1000,
};


export const registerUserHandler = async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const hashedPassword = await bcrypt.hash(
            req.body.password, customConfig.salt
        );
  
        const verifyCode = crypto.randomBytes(32).toString('hex');
        const verificationCode = crypto
            .createHash('sha256')
            .update(verifyCode)
            .digest('hex');
  
        const user = await createUser({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: hashedPassword,
            verificationCode,
        });
  
        res.status(201).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Email already exist, please use another email address',
                });
            }
        }
        next(err);
    }
};


export const loginUserHandler = async (
    req: Request<{}, {}, LoginUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
  
        const user = await findUniqueUser(
            { email: email.toLowerCase() },
            { id: true, email: true, verified: true, password: true }
        );
  
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError(400, 'Invalid email or password'));
        }
  
        // Sign Tokens
        const { access_token, refresh_token } = await signTokens(user);
        res.cookie('access_token', access_token, accessTokenCookieOptions);
        res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
        res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false,
        });
  
        res.status(200).json({
            status: 'success',
            access_token,
        });
    } catch (err: any) {
        next(err);
    }
};


export const refreshAccessTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refresh_token = req.cookies.refresh_token;

        const message = 'Could not refresh access token';

        if (!refresh_token) {
            return next(new AppError(403, message));
        }

        // Validate refresh token
        const decoded = verifyJwt<{ sub: string }>(
            refresh_token,
            'refreshTokenPublicKey'
        );

        if (!decoded) {
            return next(new AppError(403, message));
        }

        // Check if user has a valid session
        const session = await redisClient.get(decoded.sub);

        if (!session) {
            return next(new AppError(403, message));
        }

        // Check if user still exist
        const user = await findUniqueUser({ id: JSON.parse(session).id });

        if (!user) {
            return next(new AppError(403, message));
        }

        // Sign new access token
        const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
            expiresIn: `${customConfig.accessTokenExpiresIn}m`,
        });

        // 4. Add Cookies
        res.cookie('access_token', access_token, accessTokenCookieOptions);
        res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false,
        });

        // 5. Send response
        res.status(200).json({
            status: 'success',
            access_token,
        });
    } catch (err: any) {
        next(err);
    }
};

export const logoutUserHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
        await redisClient.del(res.locals.user.id);
        res.cookie('access_token', '', { maxAge: -1 });
        res.cookie('refresh_token', '', { maxAge: -1 });
        res.cookie('logged_in', '', { maxAge: -1 });
  
        res.status(200).json({
            status: 'success',
        });
    } catch (err: any) {
        next(err);
    }
};
