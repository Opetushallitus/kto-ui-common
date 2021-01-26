import path from 'path';
import { isEqual, sortBy, uniqWith } from 'lodash';

const MOCKS_ROOT = process.env.MOCKS_ROOT || 'cypress/mocks';

// Play the selected mock file (use the mocks from it in the test)
export const playMockFile = fileName => {
  cy.readFile(path.join(MOCKS_ROOT, fileName), {log: true}).then(data => {
    data.forEach(({ url, method = 'GET', body, response }) => {
      // cy.intercept doesn't match urls with hash, so let's cut it out. 
      const matchUrl = url.split('#')[0];
      cy.intercept(method, matchUrl, req => {
        // Check that the url match is exact (otherwise urls are partially matched) 
        // and that body matches the one from mock if defined
        if (matchUrl === req.url && (body === undefined || isEqual(body, req.body))) {
          req.reply({
            statusCode: response.status, 
            body: response.body
          });
        }
      });
    });
  });
};

// Records a mock file template with urls and methods. Will overwrite the file so be careful.
// The responses can be recorded using update-mocks script.
export const recordMockFileTemplate = fileName => {
  const requests = [];

  beforeEach(() => {
    cy.intercept('*', req => {
      requests.push({
        method: req.method,
        url: req.url
      })
    })
  })

  after(() => {
    const uniqueRequests = sortBy(uniqWith(requests, isEqual), 'url')
    cy.writeFile(path.join(MOCKS_ROOT, fileName), uniqueRequests)
  })
}