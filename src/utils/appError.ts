export class AppError extends Error {
    code : number;
    statusCode : number;
    status : string | undefined;

    constructor (code = 500, message ?: string) {
        super(message);
        this.status = undefined;
        this.code = code;
        this.statusCode = code;
    }
}