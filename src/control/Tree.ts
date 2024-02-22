import Node from '../node/Node';
import Root from '../node/Root';
import Event from '../util/Event';
import Geom from '../node/geom/Geom';
import ShapeGroup from '../node/geom/ShapeGroup';
import ArtBoard from '../node/ArtBoard';
import SymbolInstance from '../node/SymbolInstance';
import SymbolMaster from '../node/SymbolMaster';
import Group from '../node/Group';
import Bitmap from '../node/Bitmap';
import Text from '../node/Text';
import Slice from '../node/Slice';
import Container from '../node/Container';

function genNodeTree(node: Node) {
  const type = getNodeType(node);
  const dl = document.createElement('dl');
  const classNames = ['layer'];
  if (node instanceof SymbolInstance) {
    classNames.push('symbol-instance');
  }
  if (node instanceof SymbolMaster) {
    classNames.push('symbol-master');
  }
  if (node.props.isExpanded) {
    classNames.push('expand');
  }
  let s = '';
  if (node instanceof Container) {
    classNames.push('container');
    s += '<span class="arrow"></span>';
  }
  if (node.mask) {
    s += '<span class="mask"></span>';
  }
  dl.className = classNames.join(' ');
  dl.setAttribute('uuid', node.props.uuid);
  const dt = document.createElement('dt');
  // 特殊的矢量小标预览
  if (node instanceof Geom || node instanceof ShapeGroup) {
    const rect = node.rect;
    const width = rect[2] - rect[0];
    const height = rect[3] - rect[1];
    if (!width || !height) {
      s += '<svg class="geom" width="14" height="14"><path d="M0,0L10,0L10,10L0,10L0,0ZM4,4L14,4L14,14L4,14,L4,4Z" fill="#D8D8D8" fill-rule="evenodd" stroke="#979797" stroke-width="1"></path></svg>';
    } else {
      let scale, x = 0, y = 0;
      if(width >= height) {
        scale = 14 / width;
        y = (14 - height * scale) * 0.5;
      } else {
        scale = 14 / height;
        x = (14 - width * scale) * 0.5;
      }
      const svg = node.toSvg(scale).replace('<svg', `<svg style="transform:translate(${x}px, ${y}px)scale(${scale})"`);
      s += `<span class="geom">` + svg + '</span>';
    }
  } else {
    s += `<span class="type ${type}"></span>`;
  }
  s += `<span class="name">${node.props.name || ''}</span>`;
  if (!(node instanceof ArtBoard)) {
    s += `<span class="visible ${node.computedStyle.visible ? 't' : ''}"></span>`;
  }
  dt.innerHTML = s;
  dl.appendChild(dt);
  // 递归children
  if (node instanceof Container) {
    const children = node.children;
    if (children.length) {
      for (let i = children.length - 1; i >= 0; i--) {
        const dd = document.createElement('dd');
        dd.appendChild(genNodeTree(children[i]));
        dl.appendChild(dd);
      }
    }
  }
  return dl;
}

function getNodeType(node: Node) {
  let type = 'default';
  if (node instanceof SymbolInstance) {
    type = 'symbol-instance';
  } else if (node instanceof SymbolMaster) {
    type = 'symbol-master';
  } else if (node instanceof ArtBoard) {
    type = 'art-board';
  } else if (node instanceof Group) {
    type = 'group';
  } else if (node instanceof Bitmap) {
    type = 'bitmap';
  } else if (node instanceof Text) {
    type = 'text';
  } else if (node instanceof Geom) {
    type = 'geom';
  } else if (node instanceof ShapeGroup) {
    type = 'shape-group';
  } else if (node instanceof Slice) {
    type = 'slice';
  }
  return type;
}

export default class Tree extends Event {
  root: Root;
  dom: HTMLElement;

  constructor(root: Root, dom: HTMLElement) {
    super();
    this.root = root;
    this.dom = dom;

    // 可能存在，如果不存在就侦听改变，切换页面同样侦听
    const page = root.getCurPage();
    if (page) {
      this.init();
    }
    root.on(Root.PAGE_CHANGED, () => {
      this.init();
    });

    this.dom.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const classList = target.classList;
      if (classList.contains('arrow') || classList.contains('name')) {
        const dl = target.parentElement!.parentElement!;
        const uuid = dl.getAttribute('uuid');
        if (uuid) {
          const node = this.root.refs[uuid];
          if (node) {
            const isExpanded = node.props.isExpanded = !node.props.isExpanded;
            if (isExpanded) {
              dl.classList.add('expand');
            }
            else {
              dl.classList.remove('expand');
            }
          }
        }
      } else if (classList.contains('visible')) {
        const dl = target.parentElement!.parentElement!;
        const uuid = dl.getAttribute('uuid');
        if (uuid) {
          const node = this.root.refs[uuid];
          if (node) {
            const isVisible = node.computedStyle.visible;
            node.updateStyle({
              visible: !isVisible,
            });
            if (isVisible) {
              classList.remove('t');
            } else {
              classList.add('t');
            }
          }
        }
      }
    });
  }

  init() {
    this.dom.innerHTML = '';
    const page = this.root.getCurPage();
    if (page) {
      const children = page.children;
      if (!children.length) {
        return;
      }
      const fragment = new DocumentFragment();
      for (let i = children.length - 1; i >= 0; i--) {
        fragment.appendChild(genNodeTree(children[i]));
      }
      this.dom.appendChild(fragment);
    }
  }
}