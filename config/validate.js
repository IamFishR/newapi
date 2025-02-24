const Joi = require('joi');
const path = require('path');

// Schema for environment variables
const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3000),
    
    // Database
    DB_HOST: Joi.string().default('localhost'),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').default(''),
    DB_NAME: Joi.string().required(),
    DB_SYNC: Joi.boolean().default(false),
    
    // JWT
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    
    // Session
    SESSION_SECRET: Joi.string().required(),
    
    // Storage
    UPLOAD_DIR: Joi.string().default(path.join(__dirname, '../uploads')),
    MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024), // 5MB

    // Email (optional for now)
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.number().optional(),
    SMTP_USER: Joi.string().optional(),
    SMTP_PASS: Joi.string().optional()
}).unknown();

const validateConfig = () => {
    const { error, value: envVars } = envSchema.validate(process.env);
    
    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }

    return {
        env: envVars.NODE_ENV,
        port: envVars.PORT,
        db: {
            host: envVars.DB_HOST,
            user: envVars.DB_USER,
            password: envVars.DB_PASSWORD,
            name: envVars.DB_NAME,
            sync: envVars.DB_SYNC
        },
        jwt: {
            secret: envVars.JWT_SECRET,
            expiresIn: envVars.JWT_EXPIRES_IN
        },
        session: {
            secret: envVars.SESSION_SECRET
        },
        storage: {
            uploadDir: envVars.UPLOAD_DIR,
            maxFileSize: envVars.MAX_FILE_SIZE
        },
        email: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            user: envVars.SMTP_USER,
            pass: envVars.SMTP_PASS
        }
    };
};

module.exports = validateConfig;