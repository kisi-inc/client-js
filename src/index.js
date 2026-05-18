import humps from 'humps';

class KisiError extends Error {
  constructor(status, code = '000000', reason = null) {
    super('An error occurred interacting with the Kisi API.');

    this.status = status;
    this.code = code;
    this.reason = reason;
  }
}

class Kisi {
  constructor(config = {}) {
    this.baseURL = config.baseURL ?? 'https://api.kisi.io';
    this.timeout = config.timeout ?? 5000;
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config.headers
    };
    this.authorization = null;
  }

  setLoginSecret(secret) {
    this.authorization = secret ? `KISI-LOGIN ${secret}` : null;
  }

  async request(method, path, { params, data } = {}) {
    const url = new URL(this.baseURL + path);

    if (params) {
      for (const [k, v] of Object.entries(humps.decamelizeKeys(params))) {
        url.searchParams.set(k, v);
      }
    }

    const headers = { ...this.headers };
    if (this.authorization) headers.Authorization = this.authorization;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let body;
    if (data !== undefined) body = JSON.stringify(humps.decamelizeKeys(data));

    let response;
    try {
      response = await fetch(url.toString(), { method, headers, body, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    let responseData = null;
    const ct = response.headers.get('content-type');
    if (ct && ct.includes('application/json')) {
      responseData = await response.json();
    }

    if (!response.ok) {
      if (responseData) {
        const code = responseData.code || '000000';
        const reason = responseData.error || responseData.errors || code;
        throw new KisiError(response.status, code, reason);
      }
      throw new KisiError(response.status);
    }

    if (responseData !== null) responseData = humps.camelizeKeys(responseData);

    const collectionRange = response.headers.get('x-collection-range');
    if (collectionRange != null) {
      const [rangeStr, countStr] = collectionRange.split('/');
      const count = Number(countStr);
      if (rangeStr === '*') return { pagination: { offset: 0, limit: 0, count }, data: responseData };
      const [start, end] = rangeStr.split('-').map(Number);
      return { pagination: { offset: start, limit: end - start + 1, count }, data: responseData };
    }

    return responseData;
  }

  async get(path, params = {}) {
    return this.request('GET', path, { params });
  }

  async post(path, data = {}) {
    return this.request('POST', path, { data });
  }

  async put(path, data = {}) {
    return this.request('PUT', path, { data });
  }

  async delete(path, params = {}) {
    return this.request('DELETE', path, { params });
  }

  async signUp(email, password) {
    this.setLoginSecret(null);
    return this.post('/users', {
      user: { email, password, termsAndConditions: true }
    });
  }

  async signIn(user) {
    this.setLoginSecret(null);
    const response = await this.post('/logins', {
      login: { type: 'device' },
      user
    });
    this.setLoginSecret(response.secret);
    return response;
  }

  async signOut() {
    const response = await this.delete('/login');
    this.setLoginSecret(null);
    return response;
  }
}

export default Kisi;
