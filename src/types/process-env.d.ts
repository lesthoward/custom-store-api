declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined;

            PORT: string;
            THREEKIT_ORG_ID: string;
            THREEKIT_PRIVATE_TOKEN: string;
        }
    }
}

export {};
