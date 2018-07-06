export const injectAuth = handler => (event, context, callback) => handler(event, context, (err, res) => {
    console.log(context);

    if (!context.clientContext || context.clientContext.user) {
        callback(err, res);
    } else {
        callback(null, {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: "Authorization failed."
            })
        })
    }
});