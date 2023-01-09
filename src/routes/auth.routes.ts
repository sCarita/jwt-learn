import express from 'express';
// - controllers
import {
  loginUserHandler,
  logoutUserHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
} from '../controllers/auth.controller';
// - schemas
import { 
    loginUserSchema, 
    createUserSchema
} from '../schemas/user.schema';
// - middlewares
import { 
    deserializeUser
} from '../middleware/deserializeUser';
import { 
    requireUser
} from '../middleware/requireUser';
import { 
    validate
} from '../middleware/validate';

const router = express.Router();

router.post(
    '/register', 
    validate(createUserSchema), 
    registerUserHandler
);

router.post(
    '/login', 
    validate(loginUserSchema), 
    loginUserHandler
);

router.get(
    '/refresh', 
    refreshAccessTokenHandler
);

router.get(
    '/logout', 
    deserializeUser, 
    requireUser, 
    logoutUserHandler
);

export default router;