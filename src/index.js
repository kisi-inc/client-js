import axios from 'axios';
import 'regenerator-runtime/runtime';
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
    const mergedConfig = {
      baseURL: 'https://api.getkisi.com/',
      timeout: 5000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      ...config
    };

    this.client = axios.create(mergedConfig);

    this.addDecamelizationRequestInterceptor();
    this.addCamelizationResponseInterceptor();
    this.addPaginationResponseInterceptor();
  }

  addDecamelizationRequestInterceptor() {
    this.client.interceptors.request.use(config => {
      const newConfig = config;

      newConfig.data = humps.decamelizeKeys(config.data);
      newConfig.params = humps.decamelizeKeys(config.params);

      return newConfig;
    });
  }

  addCamelizationResponseInterceptor() {
    this.client.interceptors.response.use(response => {
      const newResponse = response;

      newResponse.data = humps.camelizeKeys(response.data);

      return response;
    });
  }

  addPaginationResponseInterceptor() {
    this.client.interceptors.response.use(response => {
      const newResponse = response;

      const { headers } = response;
      const collectionRange = headers['x-collection-range'];

      if (collectionRange !== undefined) {
        const rangeAndCount = collectionRange.split('/');

        const collectionCount = Number(rangeAndCount[1]);

        if (rangeAndCount[0] === '*') {
          newResponse.data = {
            pagination: {
              offset: 0,
              limit: 0,
              count: collectionCount
            },
            data: response.data
          };

          return response;
        }

        const rangeStartAndEnd = rangeAndCount[0].split('-');
        const collectionStart = Number(rangeStartAndEnd[0]);
        const collectionEnd = Number(rangeStartAndEnd[1]);
        const collectionLimit = collectionEnd - collectionStart + 1;

        newResponse.data = {
          pagination: {
            offset: collectionStart,
            limit: collectionLimit,
            count: collectionCount
          },
          data: response.data
        };
      }

      return response;
    });
  }

  setLoginSecret(secret) {
    this.client.defaults.headers.common['X-Login-Secret'] = secret;
  }

  async signUp(email, password) {
    this.setLoginSecret(null);

    try {
      const response = await this.post('users', {
        user: { email, password, termsAndConditions: true }
      });

      return response;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  async signIn(email, password) {
    this.setLoginSecret(null);

    try {
      const response = await this.post('logins', {
        login: { type: 'device' },
        user: { email, password }
      });

      this.setLoginSecret(response.secret);

      return response;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  async signOut() {
    try {
      const response = await this.delete('login');

      this.setLoginSecret(null);

      return response;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  async get(path, params = {}) {
    try {
      const response = await this.client.get(path, { params });

      return response.data;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  async post(path, data = {}) {
    try {
      const response = await this.client.post(path, data);

      return response.data;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  async put(path, data = {}) {
    try {
      const response = await this.client.put(path, data);

      return response.data;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  async delete(path, params = {}) {
    try {
      const response = await this.client.delete(path, { params });

      return response.data;
    } catch (error) {
      return Kisi.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      const { data, status } = error.response;

      if (data) {
        const code = data.code || '000000';
        const reason = data.error || data.errors || code;

        throw new KisiError(status, code, reason);
      } else {
        throw new KisiError(status);
      }
    } else {
      throw error;
    }
  }
}

export default Kisi;
