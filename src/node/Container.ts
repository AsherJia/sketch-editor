import * as uuid from 'uuid';
import { JContainer, JNode, Override, Props } from '../format';
import Node from '../node/Node';
import { RefreshLevel } from '../refresh/level';
import { Struct } from '../refresh/struct';
import inject from '../util/inject';
import { clone, isNil } from '../util/type';
import { LayoutData } from './layout';
import { calRectPoints } from '../math/matrix';

class Container<T extends Node = Node> extends Node {
  children: T[];

  constructor(props: Props, children: T[] = []) {
    super(props);
    this.children = children;
    const len = children.length;
    if (len) {
      const first = children[0];
      first.parent = this;
      let last = first;
      for (let i = 1; i < len; i++) {
        const child = children[i];
        child.parent = this;
        last.next = child;
        child.prev = last;
        last = child;
      }
    }
    this.isContainer = true;
  }

  // 添加到dom后isDestroyed状态以及设置父子兄弟关系，有点重复设置，一口气创建/移动一颗子树时需要
  override willMount() {
    super.willMount();
    const { children } = this;
    const len = children.length;
    if (len) {
      let setIndex = false;
      const first = children[0];
      first.parent = this;
      first.willMount();
      // 手写错误情况
      if (first.index <= 0 || first.index >= 1 || isNil(first.index)) {
        setIndex = true;
      }
      let last = first;
      for (let i = 1; i < len; i++) {
        const child = children[i];
        child.parent = this;
        // 手写情况可能会出现无index或错误index，需重设，转换的sketch/psd转换过程保证，一定是(0,1)之间
        if (child.index <= 0 || child.index <= last.index || child.index >= 1 || isNil(child.index)) {
          setIndex = true;
        }
        child.willMount();
        last.next = child;
        child.prev = last;
        last = child;
      }
      // 重设错误的index，全部重来
      if (setIndex) {
        for (let i = 0; i < len; i++) {
          const child = children[i];
          child.index = (i + 1) / (len + 1);
        }
      }
    }
  }

  // 冒泡的didMount
  override didMount() {
    const { children } = this;
    const len = children.length;
    for (let i = 0; i < len; i++) {
      children[i].didMount();
    }
    super.didMount();
  }

  override lay(data: LayoutData) {
    super.lay(data);
    const { children } = this;
    // 递归下去布局
    for (let i = 0, len = children.length; i < len; i++) {
      const child = children[i];
      child.layout({
        w: this.width,
        h: this.height,
      });
    }
    // 回溯收集minWidth/minHeight
    // for (let i = 0, len = children.length; i < len; i++) {
    //   const child = children[i];
    //   computedStyle.minWidth = this.minWidth = Math.max(
    //     this.minWidth,
    //     child.minWidth,
    //   );
    //   computedStyle.minHeight = this.minHeight = Math.max(
    //     this.minHeight,
    //     child.minHeight,
    //   );
    // }
  }

  // 获取所有孩子相对于本父元素的盒子尺寸，再全集的极值
  getChildrenRect(ignore?: Node) {
    const { children } = this;
    const rect = {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    };
    let isMask = false;
    let first = true;
    // 注意要考虑mask和breakMask，被遮罩的都忽略
    for (let i = 0, len = children.length; i < len; i++) {
      const child = children[i];
      const computedStyle = child.computedStyle;
      if (isMask && !computedStyle.breakMask) {
        continue;
      }
      if (computedStyle.maskMode) {
        isMask = true;
        // 遮罩跳过被遮罩节点
        let next = child.next;
        while (next && !next.computedStyle.breakMask) {
          i++;
          next = next.next;
        }
      }
      else if (computedStyle.breakMask) {
        isMask = false;
      }
      if (ignore === child) {
        continue;
      }
      const r = child._rect || child.rect;
      const { x1, y1, x2, y2, x3, y3, x4, y4 } = calRectPoints(r[0], r[1], r[2], r[3], child.matrix);
      const minX = Math.min(x1, x2, x3, x4);
      const minY = Math.min(y1, y2, y3, y4);
      const maxX = Math.max(x1, x2, x3, x4);
      const maxY = Math.max(y1, y2, y3, y4);
      if (first) {
        first = false;
        rect.minX = minX;
        rect.minY = minY;
        rect.maxX = maxX;
        rect.maxY = maxY;
      }
      else {
        rect.minX = Math.min(rect.minX, minX);
        rect.minY = Math.min(rect.minY, minY);
        rect.maxX = Math.max(rect.maxX, maxX);
        rect.maxY = Math.max(rect.maxY, maxY);
      }
    }
    return rect;
  }

  appendChild(node: T, cb?: (sync: boolean) => void) {
    node.remove();
    const { root, children } = this;
    const len = children.length;
    if (len) {
      const last = children[children.length - 1];
      last.next = node;
      node.prev = last;
      node.index = (last.index + 1) * 0.5;
    }
    else {
      node.index = 0.5;
    }
    node.parent = this;
    node.root = root;
    children.push(node);
    // 离屏情况，尚未添加到dom等
    if (this.isDestroyed) {
      cb && cb(true);
      return;
    }
    node.willMount();
    this.insertStruct(node, len);
    root!.addUpdate(node, [], RefreshLevel.REFLOW, true, false, (sync) => {
      cb && cb(sync);
    });
  }

  prependChild(node: T, cb?: (sync: boolean) => void) {
    node.remove();
    const { root, children } = this;
    const len = children.length;
    if (len) {
      const first = children[0];
      first.next = node;
      node.prev = first;
      node.index = first.index * 0.5;
    }
    else {
      node.index = 0.5;
    }
    node.parent = this;
    node.root = root;
    children.push(node);
    // 离屏情况，尚未添加到dom等
    if (this.isDestroyed) {
      cb && cb(true);
      return;
    }
    node.willMount();
    this.insertStruct(node, 0);
    root!.addUpdate(node, [], RefreshLevel.REFLOW, true, false, (sync) => {
      cb && cb(sync);
    });
  }

  removeChild(node: Node, cb?: (sync: boolean) => void) {
    if (node.parent === this) {
      node.remove(cb);
    }
    else {
      inject.error('Invalid parameter of removeChild()');
    }
  }

  clearChildren(cb?: (sync: boolean) => void) {
    const { root, children } = this;
    if (children.length) {
      if (this.isDestroyed) {
        children.splice(0);
        cb && cb(true);
        return;
      }
      // 特殊优化，不去一个个调用remove，整体删除后
      while (children.length) {
        const child = children.pop()!;
        this.deleteStruct(child);
        child.destroy();
      }
      root!.addUpdate(this, [], RefreshLevel.REFLOW, false, false, cb);
    }
  }

  override destroy() {
    const { isDestroyed, children } = this;
    if (isDestroyed) {
      return;
    }
    for (let i = 0, len = children.length; i < len; i++) {
      children[i].destroy();
    }
    super.destroy();
  }

  override structure(lv: number): Array<Struct> {
    let res = super.structure(lv);
    this.children.forEach((child) => {
      res = res.concat(child.structure(lv + 1));
    });
    res[0].num = this.children.length;
    res[0].total = res.length - 1;
    return res;
  }

  insertStruct(child: Node, childIndex: number) {
    const { struct, root } = this;
    const cs = child.structure(struct.lv + 1);
    const structs = root!.structs;
    let i;
    if (childIndex) {
      const s = this.children[childIndex - 1].struct;
      const total = s.total;
      i = structs.indexOf(s) + total + 1;
    }
    else {
      i = structs.indexOf(struct) + 1;
    }
    structs.splice(i, 0, ...cs);
    const total = cs[0].total + 1;
    struct.num++;
    struct.total += total;
    let p = this.parent;
    while (p) {
      p.struct.total += total;
      p = p.parent;
    }
  }

  deleteStruct(child: Node) {
    const cs = child.struct;
    const total = cs.total + 1;
    const root = this.root!,
      structs = root.structs;
    const i = structs.indexOf(cs);
    structs.splice(i, total);
    const struct = this.struct;
    struct.num--;
    struct.total -= total;
    let p = this.parent;
    while (p) {
      p.struct.total -= total;
      p = p.parent;
    }
  }

  override getStructs() {
    if (!this.root) {
      return [];
    }
    const structs = this.root.structs;
    const struct = this.struct;
    const i = structs.indexOf(struct);
    return structs.slice(i, i + struct.total + 1);
  }

  override clone(override?: Record<string, Override[]>) {
    const props = clone(this.props);
    props.uuid = uuid.v4();
    props.sourceUuid = this.uuid;
    const res = new Container(props, this.children.map(item => item.clone(override)));
    res.style = clone(this.style);
    res.computedStyle = clone(this.computedStyle);
    return res;
  }

  override toJson(): JNode {
    const res = super.toJson() as JContainer;
    res.children = this.children.map(item => item.toJson());
    return res;
  }
}

export default Container;
