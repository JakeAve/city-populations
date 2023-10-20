export class InternalServerError extends Error {
    constructor(errors = []) {
        super('Internal server error')
        this.status = 500;
        this.errors = errors;
    }
}