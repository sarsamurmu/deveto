import { AnyComp, isClassComp, FuncComp } from './utils';
import { Context } from './context';
import { ChildType, elR } from './element';
import { Component } from './component';
import { Fragment } from './fragment';

type CompOrFrag = typeof Component | typeof Fragment;

export const createEl = (
  component: CompOrFrag | FuncComp | string,
  props: Record<string, any>,
  ...children: AnyComp[]
): ChildType => {
  if (!props) props = {};
  props.children = children;

  if (typeof component === 'string') {
    return elR(component, props, children);
  } else if (isClassComp(component.prototype)) {
    return (component as CompOrFrag).create(props as any) || new (component as CompOrFrag)(props as any);
  } else if (typeof component === 'function') {
    return (context: Context) => (component as FuncComp)(context, props);
  }
}
