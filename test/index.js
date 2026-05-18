import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import Kisi from '../src/index.js';

const kisiClient = new Kisi();

function mockFetch(status, body, headers = {}) {
  global.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: name => headers[name] ?? null },
    json: async () => body
  });
}

describe('sign up, in and out', () => {
  it('should sign up', async () => {
    mockFetch(200, { email: 'test@kisi.io' }, { 'content-type': 'application/json' });
    const result = await kisiClient.signUp('test@kisi.io', 'test');
    assert.deepEqual(result, { email: 'test@kisi.io' });
  });

  it('should sign in', async () => {
    mockFetch(200, { secret: 'secret' }, { 'content-type': 'application/json' });
    const result = await kisiClient.signIn({ email: 'test@kisi.io', password: 'test' });
    assert.deepEqual(result, { secret: 'secret' });
    assert.strictEqual(kisiClient.authorization, 'KISI-LOGIN secret');
  });

  it('should sign out', async () => {
    mockFetch(204, null, {});
    const result = await kisiClient.signOut();
    assert.strictEqual(result, null);
    assert.strictEqual(kisiClient.authorization, null);
  });
});

describe('CRUD', () => {
  it('should get', async () => {
    mockFetch(200, { id: 1 }, { 'content-type': 'application/json' });
    const result = await kisiClient.get('get', { id: 1 });
    assert.strictEqual(result.id, 1);
  });

  it('should get multiple', async () => {
    mockFetch(200, [{}], { 'content-type': 'application/json', 'x-collection-range': '0-0/2' });
    const result = await kisiClient.get('getMultiple');
    assert.deepEqual(result, {
      pagination: { offset: 0, limit: 1, count: 2 },
      data: [{}]
    });
  });

  it('should get empty multiple', async () => {
    mockFetch(200, [], { 'content-type': 'application/json', 'x-collection-range': '*/0' });
    const result = await kisiClient.get('getEmptyMultiple');
    assert.deepEqual(result, {
      pagination: { offset: 0, limit: 0, count: 0 },
      data: []
    });
  });

  it('should post', async () => {
    mockFetch(200, { id: 1 }, { 'content-type': 'application/json' });
    const result = await kisiClient.get('post', { id: 1 });
    assert.deepEqual(result, { id: 1 });
  });

  it('should put', async () => {
    mockFetch(204, null, {});
    const result = await kisiClient.get('put', { id: 1 });
    assert.strictEqual(result, null);
  });

  it('should delete', async () => {
    mockFetch(204, null, {});
    const result = await kisiClient.get('delete');
    assert.strictEqual(result, null);
  });

  it('should fail', async () => {
    mockFetch(401, { code: 'abc123', error: 'Not authorized' }, { 'content-type': 'application/json' });
    await assert.rejects(
      () => kisiClient.get('fail'),
      error => {
        assert.strictEqual(error.status, 401);
        assert.strictEqual(error.code, 'abc123');
        assert.strictEqual(error.reason, 'Not authorized');
        return true;
      }
    );
  });

  it('should fail without reason', async () => {
    mockFetch(401, null, {});
    await assert.rejects(
      () => kisiClient.get('failWithoutReason'),
      error => {
        assert.strictEqual(error.status, 401);
        assert.strictEqual(error.code, '000000');
        return true;
      }
    );
  });
});
