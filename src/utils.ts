import { Component } from './component';
import { PrimaryComponent, ChildrenArray, ChildType } from './elements';
import { Context } from './context';
import { Fragment } from './fragment';
import vnode, { VNode } from 'snabbdom/es/vnode';

export type AnyComp = Component | PrimaryComponent | Fragment;

/* global console, process */

export const debug = process.env.NODE_ENV !== 'production';
export const log = (...data: any): any => {
  if (debug) console.log(...data);
}

export class EventManager {
  private events: Map<string, Map<any, () => void>>;

  set(eventName: string, key: any, callback: () => void) {
    if (!this.events) this.events = new Map();
    if (!this.events.has(eventName)) this.events.set(eventName, new Map());
    const currEvent = this.events.get(eventName);
    currEvent.set(key, callback);
  }

  removeKey(key: any) {
    if (this.events) this.events.forEach((eventMap) => eventMap.delete(key));
  }

  trigger(eventName: string) {
    if (!this.events) return;
    const callbacks = this.events.get(eventName);
    if (callbacks) callbacks.forEach((callback) => callback())
  }
}

const addAll = (set: Set<any>, toAdd: any[]) => {
  for (const item of toAdd) set.add(item);
}

/* eslint-disable @typescript-eslint/no-use-before-define */

function buildChild(context: Context, child: ChildType): VNode[] {
  if (typeof child === 'function') {
    const builtChild = child(context);
    return buildChild(context, builtChild);
  } else if (Array.isArray(child)) {
    return buildChildren(context, child);
  } else if ((typeof child === 'string' && child.trim() !== '') || typeof child === 'number') {
    return [vnode(undefined, undefined, undefined, String(child), undefined)];
  } else if (child instanceof Component || child instanceof PrimaryComponent || child instanceof Fragment) {
    return [child.render(context)].flat(Infinity);
  }
  return [];
}

export function buildChildren(context: Context, childrenArray: ChildrenArray): VNode[] {
  const children = new Set<VNode>();
  for (const child of childrenArray.flat(Infinity)) addAll(children, buildChild(context, child));
  return [...children];
}

/* eslint-enable */

export const generateUniqueId = () => Array(16).fill(' ').join('').replace(/[ ]/g, () => (Math.random() * 16 | 0).toString(16));
