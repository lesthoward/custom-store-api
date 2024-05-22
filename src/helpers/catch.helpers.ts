interface CatchErrorParams {
    details?: { [key: string]: any };
    message: string;
    status?: number;
}

export class CatchError {
    public isError?: boolean;
    public message: string;
    public status?: number;
    public details?: { [key: string]: any };

    constructor({ message, status, details }: CatchErrorParams) {
        this.details = details;
        this.isError = true;
        this.message = message || 'An unexpected error occurred';
        this.status = status;
    }
}
