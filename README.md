# JWTAuth-learn

The jwtauth-learn repository holds my initial experiments with JWT authentication. My goal is to document my adventures as I learn the basics of the JWT auth paradigm.

JSON Web Token is a proposed Internet standard for creating data with optional signature and/or optional encryption whose payload holds JSON that asserts some number of claims. The tokens are signed either using a private secret or a public/private key.

Tokens, usually referring to JSON Web Tokens (JWTs), are signed credentials encoded into a long string of characters created by the server. The main difference between cookies and tokens is their nature: tokens are stateless while cookies are stateful.

JWTs are a good way of securely transmitting information between parties because they can be signed, which means you can be sure that the senders are who they say they are. Additionally, the structure of a JWT allows you to verify that the content hasn't been tampered with.

## Configuration

1. Install `npm` on your operative system.
2. Install `docker` & `docker-compose` on your operative system.

## Installation

1. Install all dependencies using `npm`.

```sh
$ npm install
```

## Development

### Dev #0 - Docker services locally
First you need to activate a postgresql database, redis cache and other utilitaries. A user should run locally:
    - `adminer`: Database explorer running at `http://localhost:8080/`
    - `postgresql`: PostgreSQL Database running at `http://localhost:6500/` and `http://postgres:5432/` (inside docker private network).
    - `redis`: Redis Cache running at `http://localhost:6379/` and `http://redis:6379/` (inside docker private network).
To activate all services:
    1. Go to local infrastructure folder: `$ cd infrastructure/local`.
    2. Create a `.dev.env` file inside that folder with:
        ```
        DATABASE_PORT=6500
        POSTGRES_PASSWORD=fakePassword987
        POSTGRES_USER=postgres
        POSTGRES_DB=trpc_prisma
        POSTGRES_HOST=postgres
        POSTGRES_HOSTNAME=127.0.0.1
        ```
    3. Run `$ docker-compose up` or `$ docker-compose up -d` for silent mode.

### Dev #1 - Node backend

#### Dev #1.1 - Database seed
To migrate the current schema into our database, please run the commands bellow:

```sh
$ npm run db:migrate
$ npm run db:push
```

#### Dev #1.2 - Run backend
To activate backend you should run:

```sh
$ npm run start
```

## Bibliography
- Guide #0: [link](https://codevoweb.com/node-prisma-postgresql-access-refresh-tokens/)
- Guide #1 - EMAIL VERIFICATION: [link](https://codevoweb.com/crud-api-node-js-and-postgresql-send-html-emails/)
- Guide #2 - RESET PASSWORD: [link](https://codevoweb.com/crud-api-node-prisma-postgresql-reset-password/)
- JWT Short-comings: [link](https://redis.com/blog/json-web-tokens-jwt-are-dangerous-for-user-sessions/)
- 
