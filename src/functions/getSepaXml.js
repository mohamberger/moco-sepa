import {getSepaXml} from './lib/moco-api';

export const handler = async (event, context, callback) => {
    try {
        callback(null, {
            statusCode: 200,
            headers: {
                'Content-Disposition': 'attachment;filename=moco-sepa.xml',
                'Content-Type': 'text/xml',
            },
            body: (await getSepaXml()).toString()
        })
    } catch (e) {
        callback(null, {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({error: e})
        })
    }
};