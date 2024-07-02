interface CatchErrorParams {
    details?: { [key: string]: any };
    isError?: boolean;
    message: string;
    status?: number;
}

export class RequestResponse {
    public isError?: boolean;
    public message: string;
    public status?: number;
    public details?: { [key: string]: any };

    constructor({
        details,
        isError = true,
        message,
        status,
    }: CatchErrorParams) {
        this.details = details;
        this.isError = isError;
        this.message = message || 'An unexpected error occurred';
        this.status = status;
    }
}
