var request = require('request')

class FacebookInterface {
    constructor(endpoint, token) {
        this.endpoint = endpoint;
        this.token = token;
    }

    _send(options) {
        return new Promise((resolve, reject) => {
            request(options, function(err, res) {
                if (err) {
                    reject('Unable to retrieve API', err)
                }
                switch (options.method) {
                    case 'PUT':
                    case 'GET':
                        return res.statusCode === 200 ? resolve(JSON.parse(res.body)) : reject('Bad API Response', err)
                        break;
                    case 'DELETE':
                        return res.statusCode === 200 ? resolve(true) : reject('Bad API Response', err)
                        break;
                    case 'POST':
                        return res.statusCode === 201 ?
                            resolve(JSON.parse(res.body)) :
                            reject(JSON.parse(res.body).Errors[0].description)
                        break;
                    default:
                        console.log('Unknown request')
                        reject('Uknown request type: ' + options.method, err)
                }
            })
        })
    }

    updateUser(data) {
        if (!data.id) {
            return null
        }
        var options = {
            method: 'PUT',
            baseUrl: this.endpoint,
            url: '/v1/Users/' + data.id,
            headers: {
                'User-Agent': 'portal',
                'Content-Type': 'application/json-rpc'
            },
            body: JSON.stringify(data),
            auth: { 'bearer': this.token}
        }
        return this._send(options)
    }

    createUser(data) {
        var options = {
            method: 'POST',
            baseUrl: this.endpoint,
            url: '/v1/Users',
            headers: {
                'User-Agent': 'portal',
                'Content-Type': 'application/json-rpc'
            },
            body: JSON.stringify(data),
            auth: { 'bearer': this.token}
        }
        return this._send(options)
    }

    deleteUser(data) {
        if (!data.id) {
            return null
        }
        var options = {
            method: 'DELETE',
            baseUrl: this.endpoint,
            url: '/v1/Users/' + data.id,
            headers: {
                'User-Agent': 'portal',
            },
            auth: { 'bearer': this.token}
        }
        return this._send(options)
    }

    getUser(id) {
        var options = {
            method: 'GET',
            baseUrl: this.endpoint,
            url: '/v1/Users/' + id,
            headers: {
                'User-Agent': 'portal'
            },
            auth: { 'bearer': this.token }
        };
        return this._send(options)
    }

    searchUsers(filter) {
        var options = {
            method: 'GET',
            baseUrl: this.endpoint,
            url: '/v1/Users',
            qs: filter,
            headers: {
                'User-Agent': 'portal'
            },
            auth: { 'bearer': this.token }
        };
        return this._send(options)
    }
}

module.exports = FacebookInterface;
