import test from 'node:test';import assert from 'node:assert/strict';import {route} from '../src/app.js';
test('health route',()=>assert.deepEqual(route('GET','/health'),{status:200,body:{ok:true}}));
