import { State } from './State';
import { Event, StateValue, EventType } from './types';

export function getEventType(event: Event): EventType {
  try {
    return typeof event === 'string' || typeof event === 'number'
      ? `${event}`
      : event.type;
  } catch (e) {
    throw new Error(
      'Events must be strings or objects with a string event.type property.'
    );
  }
}

export function toStatePath(
  stateId: string | string[],
  delimiter: string
): string[] {
  try {
    if (Array.isArray(stateId)) {
      return stateId;
    }

    return stateId.toString().split(delimiter);
  } catch (e) {
    throw new Error(`'${stateId}' is not a valid state path.`);
  }
}

export function toStateValue(
  stateValue: State | StateValue,
  delimiter: string
): StateValue {
  if (stateValue instanceof State) {
    return stateValue.value;
  }

  if (typeof stateValue === 'object' && !(stateValue instanceof State)) {
    return stateValue;
  }

  const statePath = toStatePath(stateValue as string, delimiter);

  return pathToStateValue(statePath);
}

export function pathToStateValue(statePath: string[]): StateValue {
  if (statePath.length === 1) {
    return statePath[0];
  }

  const value = {};
  let marker = value;

  for (let i = 0; i < statePath.length - 1; i++) {
    if (i === statePath.length - 2) {
      marker[statePath[i]] = statePath[i + 1];
    } else {
      marker[statePath[i]] = {};
      marker = marker[statePath[i]];
    }
  }

  return value;
}

export function mapValues<T, P>(
  collection: { [key: string]: T },
  iteratee: (item: T, key: string, collection: { [key: string]: T }) => P
): { [key: string]: P } {
  const result = {};

  Object.keys(collection).forEach(key => {
    result[key] = iteratee(collection[key], key, collection);
  });

  return result;
}

/**
 * Retrieves a value at the given path.
 * @param props The deep path to the prop of the desired value
 */
export const path = (props: string[]): any => <T extends Record<string, any>>(
  object: T
): any => {
  let result: Record<string, any> = object;

  for (const prop of props) {
    result = result[prop];
  }

  return result;
};

export const toStatePaths = (stateValue: StateValue): string[][] => {
  if (typeof stateValue === 'string') {
    return [[stateValue]];
  }

  const result = Object.keys(stateValue)
    .map(key => {
      return toStatePaths(stateValue[key]).map(subPath => {
        return [key].concat(subPath);
      });
    })
    .reduce((a, b) => a.concat(b), []);

  return result;
};

export const pathsToStateValue = (paths: string[][]): StateValue => {
  const result: StateValue = {};

  if (paths && paths.length === 1 && paths[0].length === 1) {
    return paths[0][0];
  }

  for (const currentPath of paths) {
    let marker = result;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < currentPath.length; i++) {
      const subPath = currentPath[i];

      if (i === currentPath.length - 2) {
        marker[subPath] = currentPath[i + 1];
        break;
      }
      marker[subPath] = marker[subPath] || {};
      marker = marker[subPath] as {};
    }
  }

  return result;
};
