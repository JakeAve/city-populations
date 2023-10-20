export class BadRequest extends Error {
    constructor(errors = []) {
        super('Bad request')
        this.status = 400;
        this.errors = errors;
    }
}