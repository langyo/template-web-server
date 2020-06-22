import React, { createElement } from 'react';
import { hydrate } from 'react-dom';
import nodeRender from 'nickelcat/client/clientNodeRender';
import createModelManager from 'nickelcat/lib/modelManager';

import presetActionPackage from 'nickelcat-action-preset';
import createActionMangager from 'nickelcat/lib/actionManager';
const actionManager = createActionMangager(presetActionPackage);

const { components, services } = require('/__NICKELCAT_STATIC_REQUIRE.js');
const modelManager = createModelManager(components, actionManager);

nodeRender({
  actionManager,
  modelManager,
  ...window.__NICKELCAT_INIT__,
  targetElementID: 'nickelcat-root'
}, actionManager);

for (const id of window.__NICKELCAT_SSR_CSS__) {
  if (document.getElementById(id)) {
    document.getElementById(id).parentElement.removeChild(document.getElementById(id));
  }
}
