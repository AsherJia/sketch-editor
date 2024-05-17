import Node from '../node/Node';
import Root from '../node/Root';
import { toPrecision } from '../math';
import Listener from './Listener';
import MoveCommand from '../history/MoveCommand';
import RotateCommand from '../history/RotateCommand';
import { getGroupActualRect, resizeBR } from '../tools/node';
import ResizeCommand from '../history/ResizeCommand';
import { JStyle } from '../format';
import Group from '../node/Group';
import ShapeGroup from '../node/geom/ShapeGroup';

const html = `
  <h4 class="panel-title">基本</h4>
  <div class="line">
    <label class="x">
      <input type="number" class="num" step="1" disabled/>
      <span>X</span>
    </label>
    <label class="y">
      <input type="number" class="num" step="1" disabled/>
      <span>Y</span>
    </label>
    <label class="r">
      <input type="number" class="num" step="1" disabled/>
      <span>°</span>
    </label>
  </div>
  <div class="line">
    <label class="w">
      <input type="number" class="num" step="1" disabled/>
      <span>W</span>
    </label>
    <label class="h">
      <input type="number" class="num" step="1" disabled/>
      <span>H</span>
    </label>
  </div>
`;

class BasicPanel {
  root: Root;
  dom: HTMLElement;
  listener: Listener;
  panel: HTMLElement;
  nodes: Node[];
  data: Array<{ x: number, y: number, angle: number, w: number, h: number }>; // node当前数据，每次input变更则更新
  silence: boolean; // input更新触发listener的事件，避免循环侦听更新前静默标识不再侦听

  constructor(root: Root, dom: HTMLElement, listener: Listener) {
    this.root = root;
    this.dom = dom;
    this.listener = listener;
    this.nodes = [];
    this.data = [];
    this.silence = false;

    const panel = this.panel = document.createElement('div');
    panel.className = 'basic-panel';
    panel.innerHTML = html;
    this.dom.appendChild(panel);

    const x = panel.querySelector('.x input') as HTMLInputElement;
    const y = panel.querySelector('.y input') as HTMLInputElement;
    const r = panel.querySelector('.r input') as HTMLInputElement;
    const w = panel.querySelector('.w input') as HTMLInputElement;
    const h = panel.querySelector('.h input') as HTMLInputElement;

    x.addEventListener('input', (e) => {
      this.silence = true;
      const isInput = e instanceof InputEvent; // 上下键还是真正输入
      const nodes: Node[] = [];
      const dxs: number[] = [];
      const dys: number[] = [];
      this.nodes.forEach((node, i) => {
        let d = 0;
        if (isInput) {
          d = parseFloat(x.value) - this.data[i].x;
        }
        else {
          d = parseFloat(x.value);
        }
        if (d) {
          if (!isInput && listener.shiftKey) {
            if (d > 0) {
              d = 10;
            }
            else {
              d = -10;
            }
            if (isInput && !i) {
              x.value = toPrecision(this.data[i].x + d).toString();
            }
          }
          this.data[i].x += d;
          const style = node.getStyle();
          node.updateStyle({
            translateX: node.computedStyle.translateX + d,
          });
          // 还原最初的translate/TRBL值
          node.endPosChange(style, d, 0);
          node.checkPosSizeUpward();
          nodes.push(node);
          dxs.push(d);
          dys.push(0);
        }
      });
      if (!isInput) {
        x.value = '';
      }
      if (nodes.length) {
        listener.history.addCommand(new MoveCommand(nodes, dxs, dys));
        listener.select.updateSelect(nodes);
        listener.emit(Listener.MOVE_NODE, nodes.slice(0));
      }
      this.silence = false;
    });

    y.addEventListener('input', (e) => {
      this.silence = true;
      const isInput = e instanceof InputEvent; // 上下键还是真正输入
      const nodes: Node[] = [];
      const dxs: number[] = [];
      const dys: number[] = [];
      this.nodes.forEach((node, i) => {
        let d = 0;
        if (isInput) {
          d = parseFloat(y.value) - this.data[i].y;
        }
        else {
          d = parseFloat(y.value);
        }
        if (d) {
          if (!isInput && listener.shiftKey) {
            if (d > 0) {
              d = 10;
            }
            else {
              d = -10;
            }
            if (isInput && !i) {
              y.value = toPrecision(this.data[i].y + d).toString();
            }
          }
          this.data[i].y += d;
          const style = node.getStyle();
          node.updateStyle({
            translateY: node.computedStyle.translateY + d,
          });
          // 还原最初的translate/TRBL值
          node.endPosChange(style, 0, d);
          node.checkPosSizeUpward();
          nodes.push(node);
          dxs.push(0);
          dys.push(d);
        }
      });
      if (!isInput) {
        y.value = '';
      }
      if (nodes.length) {
        listener.history.addCommand(new MoveCommand(nodes, dxs, dys));
        listener.select.updateSelect(nodes);
        listener.emit(Listener.MOVE_NODE, nodes.slice(0));
      }
      this.silence = false;
    });

    r.addEventListener('input', (e) => {
      this.silence = true;
      const isInput = e instanceof InputEvent; // 上下键还是真正输入
      const nodes: Node[] = [];
      const ns: number[] = [];
      this.nodes.forEach((node, i) => {
        let d = 0;
        if (isInput) {
          d = parseFloat(r.value) - this.data[i].angle;
        }
        else {
          d = parseFloat(r.value);
        }
        if (d) {
          if (!isInput && listener.shiftKey) {
            if (d > 0) {
              d = 10;
            }
            else {
              d = -10;
            }
            if (isInput && !i) {
              r.value = toPrecision(this.data[i].angle + d).toString();
            }
          }
          this.data[i].angle += d;
          node.updateStyle({
            rotateZ: node.computedStyle.rotateZ + d,
          });
          node.checkPosSizeUpward();
          nodes.push(node);
          ns.push(d);
        }
      });
      if (!isInput) {
        r.value = '';
      }
      if (nodes.length) {
        listener.history.addCommand(new RotateCommand(nodes, ns));
        listener.select.updateSelect(nodes);
        listener.emit(Listener.ROTATE_NODE, nodes.slice(0));
      }
      this.silence = false;
    });

    w.addEventListener('input', (e) => {
      this.silence = true;
      const isInput = e instanceof InputEvent; // 上下键还是真正输入
      const nodes: Node[] = [];
      const styles: { prev: Partial<JStyle>, next: Partial<JStyle> }[] = [];
      this.nodes.forEach((node, i) => {
        let d = 0;
        if (isInput) {
          d = parseFloat(w.value) - this.data[i].w;
        }
        else {
          d = parseFloat(w.value);
        }
        if (d) {
          if (!isInput && listener.shiftKey) {
            if (d > 0) {
              d = 10;
            }
            else {
              d = -10;
            }
            if (isInput && !i) {
              w.value = toPrecision(this.data[i].w + d).toString();
            }
          }
          this.data[i].w += d;
          const { computedStyle } = node;
          const style = node.getStyle();
          const cssStyle = node.getCssStyle();
          const next = resizeBR(node, style, computedStyle, cssStyle, d, 0);
          node.updateStyle(next);
          const prev: Partial<JStyle> = {};
          Object.keys(next).forEach((k) => {
            const v = cssStyle[k as keyof JStyle];
            // @ts-ignore
            prev[k] = v;
          });
          // 还原最初的translate/TRBL值
          node.endSizeChange(style);
          node.checkPosSizeUpward();
          nodes.push(node);
          styles.push({ prev, next });
        }
      });
      if (isInput) {
        w.value = '';
      }
      if (nodes.length) {
        listener.history.addCommand(new ResizeCommand(nodes, styles));
        listener.select.updateSelect(nodes);
        listener.emit(Listener.RESIZE_NODE, nodes.slice(0));
      }
      this.silence = false;
    });

    h.addEventListener('input', (e) => {
      this.silence = true;
      const isInput = e instanceof InputEvent; // 上下键还是真正输入
      const nodes: Node[] = [];
      const styles: { prev: Partial<JStyle>, next: Partial<JStyle> }[] = [];
      this.nodes.forEach((node, i) => {
        let d = 0;
        if (isInput) {
          d = parseFloat(h.value) - this.data[i].h;
        }
        else {
          d = parseFloat(h.value);
        }
        if (d) {
          if (!isInput && listener.shiftKey) {
            if (d > 0) {
              d = 10;
            }
            else {
              d = -10;
            }
            if (isInput && !i) {
              h.value = toPrecision(this.data[i].h + d).toString();
            }
          }
          this.data[i].h += d;
          const { computedStyle } = node;
          const style = node.getStyle();
          const cssStyle = node.getCssStyle();
          const next = resizeBR(node, style, computedStyle, cssStyle, 0, d);
          node.updateStyle(next);
          const prev: Partial<JStyle> = {};
          Object.keys(next).forEach((k) => {
            const v = cssStyle[k as keyof JStyle];
            // @ts-ignore
            prev[k] = v;
          });
          // 还原最初的translate/TRBL值
          node.endSizeChange(style);
          node.checkPosSizeUpward();
          nodes.push(node);
          styles.push({ prev, next });
        }
      });
      if (isInput) {
        h.value = '';
      }
      if (nodes.length) {
        listener.history.addCommand(new ResizeCommand(nodes, styles));
        listener.select.updateSelect(nodes);
        listener.emit(Listener.RESIZE_NODE, nodes.slice(0));
      }
      this.silence = false;
    });

    listener.on(Listener.MOVE_NODE, (nodes: Node[]) => {
      if (this.silence) {
        return;
      }
      this.show(nodes);
    });
    listener.on(Listener.RESIZE_NODE, (nodes: Node[]) => {
      if (this.silence) {
        return;
      }
      this.show(nodes);
    });
    listener.on(Listener.ROTATE_NODE, (nodes: Node[]) => {
      if (this.silence) {
        return;
      }
      this.show(nodes);
    });
  }

  show(nodes: Node[]) {
    this.nodes = nodes;
    this.data = [];
    const panel = this.panel;
    if (!nodes.length) {
      panel.querySelectorAll('label').forEach(item => {
        item.classList.add('disabled');
      });
      panel.querySelectorAll('input').forEach(item => {
        item.disabled = true;
        item.placeholder = '';
        item.value = '';
      });
      return;
    }
    panel.querySelectorAll('label').forEach(item => {
      item.classList.remove('disabled');
    });
    panel.querySelectorAll('input').forEach(item => {
      item.disabled = false;
      item.placeholder = '';
      item.value = '';
    });
    const xs: number[] = [];
    const ys: number[] = [];
    const rs: number[] = [];
    const ws: number[] = [];
    const hs: number[] = [];
    nodes.forEach(item => {
      const o = item.getFrameProps();
      let { x, y, rotation, w, h } = o;
      this.data.push(o);
      // 展示的实际尺寸
      if (item.isGroup && item instanceof Group && !(item instanceof ShapeGroup)) {
        const t = getGroupActualRect(item);
        x += t[0];
        y += t[1];
        w = t[2] - t[0];
        h = t[3] - t[1];
      }
      if (!xs.includes(x)) {
        xs.push(x);
      }
      if (!ys.includes(y)) {
        ys.push(y);
      }
      if (!rs.includes(rotation)) {
        rs.push(rotation);
      }
      if (!ws.includes(w)) {
        ws.push(w);
      }
      if (!hs.includes(h)) {
        hs.push(h);
      }
    });
    const x = panel.querySelector('.x input') as HTMLInputElement;
    const y = panel.querySelector('.y input') as HTMLInputElement;
    const r = panel.querySelector('.r input') as HTMLInputElement;
    const w = panel.querySelector('.w input') as HTMLInputElement;
    const h = panel.querySelector('.h input') as HTMLInputElement;
    if (xs.length > 1) {
      x.placeholder = '多个';
    }
    else {
      x.value = toPrecision(xs[0]).toString();
    }
    if (ys.length > 1) {
      y.placeholder = '多个';
    }
    else {
      y.value = toPrecision(ys[0]).toString();
    }
    if (rs.length > 1) {
      r.placeholder = '多个';
    }
    else {
      r.value = toPrecision(rs[0]).toString();
    }
    if (ws.length > 1) {
      w.placeholder = '多个';
    }
    else {
      w.value = toPrecision(ws[0]).toString();
    }
    if (hs.length > 1) {
      h.placeholder = '多个';
    }
    else {
      h.value = toPrecision(hs[0]).toString();
    }
  }
}

export default BasicPanel;
