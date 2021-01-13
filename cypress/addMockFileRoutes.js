const path = require('path');
const { isEqual } = require('lodash');

const MOCKS_ROOT = process.env.CYPRESS_MOCKS_ROOT || 'cypress/mocks';

export const addMockFileRoutes = fileName => {
  cy.readFile(path.join(MOCKS_ROOT, fileName)).then(data => {
    data.forEach(({ url, method = 'GET', body, response }) => {
      cy.intercept(method, url, req => {
        // Check that body matches the one from mock if defined
        if (body === undefined || isEqual(body, req.body)) {
          req.reply(response.status, response.body);
        }
      });
    });
  });
};
