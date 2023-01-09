import { createClient } from 'redis';
import customConfig from '../config/default';

const redisClient = createClient({
    url: customConfig.redisUrl,
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        redisClient.set(
            'tRPC',
            'Welcome to tRPC with Next.js, Prisma and Typescript!'
        );
        console.log('🚀 Redis client connected...');
    } catch (err: any) {
        console.log(err.message);
        process.exit(1);
    }
};

connectRedis();

redisClient.on('error', (err: any) => console.log(err));

export default redisClient;