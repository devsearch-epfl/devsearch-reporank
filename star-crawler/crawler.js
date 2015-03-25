
var GITHUB_API_HOST = "api.github.com"


var https = require('https');
var parse = require('parse-link-header')

/**
 * Returns the json from an API call with suffix
 * callback function is called with the parsed JSON as the only argument
 *
 * @param {string} suffix
 * @param {function} callback
 */
var apiRequest = function (suffix, callback)
{
    var options = {
        host: GITHUB_API_HOST,
        path: suffix,
        headers: {'user-agent': 'node.js'/*'Mozilla/5.0'*/}
    };

    https.get(options, function (response) {

        var buffer = "";
        var headers = response.headers;

        console.log(headers);

        response.on("data", function (data) {
            buffer += data;
        });

        response.on("end", function (err) {
            var parsed = JSON.parse(buffer);
            callback(parsed);
        });
    })
};

/**
 * Extract a list with all users from the api
 * users are returned by github IDs
 *
 * @param  {function} callback
 */
var users = function(callback)
{
    var extractUser = function(obj)
    {
        return {
            id: obj.id,
            login: obj.login
        }
    };

    var extractUsers = function(objs)
    {
        return objs.map(extractUser)
    };

    apiRequest("/users", function (objs) {
        callback(extractUsers(objs))
    })
};

module.exports = {

    /**
     * Extract a list with all users from the api
     * users are returned by github IDs
     *
     * @param  {function} callback
     */
    users: users,

    /**
     * Returns the repos starred by a user
     * repos are returned by github IDs
     *
     *  @param {string} user
     *  @return {string[]}
     */
    stars: function (user)
    {
        return []
    },

    /**
     * Returns a list of users and the repos they star
     * return object is a mat from userID to list of repoIDs
     *
     * @return {object}
     */
    globalStars: function ()
    {
        return {}
    }

};