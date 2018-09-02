"use strict";

const { HarperDBConnect } = require("harperdb-connect");

async function callHarperDB(call_object, operation, unsupported_callback) {
  // remove this code block on completion of #32
  if (unsupported_callback) {
    try {
      throw new Error("Do not use a callback with callHarperDB");
    } catch (err) {
      console.warn(
        "callHarperDB removed support for callbacks. Update the following method(s) to use .then and .catch blocks."
      );
      console.error(err);
    }
  }
  const db = new HarperDBConnect();

  try {
    db.setAuthorization(call_object.username, call_object.password);

    const regex = /^(https?:\/\/)/gm;
    const { endpoint_url, endpoint_port } = call_object;
    const url = regex.test(endpoint_url)
      ? `${endpoint_url}:${endpoint_port}`
      : `http://${endpoint_url}:${endpoint_port}`;

    await db.connect(url);

    db.setDefaultOptions({
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cache-control": "no-cache"
      },
      json: true
    });

    let res = await db.request(operation, true);

    return res;
  } catch (err) {
    return err;
  }
}

module.exports = {
  callHarperDB: callHarperDB
};
