/* eslint-env mocha */
/* global expect*/

const nconf  = require('nconf');
const FbUser = require('../index');

const endpoint = 'https://www.facebook.com/scim/'
const token = 'your token here'

//require('request').debug = true

// ## //

describe('index', function () {
    before(function () {
        nconf.use('memory');
    });

    after(function () {
        nconf.reset();
    });

    describe.only('Tests Init', function() {
        before(function() {
            nconf.reset()
        })
        it('should says me false', function() {
            var res = FbUser.enableIface(nconf.get('facebook:endpoint'),
                                         nconf.get('facebook:token'))
            expect(res).to.be.false
        })
        it('should says me true', function() {
            nconf.set('facebook:endpoint', endpoint);
            nconf.set('facebook:token', token);
            var res = FbUser.enableIface(nconf.get('facebook:endpoint'),
                                         nconf.get('facebook:token'))
            expect(res).to.be.true
        })
    })

    describe('get Users in various ways', function () {
        before(function() {
            nconf.set('facebook:endpoint', endpoint);
            nconf.set('facebook:token', token);
            FbUser.enableIface(nconf.get('facebook:endpoint'),
                               nconf.get('facebook:token'))
        })

        it('get All Users', function() {
            return FbUser.getUsers().then(users => {
                expect(users).to.be.ok
                expect(users).to.be.an('array').that.is.not.empty;
            })
        });
        it('get Me by Username', function() {
            return FbUser.getUserByUsername('adnan.aita@ionisx.com').then(user => {
                expect(user.userName).to.be.equal('adnan.aita@ionisx.com')
            })
        });
        it('Search for unknown User', function() {
            return FbUser.getUserByUsername('adnan.aita@ionisxerror.com').then(user => {
                expect(user).to.be.ko
            })
        })

        it('get Me by Id', function() {
            return FbUser.getUserById('100020299596489').then(user => {
                expect(user.userName).to.be.equal('adnan.aita@ionisx.com')
            })
        })

        it('get Unknown user by Id', function() {
            return FbUser.getUserById('007').then(user => {
                expect(user).to.be.ko
            })
        })
    })

    describe('Create & Update Users', function() {
        before(function() {
            nconf.set('facebook:endpoint', endpoint);
            nconf.set('facebook:token', token);
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
                return user._update()
            })
        })

        it('should try to update Uknown User', function() {
            var user = new FbUser()
            user.id       = 'BadId'
            user.userName = 'adnan.aita+toto@gmail.com'
            user.active   = true
            user.name     = 'Adnan AITA Test'
            user.externalId = 'xxxx'

            return user._update().then((data) => {
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
    describe('End to End Functions', function() {
        before(function() {
            nconf.set('facebook:endpoint', endpoint);
            nconf.set('facebook:token', token);
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
});
