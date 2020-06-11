import React, { createElement } from 'react';
import { hydrate } from 'react-dom';
import createStateManager from './stateManager';
import createModelManager from '../lib/modelManager';
import createStream from './createStream';
import { clientTranslator } from '../lib/translator';

const bindStateToReact = (stateManager, component, propsFunc) => class extends Component {
  constructor(props) {
    super(props);
    this.state = stateManager.getAllState();
    stateManager.registerListener(this.setState.bind(this));
  }

  render() {
    return <>
      {createElement(component, propsFunc(this.state))}
    </>
  }
}

export default ({
  components,
  pageType,
  globalState,
  pagePreloadState,
  targetElement = document.querySelector('#nickelcat-root')
}) => {
  const modelManager = createModelManager(components);
  const stateManager = createStateManager(modelManager);
  stateManager.setGlobalState({ ...globalState, $page: pageType });
  stateManager.createModel(pageType, pagePreloadState, '$page');
  for (const modelType of Object.keys(components))
    if (/^views?\./.test(modelType))
      stateManager.createModel(modelType, pagePreloadState, '$view');

  const appendModel = (modelType, modelID) => {
    const elementID = `nickelcat-model-${modelType.split('.').join('_')}-${modelID}`;
    let nodePre = document.createElement('div');
    nodePre.id = elementID;
    targetElement.appendChild(nodePre);
    const node = document.querySelector(elementID);
    hydrate(bindStateToReact(stateManager, loadComponent(modelType), state => ({
      ...state.modelState[modelType][modelID],
      ...state.globalState,
      ...((stream => Object.keys(stream).reduce(
        (obj, key) => ({
          ...obj,
          [key]: createStream({
            tasks: stream[key],
            path: `${modelType}[${modelID}]`
          }, {
            modelType,
            modelID
          })
        }), {}
      ))(clientTranslator(getClientStream(modelType))))
    })), node);
  };
  const removeModel = (modelType, modelID) => {
    const elementID = `nickelcat-model-${modelType.split('.').join('_')}-${modelID}`;
    const node = document.querySelector(elementID);
    targetElement.removeChild(node);
  };

  stateManager.registerListener(({ modelState }) => {
    const prevIDList = Array.from(targetElement.childNodes)
      .map(n => n.id)
      .map(str => {
        const ret = /^nickelcat-model-(.+)-(.+)$/.exec(str);
        return { modelType: ret[1], modelID: ret[2] };
      })
      .reduce((obj, { modelType, modelID }) => ({
        ...obj,
        [modelType]: obj[modelType] ? [...obj[modelType], modelID] : [modelID]
      }));
    const nextIDList = Object.keys(modelState).reduce((obj, modelType) => ({
      ...obj,
      [modelType]: Object.keys(modelState[modelType])
    }));

    for (const modelType of Object.keys(nextIDList)) {
      if (!prevIDList[modelType]) {
        for (const modelID of nextIDList[modelType])
          appendModel(modelType, modelID);
      } else {
        for (const modelID of nextIDList[modelType]) {
          if (!prevIDList[modelType][modelID]) appendModel(modelType, modelID);
        }
        for (const modelID of prevIDList[modelType]) {
          if (!nextIDList[modelType][modelID]) removeModel(modelType, modelID);
        }
      }
    }
  });

  let ret = {};
  for (const modelType of modelManager.getModelList()) {
    if (stateManager.modelState[modelType]) {
      for (const modelID of Object.keys(stateManager.modelState[modelType])) {
        ret[`nickelcat-model-${modelType.split('.').join('_')}-${modelID}`] = bindStateToReact(stateManager, loadComponent(modelType), state => ({
          ...state.modelState[modelType][modelID],
          ...state.globalState,
          ...((stream => Object.keys(stream).reduce(
            (obj, key) => ({
              ...obj,
              [key]: createStream({
                tasks: stream[key],
                path: `${modelType}[${modelID}]`
              }, {
                modelType,
                modelID
              })
            }), {}
          ))(clientTranslator(getClientStream(modelType))))
        }));
      }
    }
  }

  return ret;
}
