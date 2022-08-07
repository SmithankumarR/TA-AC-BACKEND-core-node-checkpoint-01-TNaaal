var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var usersPath = __dirname + '/contacts/';

var server = http.createServer(handleRequest);

function handleRequest(req, res) {

    var ParsedUrl = url.parse(req.url);
    var pathName = ParsedUrl.pathname;
    var store = '';
    req.on('data', (chunk) => {
        store = store + chunk;
    })

    if (req.method === 'GET' && pathName === '/') {
        fs.createReadStream('./index.html').pipe(res);

    } else if (req.method === 'GET' && pathName === '/about') {
        fs.createReadStream('./about.html').pipe(res);
    } else if (req.method === 'GET' && pathName === '/contacts') {
        req.on('end', () => {

            var formData = qs.parse(store);
            res.setHeader('Content-Type', 'text/html');
            res.write(`<h1> Name : ${formData.name} </h1>`);
            res.write(`<h3>Email : ${formData.email} </h3>`);
            res.write(`<h4>Username : ${formData.username} </h4>`);
            res.write(`<h4>Age : ${formData.age} </h4>`);
            res.write(`<h5>Bio : ${formData.bio} </h5>`);
            res.end();
        })

    }
    else if (req.url === '/users' && req.method === 'POST') {
        req.on('end', () => {
            var username = JSON.parse(store).username;

            fs.open(usersPath + username + '.json', 'wx', (err, fd) => {
                if (err) throw err;
                fs.writeFile(fd, store, (err) => {
                    if (err) return console.log(`username taken`);
                    fs.close(fd, () => {
                        return res.end(`contacts saved `);
                    });
                })
            })

        })
    } else if (pathName === '/users' && req.method === 'GET') {
        req.on('end', () => {
            var username = JSON.parse(store).username;

            fs.readFile(usersPath + username + '.json', (err, content) => {
                if (err) return console.log(err);
                res.setHeader('Content-Type', 'application/json');
                return res.end(content);
            })

        })
    }

    else {
        res.setHeader('Content-Type', 'text/html');
        res.end('Page not found!');
    }
}

server.listen(5000, () => {
    console.log('listening on port 5000');
})