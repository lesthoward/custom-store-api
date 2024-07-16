export class BusinessApi {
    static getThreekitConfigurationById(id: string | number) {
        return fetch(
            // `https://${process.env.CMA_THREEKIT_ENVIRONMENT}.threekit.com/api/configurations/${id}`,
            `https://preview.threekit.com/api/configurations/yrfPSCqXy`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: `Bearer ${process.env.CMA_THREEKIT_PRIVATE_TOKEN}`,
                    Authorization: `Bearer 58efe4ca-f476-4170-8b5b-10b7d1b28677`,
                },
            }
        );
    }
}
