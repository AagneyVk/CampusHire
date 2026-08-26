import test from 'node:test';import assert from 'node:assert/strict';
process.env.NODE_ENV='test';process.env.JWT_SECRET='test-secret';
import app from '../src/app.js';
test('express app is exported',()=>{assert.equal(typeof app,'function');});
test('application contains routing stack',()=>{assert.ok(app.router||app._router);});
