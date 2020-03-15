import { anyComp, buildChildren, EventManager, log } from './utils';
import { Context } from './context';
import { StrutNode } from './strutNode';
import { updateChildren } from './render';

const getIndexInParent = (strutNode: StrutNode, parentElement: Node) => {
  if ((strutNode as StrutNode).elm) {
    const childNodes = parentElement.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      if ((strutNode as StrutNode).elm === childNodes[i]) return i;
    }
  } else if (typeof strutNode === 'string') {
    const childNodes = parentElement.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      if (strutNode === childNodes[i].textContent) return i;
    }
  }
}

export class Fragment {
  context: Context;
  children: anyComp[];
  eventManager: EventManager;
  mountedChildren: number;
  strutNodes: StrutNode[];

  constructor(children: anyComp[]) {
    this.children = children;
    this.eventManager = new EventManager;
    this.mountedChildren = 0;

    for (const child of children) {
      if (child.eventManager) {
        child.eventManager.set('mount', this, () => {
          if (++this.mountedChildren === this.children.length) this.eventManager.trigger('mount');
        });
        child.eventManager.set('destroy', this, () => {
          this.mountedChildren--;
          child.eventManager.removeKey(this);
        })
      }
    }
  }

  rebuild() {
    const newChildren = this.build(this.context);
    const insertedVnodeQueue: StrutNode[] = [];
    updateChildren(this.strutNodes[0].elm.parentElement, this.strutNodes, newChildren, insertedVnodeQueue);
    this.strutNodes = newChildren;
    for (const insertedVNode of insertedVnodeQueue) {
      insertedVNode.data!.hook!.insert!(insertedVNode);
    }
  }

  build(context: Context) {
    return buildChildren(context, this.children);
  }

  render(context: Context) {
    this.strutNodes = this.build(context);
    return this.strutNodes;
  }
}
