# node-fbam

> Facebook Account Management API

# What For ?

This component is use to provision, edit, get and delete users via API for facebook workplace

# Development

You need to have [Yarn](https://yarnpkg.com) installed.

# How to use

## Initialize the component
Provide endpoint and access token to initialize the component
```js
FbUser.enableIface('endpoint', 'token')
```

## Methods

### Search for users

* FbUser.getUsers() : Will fetch all users
* FbUser.getUserByUsername('test@gmail.com') : will fetch the user if exists
* FbUser.getUserById(12312312332) : will fetch the user if exists

## Updating user
* FbUser.save()

## Deleting/Inactivating user
* FbUser.delete()

# Testing

Install `gulp`:

```shell
$ yarn global add gulp-cli
```

Then install the local dependencies:

```shell
$ yarn install
```

Finally, assess code quality and run unit tests using `gulp`:

```shell
$ gulp test
```

It is also possible to run specific tests using `mocha`:

```shell
$ mocha test/whatever.test.js
```
