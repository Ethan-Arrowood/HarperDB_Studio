'use strict'

const { HarperDBConnect } = require('harperdb-connect');

async function callHarperDB(call_object, operation, callback) {
    const db = new HarperDBConnect();

    const func = this;

    if (callback === undefined) {
        return new Promise(function (resolve, reject) {
            func(call_object, operation, function (err, result) {
                err ? reject(err) : resolve(result);
            });
        });
    }
    
    try {
        db.setAuthorization(call_object.username, call_object.password)
        
        const regex = /^(https?:\/\/)/gm;
        const {endpoint_url, endpoint_port} = call_object;
        const url = regex.test(endpoint_url) ? (
            `${endpoint_url}:${endpoint_port}`
        ) : (
            `http://${endpoint_url}:${endpoint_port}`
        );

        await db.connect(url);

        db.setDefaultOptions({
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            json: true
        });

        let res = await db.request(operation, true);

        return callback(null, res);
    } catch (err) {
        return callback(err, null);
    }
}

module.exports = {
    callHarperDB: callHarperDB
}