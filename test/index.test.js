/* eslint-env mocha */
/* global expect*/

const nconf  = require('nconf');
const FbUser = require('../lib/fb-user');

//require('request').debug = true

// ## //

describe('index', function () {
    before(function () {
        nconf.use('memory');
        nconf.set('facebook:endpoint', 'https://www.facebook.com/scim/');
        nconf.set('facebook:token', 'Set your token here');
    });

    after(function () {
        nconf.reset();
    });

    describe('get Users in various ways', function () {
        before(function() {
            FbUser.enableIface(nconf.get('facebook:endpoint'),
                               nconf.get('facebook:token'))
        })

        it('get All Users', function() {
            FbUser.getUsers().then(users => {
                expect(users).to.be.ok
            })
        });
        it('get Me by Username', function() {
            FbUser.getUserByUsername('adnan.aita@ionisx.com').then(user => {
                expect(user.userName).to.be.equal('adnan.aita@ionisx.com')
            })
        });
        it('Search for unknown User', function() {
            FbUser.getUserByUsername('adnan.aita@ionisxerror.com').then(user => {
                expect(user).to.be.ko
            })
        })

        it('get Me by Id', function() {
            FbUser.getUserById('100020299596489').then(user => {
                expect(user.userName).to.be.equal('adnan.aita@ionisx.com')
            })
        })

        it('get Unknown user by Id', function() {
            FbUser.getUserById('007').then(user => {
                expect(user).to.be.ko
            })
        })
    })

    describe('Create & Update Users', function() {
        before(function() {
            FbUser.enableIface(nconf.get('facebook:endpoint'),
                               nconf.get('facebook:token'))
        })

        it('should create an user', function() {
            var user = new FbUser()
            user.userName = 'adnan.aita+test@gmail.com'
            user.active   = true
            user.name     = 'Adnan AITA Test'
            user.externalId = 'xxxx'

            return user._create()
            .then(data => {
                expect(data).to.be.ok
            })
        })

        it('should try to create an already existing user', function() {
            var user = new FbUser()
            user.userName = 'adnan.aita+test@gmail.com'
            user.active   = true
            user.name     = 'Adnan AITA Test'
            user.externalId = 'xxxx'

            return user._create().then(data => {
                expect(data).to.be.equal(null)
            })
        })

        it('should update user and change external Id', function() {
            return FbUser.getUserByUsername('adnan.aita+test@gmail.com')
            .then(user => {
                expect(user).to.not.be.equal(null)
                expect(user.userName).to.be.equal('adnan.aita+test@gmail.com')
                user.externalId = 'xxxIDxxx'
                return user.update()
            })
        })

        it('should try to update Uknown User', function() {
            var user = new FbUser()
            user.id       = 'BadId'
            user.userName = 'adnan.aita+toto@gmail.com'
            user.active   = true
            user.name     = 'Adnan AITA Test'
            user.externalId = 'xxxx'

            return user.update().then((data) => {
                expect(data).to.be.false
            })
        })

        it('User should have a new ExternalId', function() {
            return FbUser.getUserByUsername('adnan.aita+test@gmail.com').then(user => {
                expect(user.externalId).to.be.equal('xxxIDxxx')
            })
        });

        it('should delete an user', function() {
            return FbUser.getUserByUsername('adnan.aita+test@gmail.com')
            .then(user => {
                expect(user).to.not.be.equal(null)
                expect(user.userName).to.be.equal('adnan.aita+test@gmail.com')
                return user.delete()
            })
            .then(data => {
                expect(data).to.be.true
            })
            .catch(function() {
                expect(false, 'Deletion of user Failed').to.be.ok
            })
        })
    })
    describe.only('End to End Functions', function() {
        before(function() {
            FbUser.enableIface(nconf.get('facebook:endpoint'),
                               nconf.get('facebook:token'))
        })
        it('should create an user', function() {
            var user = new FbUser()
            user.userName = 'adnan.aita+test@gmail.com'
            user.active   = true
            user.name     = 'Adnan AITA Test'
            user.externalId = 'xxxx'

            return user.save()
            .then(data => {
                expect(data).to.be.ok
            })
        })

        it('should update an user', function() {
            var user = new FbUser()
            user.userName = 'adnan.aita+test@gmail.com'
            user.active   = true
            user.name     = 'Adnan AITA Test'
            user.externalId = 'ZZzzZZ'

            return user.save()
            .then(data => {
                expect(data).to.be.ok
            })
            .then(() => {
                return FbUser.getUserByUsername('adnan.aita+test@gmail.com').then(user => {
                    expect(user.externalId).to.be.equal('ZZzzZZ')
                })
            })
        })
    })
});
