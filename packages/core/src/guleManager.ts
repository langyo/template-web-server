import {
  IProjectPackage,
  IRuntime,
  IGlueManager,
  IContextManager,
  IPlatforms,
} from '../index';

export function glueManagerFactory(
  projectPackage: IProjectPackage,
  contextManager: IContextManager,
  platform: IPlatforms
): IGlueManager {
  let protocols: {
    [platform in IPlatforms]?: (
      obj: { [key: string]: any }
    ) => Promise<{ [key: string]: any }>
  } = {};

  function getProtocol(platform: IPlatforms): (
    obj: { [key: string]: any }
  ) => Promise<{ [key: string]: any }> {
    if (typeof protocols[platform] === 'undefined') {
      throw new Error(`Unknown protocol: ${platform}.`);
    }
    return protocols[platform];
  }

  function setProtocol(
    platform: IPlatforms,
    func: (
      obj: { [key: string]: any }
    ) => Promise<{ [key: string]: any }>
  ) {
    protocols[platform] = func;
  }

  function linkTo(
    platform: IPlatforms,
    payload: { [key: string]: any }
  ): Promise<{ [key: string]: any }> {
    if (typeof protocols[platform] === 'undefined') {
      throw new Error(`Unknown protocol: ${platform}.`);
    }
    return protocols[platform](payload);
  }

  return Object.freeze({
    setProtocol,
    getProtocol,
    linkTo
  });
}