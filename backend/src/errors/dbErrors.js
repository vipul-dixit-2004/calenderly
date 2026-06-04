import { AppError } from './AppError.js';

export function mapDbError(err) {
    const code = err.code || err.constraint_name;

    switch (code) {
        // unique_violation
        case '23505': {
            // Parse the constraint name to give a useful message
            const detail = err.detail || '';
            if (detail.includes('email')) return new AppError('That email is already in use', 409);
            if (detail.includes('username')) return new AppError('That username is already taken', 409);
            return new AppError('A record with these details already exists', 409);
        }

        // foreign_key_violation
        case '23503':
            return new AppError('Related resource not found', 400);

        // not_null_violation
        case '23502':
            return new AppError(`Missing required field: ${err.column}`, 400);

        // check_violation
        case '23514':
            return new AppError('Data validation failed', 400);

        // invalid_text_representation (bad UUID etc.)
        case '22P02':
            return new AppError('Invalid ID format', 400);

        // connection / timeout
        case '08006':
        case '08001':
        case '08004':
            return new AppError('Database connection error — please try again', 503);

        default:
            return null; // not a recognised DB error
    }
}
