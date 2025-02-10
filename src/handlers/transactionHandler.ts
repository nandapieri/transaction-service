export const handler = async (event: any = {}): Promise<any> => {
    const { httpMethod } = event;

    return {
        statusCode: 200,
        body: JSON.stringify({ message: `successfully invoked with method ${httpMethod}.`, event }),
    };

};