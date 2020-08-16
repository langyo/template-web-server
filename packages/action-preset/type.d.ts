/// <reference path="../core/type.d.ts" />
/// <reference types="react" />
/// <reference types="vue" />

declare interface WebClientLocalContext {
  modelType: string,
  modelID: string
}

declare type ComponentType = (props: {
  state: { [key: string]: any },
  trigger: { [key: string]: (payload: { [key: string]: any }) => void }
}) => string | React.Component | Vue.Component;

declare interface StateManager {
  readonly setState: (modelID: string, combineState: { [key: string]: any }) => void,
  readonly getState: (modelID: string) => Readonly<{ [key: string]: any }>,
  readonly setGlobalState: (combineState: { [key: string]: any }) => void,
  readonly getGlobalState: () => Readonly<({ [key: string]: any })>,
  readonly getModelList: () => Readonly<{ [modelType: string]: Array<string> }>,
  readonly getModelIDList: () => Readonly<{ [modelID: string]: string }>,
  readonly createModel: (modelType: string, initState?: { [key: string]: any }, modelID?: string) => void,
  readonly destoryModel: (modelID: string) => void,
  readonly evaluateModelAction: (modelID: string, actionType: string, payload: { [key: string]: any }) => { [key: string]: any },

  readonly appendListener: (func: (
    prevIDList: { [modelID: string]: string },
    nextIDList: { [modelID: string]: string }
  ) => void, id: string) => void,
  readonly removeListener: (id: string) => void
}

declare interface ModelManager {
  readonly storageModel: (modelType: string, component: ComponentType) => void,
  readonly loadComponent: (type: string) => ComponentType,
  readonly getModelList: () => Array<string>
}