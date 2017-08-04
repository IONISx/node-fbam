var chai         = require('chai');
var chaiDatetime = require('chai-datetime');
var asPromised   = require('chai-as-promised');
var chaiThings   = require('chai-things');
var chaid        = require('chaid');
var sinon        = require('sinon');
var sinonChai    = require('sinon-chai');
var nock         = require('nock');

// ## //

chai.use(chaiDatetime);
chai.use(asPromised);
chai.use(chaiThings);
chai.use(chaid);
chai.use(sinonChai);

global.expect = chai.expect;
global.spy    = sinon.spy;
global.stub   = sinon.stub;
global.nock   = nock;
