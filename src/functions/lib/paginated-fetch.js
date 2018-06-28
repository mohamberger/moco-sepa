import parseLinkHeader from 'parse-link-header';
import fetch from 'node-fetch';

const fetchPaginate = (url, options = {}) => {
    const {
        paginate = true,
        items = data => data,
        merge = (pageData, nextData) => ([...items(pageData), ...nextData]),
        parse = res => res.ok && res.status !== 204 ? res.json() : res.text(),
        until = () => false,
        ...rest
    } = options;

    return fetch(url, rest)
        .then(async res => {
            if (!res.ok) {
                throw new Error(`Server answered with status ${res.status} ${res.statusText}: ${(await res.text()) || "(no body)"}`);
            }

            const pageData = await parse(res);

            if (res.ok && paginate && !until(pageData, res)) {
                if (res.headers) {
                    const link = res.headers.get('link') || res.headers.get('Link');

                    if (link) {
                        const {next} = parseLinkHeader(link) || {};

                        if (next) {
                            const {data: nextData} = await fetchPaginate(next.url, options);

                            return {
                                res,
                                data: merge(pageData, nextData)
                            }
                        }
                    }
                }
            }

            return {
                res,
                data: items(pageData)
            }
        })
};

export default fetchPaginate;