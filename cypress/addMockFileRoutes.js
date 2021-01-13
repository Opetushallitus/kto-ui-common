const path = require('path');
const { isEqual } = require('lodash');

const MOCKS_ROOT = process.env.CYPRESS_MOCKS_ROOT || 'cypress/mocks';

export const addMockFileRoutes = fileName => {
  cy.readFile(path.join(MOCKS_ROOT, fileName), {log: true}).then(data => {
    data.forEach(({ url, method = 'GET', body, response }) => {
      // cy.intercept doesn't notice url hash, so let's cut it out. 
      cy.intercept(method, url.split('#')[0], req => {
        // Check that body matches the one from mock if defined
        if (body === undefined || isEqual(body, req.body)) {
          req.reply(response.status, response.body);
        }
      });
    });
  });
};
