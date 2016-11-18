/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { assert } from 'chai';
import AxiosMockAdapter from 'axios-mock-adapter';

import Kisi from '../lib/index';

const kisiClient = new Kisi();

const axiosMockAdapter = new AxiosMockAdapter(kisiClient.client);

/* global describe it */
describe('sign up, in and out', () => {
  it('should sign up', (done) => {
    axiosMockAdapter
            .onPost(/users$/)
            .reply(200, {
              email: 'test@kisi.io',
            }, {});

    kisiClient
            .signUp('test@kisi.io', 'test')
            .then((result) => {
              assert.deepEqual(result, { email: 'test@kisi.io' });

              done();
            })
            .catch(error => done(error));
  });

  it('should sign in', (done) => {
    axiosMockAdapter
            .onPost(/logins$/)
            .reply(200, { secret: 'secret' }, {});

    kisiClient
            .signIn('test@kisi.io', 'test')
            .then((result) => {
              assert.deepEqual(result, { secret: 'secret' });
              assert.strictEqual(kisiClient
                    .client
                    .defaults
                    .headers
                    .common['X-Login-Secret'], 'secret');

              done();
            })
            .catch(error => done(error));
  });

  it('should sign out', (done) => {
    axiosMockAdapter
            .onDelete(/login$/)
            .reply(204, null, {});

    kisiClient
            .signOut()
            .then((result) => {
              assert.strictEqual(result, null);
              assert.strictEqual(kisiClient
                    .client
                    .defaults
                    .headers
                    .common['X-Login-Secret'], null);

              done();
            })
            .catch(error => done(error));
  });
});

describe('CRUD', () => {
  it('should get', (done) => {
    axiosMockAdapter
            .onGet(/get$/)
            .reply(200, { id: 1 }, {});

    kisiClient
            .get('get', { id: 1 })
            .then((result) => {
              assert.strictEqual(result.id, 1);

              done();
            })
            .catch(error => done(error));
  });

  it('should get multiple', (done) => {
    axiosMockAdapter
            .onGet(/getMultiple$/)
            .reply(200, [{}], { 'x-collection-range': '0-0/2' });

    kisiClient
            .get('getMultiple')
            .then((result) => {
              assert.deepEqual(result, {
                pagination: {
                  offset: 0,
                  limit: 1,
                  count: 2,
                },
                data: [
                        {},
                ],
              });

              done();
            })
            .catch(error => done(error));
  });

  it('should get empty multiple', (done) => {
    axiosMockAdapter
            .onGet(/getEmptyMultiple$/)
            .reply(200, [], { 'x-collection-range': '*/0' });

    kisiClient
            .get('getEmptyMultiple')
            .then((result) => {
              assert.deepEqual(result, {
                pagination: {
                  offset: 0,
                  limit: 0,
                  count: 0,
                },
                data: [],
              });

              done();
            })
            .catch(error => done(error));
  });

  it('should post', (done) => {
    axiosMockAdapter
            .onGet(/post$/)
            .reply(200, {
              id: 1,
            }, {});

    kisiClient
            .get('post', { id: 1 })
            .then((result) => {
              assert.deepEqual(result, { id: 1 });

              done();
            })
            .catch(error => done(error));
  });

  it('should put', (done) => {
    axiosMockAdapter
            .onGet(/put$/)
            .reply(204, null, {});

    kisiClient
            .get('put', { id: 1 })
            .then((result) => {
              assert.strictEqual(result, null);

              done();
            })
            .catch(error => done(error));
  });

  it('should delete', (done) => {
    axiosMockAdapter
            .onGet(/delete$/)
            .reply(204, null, {});

    kisiClient
            .get('delete')
            .then((result) => {
              assert.strictEqual(result, null);

              done();
            })
            .catch(error => done(error));
  });

  it('should fail', (done) => {
    axiosMockAdapter
            .onGet(/fail$/)
            .reply(401, {
              code: 'abc123',
              error: 'Not authorized',
            }, {});

    kisiClient
            .get('fail')
            .then(() => done(new Error('Should not happen')))
            .catch((error) => {
              assert.strictEqual(error.status, 401);
              assert.strictEqual(error.code, 'abc123');
              assert.strictEqual(error.reason, 'Not authorized');

              done();
            });
  });

  it('should fail without reason', (done) => {
    axiosMockAdapter
            .onGet(/failWithoutReason$/)
            .reply(401, null, {});

    kisiClient
            .get('failWithoutReason')
            .then(() => done(new Error('Should not happen')))
            .catch((error) => {
              assert.strictEqual(error.status, 401);
              assert.strictEqual(error.code, '000000');

              done();
            });
  });
});
