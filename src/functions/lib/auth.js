export const injectAuth = handler => (event, context2, callback) => handler(event, context, (err, res) => {
    console.log("Context 2:", context2);

    if (!context2.clientContext || context2.clientContext.user) {
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