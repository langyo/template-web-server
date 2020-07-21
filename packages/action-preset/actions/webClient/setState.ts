import {
  ActionObject
} from '../../../core/type';
import {
  WebClientGlobalContext,
  WebClientLocalContext
} from "../../contexts/webClient/modelManager";


type GeneratorFunc = (payload: object, utils: {
  modelType: string,
  modelID: string,
  getState: () => object,
  getGlobalState: () => object,
  getModelList: () => { [modelType: string]: Array<string> }
}) => object;

export function translator(func: GeneratorFunc): ActionObject<object>;
export function translator(combinedObj: object): ActionObject<object>;
export function translator(arg0: GeneratorFunc | object): ActionObject<object> {
  if (typeof arg0 === 'object') return {
    disc:'ActionObject',
    platform: 'webClient',
    type: 'setState',
    args: { generator: () => arg0 }
  }
  else return {
    disc:'ActionObject',
    platform: 'webClient',
    type: 'setState',
    args: { generator: arg0 }
  }
};

export function executor({ generator }: { generator: GeneratorFunc }) {
  return async (payload: object, {
    getState,
    getGlobalState,
    getModelList,
    setState
  }: WebClientGlobalContext, {
    modelType,
    modelID
  }: WebClientLocalContext) => {
    const ret = (<GeneratorFunc>generator)
      (payload, {
        getState: () => getState(modelID),
        getGlobalState,
        getModelList,
        modelType,
        modelID
      });
    setState(modelID, ret);
    return payload;
  }
}
