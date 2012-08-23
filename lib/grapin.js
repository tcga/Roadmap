(function (exports) {
    "use strict";

    var request;

 // @param {string} options
 // @param {object} options
 // @param {string} options.uri
 // @param {string} options.method
 // @param {object} options.headers
 // @param {boolean} options.parseBody Parse body according to Content-Type (currently supported: JSON).
 // @param {(err, res)} callback
 // @param {string} callback.res.body
 // @param {number} callback.res.statusCode
 // @param {object} callback.res.headers
    exports.request = request = function (options, callback) {
        var xhr;
        if (typeof options === "string") {
         // Convert string argument to options object.
            options = {
                uri: options
            };
        } else {
            options = (typeof options === "object" && options !== null) ? options : {};
            if (options.hasOwnProperty("uri") === false || typeof options.uri !== "string") {
                throw new Error("Please provide a uri or an options.uri parameter (string).");
            }
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
     // Set default options.
        options.headers = (typeof options.headers === "object" && options.headers !== null) ? options.headers : {};
        options.parseBody = (typeof options.parseBody === "boolean") ? options.parseBody : false;
     // Create client.
        xhr = new XMLHttpRequest();
        xhr.open("GET", options.uri);
        Object.keys(options.headers).forEach(function (header) {
            xhr.setRequestHeader(header, options.headers[header]);
        });
        xhr.onload = function () {
            var headers, response, body, contentType;
            headers = {};
         // Parse response headers.
            xhr.getAllResponseHeaders().split("\n").forEach(function (line) {
                var fieldName;
             // Skip empty lines.
                if (line !== "") {
                    var matcher = line.match(/([-A-Za-z]+?): *(.*) */);
                 // Convert field names to lowercase.
                    fieldName = matcher[1].toLowerCase();
                    headers[fieldName] = matcher[2];
                }
            });
            response = {
                // At some point I want to be able to tell the user that nothing has changed. Related:
                // "For 304 Not Modified responses that are a result of a user agent generated conditional
                // request the user agent must act as if the server gave a 200 OK response with the appropriate
                // content. The user agent must allow author request headers to override automatic cache
                // validation (e.g. If-None-Match or If-Modified-Since), in which case 304 Not Modified responses
                // must be passed through."
                statusCode: xhr.status,
                headers: headers
            };
            if (xhr.status < 200 || xhr.status >= 300) {
                callback({
                    name: "Error",
                    message: "Status Code: " + xhr.status
                }, null);
            } else {
                if (options.parseBody === false) {
                    body = xhr.responseText;
                } else {
                 // Ignore media type options.
                    contentType = xhr.getResponseHeader("Content-Type").split(";")[0];
                    switch (contentType) {
                        case "application/json":
                        case "application/sparql-results+json":
                            try {
                                body = JSON.parse(xhr.responseText);
                            } catch (err) {
                                callback(err, null);
                                return;
                            }
                            break;
                        case "application/xml":
                        case "text/xml":
                            body = xhr.responseXML;
                            break;
                        default:
                            body = xhr.responseText;
                            break;
                    }
                }
                response.body = body;
                callback(null, response);
            }
        };
        xhr.onerror = function () {
            callback({
                name: "Error",
                message: "Getting the URI failed. The browser log might have more details."
            }, null);
        };
        xhr.send(null);
    };

}(this.grapin = {}));
