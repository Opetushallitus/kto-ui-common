const fs = require('fs').promises;
const https = require('https');
const path = require('path');
const glob = require('glob');
const axios = require('axios');
const { promisify } = require('util');
const globP = promisify(glob);

const client = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 2000,
  headers: { 'Caller-Id': process.env.CALLER_ID || 'update-mocks' },
});

const MOCKS_ROOT = (process.env.MOCKS_ROOT || 'cypress/mocks') + '/';

const mockGlob = process.argv?.[2] ?? '**/*.json';

(async () => {
  try {
    const files = await globP(MOCKS_ROOT + mockGlob);
    for (const fileName of files) {
      const data = await fs.readFile(fileName, 'utf8');
      const mockData = JSON.parse(data);
      console.log(`Mock file ${fileName} read`);
      if (Array.isArray(mockData)) {
        const updatedMockData = await Promise.all(
          mockData?.map(async mock => {
            let res;
            try {
              console.log(`Requesting url ${mock.url}`);
              res = await client({
                method: mock?.method ?? 'GET',
                url: mock?.url,
                data: mock?.body,
              });
              console.log(`Request successful (${mock.url})`);
            } catch (e) {
              res = e?.response;
            }
            return {
              ...mock,
              response: {
                body: res?.data,
                status: res?.status,
              },
            };
          })
        );
        await fs.writeFile(
          fileName,
          JSON.stringify(updatedMockData, null, 2),
          'utf8'
        );
        console.log(`Mock file ${fileName} updated`);
      } else {
        console.log(`Invalid mock data file "${fileName}". Skipping.`);
      }
    }
  } catch (e) {
    console.error(e);
  }
})();
