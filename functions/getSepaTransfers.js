import { getSepaTransfers } from './lib/moco-api';

const injectReplyJson = handler => (event, context, callback) => handler(event, context, (code, body) => callback(null, {
    statusCode: code,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
}));

export const handler = injectReplyJson(async (event, context, reply) => {
    try {
        const transfers = await getSepaTransfers();
        reply(200, transfers);
    } catch(e) {
        reply(500, { error: e });
    }
});