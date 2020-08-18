/// <reference path="./type.d.ts" />

declare global {
  export const __callback: (ret: (sessionInfo: SessionInfo) => Promise<RequestForwardObjectType>) => void;
};

import { actionManager as actionManagerFactory } from 'nickelcat';

const actionManager: ActionManager = actionManagerFactory(require('./__nickelcat_staticRequire.js'));
const streamManager: StreamManager = actionManager.getContextFactory('nodeServer')('streamManager');
const modelManager: ModelManager = actionManager.getContextFactory('nodeServer')('modelManager');
const sessionManager: SessionManager = actionManager.getContextFactory('nodeServer')('sessionManager');

import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const pageList = modelManager.getModelList().filter(name => /^pages?.+$/.test(name)).map(name => /^pages?(.+)$/.exec(name)[1]);

function loadReactComponent(Component: WebClientComponentType, modelType: string, pageState: { [key: string]: any }) {
  renderToString(createElement(Component as any, {
    ...pageState,
    ...streamManager.getStreamList('webClient', modelType).reduce((obj, key) => ({
      ...obj,
      [key]: (payload: { [key: string]: any }) => streamManager.runStream('webClient', modelType, key, payload, {
        modelType,
        modelID: '$page'
      })
    }), {})
  }));
};

__callback(async ({
  ip, protocol, host, path, query, cookies
}: SessionInfo) => {
  try {
    if (streamManager.getStreamList('nodeServer', 'http').indexOf(path) >= 0) {
      // Custom request processor.
      return {
        status: 'processed',
        code: 200,
        type: 'application/json',
        body: JSON.stringify(streamManager.runStream('nodeServer', 'http', path, query, {
          ip, protocol, host, path, query, cookies
        }))
      };
    } else if (pageList.indexOf(path.split('/')[0]) >= 0) {
      // Page routes.
      try {
        const pageName = path.split('/')[0];
        if (typeof streamManager.getStreamList('webClient', pageName)['preload'] === 'undefined')
          throw new Error(`Cannot initialize the page ${pageName}`);
        const {
          pageTitle,
          pageState,
          globalState
        } = streamManager.runStream('webClient', pageName, '$preload', {}, {
          ip, protocol, host, path, query, cookies
        });

        const pageNodeString = loadReactComponent(modelManager.loadComponent(pageName), pageName, pageState);
        const body = `
<html>
<head>
<title>
  ${pageTitle || 'NickelCat Engine Default Page'}
</title>
<style>
  body {
    padding: 0px;
    margin: 0px;
  }
</style>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<head>
<body>
  <div id="nickelcat-root">
    <div id="nickelcat-model-$page">
      ${pageNodeString}
    </div>
  </div>
  <textarea id="nickelcat-server-side-data">${JSON.stringify({
    pageTitle,
    pageName,
    pageState,
    globalState
  })}</textarea>
  <script src="${'./spa.js'}"></script>
  </body>
</html>`;
        return {
          status: 'processed',
          code: 200,
          type: 'text/html',
          body
        };
      } catch (e) {
        return {
          status: 'processed',
          code: 503,
          type: 'text/html',
          body: `
<html>
<head>
  <title>RUNTIME ERROR</title>
</head>
<body>
  <h2>Oops!</h2>
  <p>${e.message}</p>
  <p>The most likely cause of the error is the invalid parameters passed, or the problem with the server design.</p>
  <p>The server has logged the error. We apologize for the inconvenience. :P</p>
  </body>
</html>`
        };
      }
    } else {
      return {
        status: 'ignored',
        code: null,
        type: null,
        body: null
      };
    }
  } catch (e) {
    return {
      status: 'processed',
      code: 500,
      type: 'text/html',
      body: `
<html>
<head>
    <title>RUNTIME ERROR</title>
</head>
<body>
  <h2>Oops!</h2>
  <p>${e.message}</p>
  </body>
</html>
    `
    };
  }
});