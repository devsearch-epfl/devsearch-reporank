var crawler = require("./crawler.js");
var fs = require('fs');

var PATH_TO_DUMP = "./stardump"

var starForUsers = function(users)
{
    users.forEach(function (user) {

        crawler.stars(user['login'], function (data) {

            fs.appendFileSync(PATH_TO_DUMP, [ user['id'], user['login'] ].concat(data.map(function(e){return e['id']})).join(',') + "\n")
            console.log("user " + user['login'] + " wrote to dump")
        })
    })
}

var nextUsers = function()
{
    crawler.users(function(obj)
    {
        starForUsers(obj)
        setTimeout(nextUsers, 5 * 1000)
    });
}

nextUsers();
