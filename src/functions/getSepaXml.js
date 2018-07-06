import {getSepaXml} from './lib/moco-api';
import crc32 from 'crc-32';

export const handler = injectAuth(async (event, context, callback) => {
    if (context.clientContext && !context.clientContext.user) {
        callback(null, {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({error: "Authorization failed."})
        });
        return;
    }

    try {
        const xml = (await getSepaXml()).toString();

        callback(null, {
            statusCode: 200,
            headers: {
                'Content-Disposition': `attachment;filename=moco-sepa-${crc32.str(xml).toString(16).substr(1)}.xml`,
                'Content-Type': 'text/xml',
            },
            body: xml
        })
    } catch (e) {
        callback(null, {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({error: e.message})
        })
    }
});