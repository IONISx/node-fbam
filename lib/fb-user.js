var fbInterface = require('./facebookInterface')

var iface

const schemas = [
    'urn:scim:schemas:core:1.0',
    'urn:scim:schemas:extension:enterprise:1.0',
    'urn:scim:schemas:extension:facebook:starttermdates:1.0',
    'urn:scim:schemas:extension:facebook:accountstatusdetails:1.0'
]

const metadata = [
    // Basic Data (urn:scim:schemas:core:1.0)
    { 'fbid': 'userName',          'id': 'userName',       'required' : true},
    { 'fbid': 'displayName',       'id': 'displayName'},
    { 'fbid': 'title',             'id': 'title'},
    { 'fbid': 'nickName',          'id': 'nickName'},
    { 'fbid': 'profileUrl',        'id': 'profileUrl'},
    { 'fbid': 'preferredLanguage', 'id': 'preferredLanguage'},
    { 'fbid': 'locale',            'id': 'locale'},
    { 'fbid': 'timezone',          'id': 'timezone'},
    { 'fbid': 'active',            'id': 'active',       'required' : true},
    { 'fbid': 'userType',          'id': 'userType'},
    { 'fbid': 'photos',            'id': 'phtos'},
    { 'fbid': 'emails',            'id': 'emails'},
    { 'fbid': 'phoneNumbers',      'id': 'phoneNumbers'},
    { 'fbid': 'ims',               'id': 'ims'},
    { 'fbid': 'roles',             'id': 'roles'},
    { 'fbid': 'entitlements',      'id': 'entitlements'},
    { 'fbid': 'addresses',         'id': 'addresses'},
    { 'fbid': 'x509Certificates',  'id': 'certificates'},
    { 'fbid': 'schemas',           'id': 'schemas'},
    { 'fbid': 'id',                'id': 'id'},
    { 'fbid': 'externalId',        'id': 'externalId'},
    // Name Structure
    { 'fbid': 'name',
        'required' : true,
        'structure': [
          {'fbid': 'formatted' , 'id': 'name',       'required' : true},
          {'fbid': 'familyName', 'id': 'lastName'},
          {'fbid': 'givenName' , 'id': 'firstName'},
          {'fbid': 'middleName', 'id': 'middleName'},
        // MiddleName & Honorary is not managed
        ]
    },
    { 'fbid': 'urn:scim:schemas:extension:facebook:starttermdates:1.0', 'structure': [
      {'fbid': 'startDate', 'id': 'startDate'},
      {'fbid': 'termDate', 'id': 'termDate'}
    ]},
    { 'fbid': 'urn:scim:schemas:extension:enterprise:1.0', 'structure': [
      {'fbid': 'employeeNumber', 'id': 'employeeNumber'},
      {'fbid': 'costCenter', 'id': 'costCenter'},
      {'fbid': 'organization', 'id': 'organization'},
      {'fbid': 'division', 'id': 'division'},
      {'fbid': 'department', 'id': 'department'},
      {'fbid': 'manager', 'id': 'manager'}
    ]},
    { 'fbid': 'urn:scim:schemas:extension:facebook:accountstatusdetails:1.0', 'structure': [
      {'fbid': 'invited', 'id': 'invited'},
      {'fbid': 'claimed', 'id': 'claimed'},
      {'fbid': 'invitedDate', 'id': 'invitedDate'},
      {'fbid': 'claimedDate', 'id': 'claimedDate'},
      {'fbid': 'claimLink', 'id': 'claimLink'}
    ]}
]

class FbUser {

    // Construct an Item assuming data is coming from Facebook
    constructor(user) {
        var self = this
        if (typeof user === 'undefined') {
            return this
        }
        metadata.forEach(function(entry) {
            if (typeof user[entry.fbid] !== 'undefined') {
                if (entry.structure) {
                    entry.structure.forEach(function(subentry) {
                        if (typeof user[entry.fbid][subentry.fbid] !== 'undefined') {
                            self[subentry.id] = user[entry.fbid][subentry.fbid]
                        }
                    })
                }
                else {
                    self[entry.id] = user[entry.fbid]
                }
            }
        })
    }

    static enableIface(endpoint, token) {
        if (endpoint && token) {
            iface = new fbInterface(endpoint, token)
            return true
        }
        else {
            return false
        }
    }

    // Lookup in FB and return a fbUser
    static getUserByUsername(username) {
        return iface.searchUsers({'filter': 'userName eq "' + username + '"'}).then(data => {
            if (data.totalResults === 1) {
                return new FbUser(data.Resources[0])
            }
            return null
        }).catch(function () {
            return null
        })
    }

    /* Lookup by External ID is not supported by Facebook API Yet */
    // TODO: Might have to test that by including schema
    /*********************************************************************
    static getUserByExternalId(externalId) {
        return iface.searchUsers({'filter': 'externalId eq "' + externalId + '"'}).then(data => {
            if (data.totalResults === 1) {
                return new FbUser(data.Resources[0])
            }
            return null
        }).catch(function (err) {
            console.log(err)
            return null
        })
    }
    *********************************************************************/

    // Lookup in FB and return a fbUser
    static getUserById(id) {
        return iface.getUser(id).then(data => {
            return new FbUser(data)
        }).catch(function () {
            return null
        })
    }

    // Get All Users
    static getUsers() {
        return iface.searchUsers().then(data => {
            var users = []
            data.Resources.map(function(user) {
                users.push(new FbUser(user))
            })
            return users
        }).catch(function () {
            return []
        })
    }

    // Update User in Facebook
    save() {
        if (this.id) {
            return this.update()
        }
        else {
            return this.constructor.getUserByUsername(this.userName)
            .then(user => {
                if (user) {
                    this.id = user.id
                    return this.update()
                }
                return this._create()
            })
        }
    }

    _inactivateUser() {
        this.active = false
        return this.update()
    }

    // Delete the User in facebook. Since Claimed user cannot be deleted, Inactivate the user Instead.
    delete() {
        if (this.claimed === false) {
            return iface.deleteUser(this.ToFacebook())
            .then(data => {
                return data
            })
            .catch(function() {
                return false
            })
        }
        else {
            return this._inactivateUser()
        }
    }

    // Update the User in Facebook
    update() {
        return iface.updateUser(this.ToFacebook())
        .then(data => {
            return data
        })
        .catch(function() {
            return false
        })
    }
    // Create the User in Facebook
    _create() {
        //TODO : Check Required Fields
        return iface.createUser(this.ToFacebook())
        .then(data => {
            return data
        })
        .catch(function() {
            return null
        })
    }

    ToFacebook() {
        var self = this
        var user = {}
        metadata.forEach(function(entry) {
            if (entry.structure) {
                entry.structure.forEach(function(subentry) {
                    if (typeof self[subentry.id] !== 'undefined') {
                        if (typeof user[entry.fbid] === 'undefined') {
                            user[entry.fbid] = {}
                        }
                        user[entry.fbid][subentry.fbid] = self[subentry.id]
                    }
                })
            }
            else {
                if (typeof self[entry.id] !== 'undefined') {
                    user[entry.fbid] = self[entry.id]
                }
            }
        })
        if (!user.schemas) {
            user.schemas = schemas
        }
        return user
    }
}

module.exports = FbUser;
