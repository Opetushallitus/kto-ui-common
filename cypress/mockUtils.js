import path from 'path';
import { isEqual, sortBy, uniqWith } from 'lodash';

const MOCKS_ROOT = process.env.MOCKS_ROOT || 'cypress/mocks';

// Play the selected mock file (use the mocks from it in the test)
export const playMockFile = fileName => {
  cy.readFile(path.join(MOCKS_ROOT, fileName), {log: true}).then(data => {
    data.forEach(({ url, method = 'GET', body, response }) => {
      // cy.intercept doesn't notice url hash, so let's cut it out. 
      cy.intercept(method, url.split('#')[0], req => {
        // Check that body matches the one from mock if defined
        if (body === undefined || isEqual(body, req.body)) {
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