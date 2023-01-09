import { object, string, TypeOf, z } from 'zod';

// - Available roles for users.
enum RoleEnumType {
  ADMIN = 'admin',
  USER = 'user',
}

// - Create a new user schema, which validates all body fields.
export const createUserSchema = object({
    body: object({
        name: string({
            required_error: 'Name is required',
        }),
        email: string({
            required_error: 'Email address is required',
        })
            .email('Invalid email address'),
        password: string({
            required_error: 'Password is required',
        })
            .min(8, 'Password must be more than 8 characters')
            .max(32, 'Password must be less than 32 characters'),
        passwordConfirm: string({
            required_error: 'Please confirm your password',
        }),
        role: z.optional(z.nativeEnum(RoleEnumType)),
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: 'Passwords do not match',
    }),
});

// - Login user schema, which validates all body fields.
export const loginUserSchema = object({
    body: object({
        email: string({
            required_error: 'Email address is required',
        }).email('Invalid email address'),
        password: string({
            required_error: 'Password is required',
        }).min(8, 'Invalid email or password'),
    }),
});

// - search ?
export type CreateUserInput = Omit<
    TypeOf<typeof createUserSchema>['body'],
    'passwordConfirm'
>;
// - search ?
export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
