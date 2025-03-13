class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.details = [];
    }

    addError(field, message) {
        this.details.push({ field, message });
    }
}

module.exports = ValidationError;