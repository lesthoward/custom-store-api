export class BusinessApi {
    static getThreekitConfigurationById(id: string | number) {
        return fetch(
            `https://${process.env.CMA_THREEKIT_ENVIRONMENT}.threekit.com/api/configurations/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.CMA_THREEKIT_PRIVATE_TOKEN}`,
                },
            }
        );
    }
}
