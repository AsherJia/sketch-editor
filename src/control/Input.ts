import Text from '../node/Text';
import Root from '../node/Root';
import Listener from './Listener';
import State from './State';
import UpdateTextCommand from '../history/UpdateTextCommand';

export default class Input {
  root: Root;
  dom: HTMLElement;
  listener: Listener;
  containerEl: HTMLDivElement;
  inputEl: HTMLInputElement;
  cursorEl: HTMLDivElement;
  node?: Text;
  ignoreBlur: HTMLElement[];

  constructor(root: Root, dom: HTMLElement, listener: Listener) {
    this.root = root;
    this.dom = dom;
    this.listener = listener;
    this.ignoreBlur = [];

    const containerEl = this.containerEl = document.createElement('div');
    containerEl.className = 'input';
    containerEl.style.position = 'absolute';
    containerEl.style.pointerEvents = 'none';
    containerEl.style.opacity = '0';
    dom.appendChild(containerEl);

    const inputEl = this.inputEl = document.createElement('input');
    inputEl.style.position = 'absolute';
    inputEl.style.left = '0px';
    inputEl.style.top = '0px';
    inputEl.style.width = '10px';
    inputEl.style.height = '100%';
    inputEl.style.boxSizing = 'content-box';
    inputEl.style.border = 'none';
    inputEl.style.pointerEvents = 'none';
    inputEl.style.opacity = '0';
    inputEl.type = 'text';
    inputEl.autocomplete = 'off';
    inputEl.spellcheck = false;
    containerEl.appendChild(inputEl);

    let isIme = false;
    inputEl.addEventListener('keydown', (e) => {
      const keyCode = e.keyCode;
      if (this.node) {
        if (keyCode === 13) {
          const content = this.node._content;
          const rich = this.node.getRich();
          this.node.enter();
          this.showCursor();
          this.updateCursor();
          listener.select.updateSelect([this.node]);
          listener.emit(Listener.TEXT_CONTENT_NODE, [this.node]);
          listener.emit(Listener.CURSOR_NODE, [this.node]);
          this.listener.history.addCommand(new UpdateTextCommand([this.node], [{
            prev: {
              content,
              rich,
            },
            next: {
              content: this.node._content,
              rich: this.node.getRich(),
            },
          }]));
        }
        else if (keyCode === 8 || keyCode === 46) {
          e.stopPropagation();
          const content = this.node._content;
          const rich = this.node.getRich();
          this.node!.delete(keyCode === 46);
          this.showCursor();
          this.updateCursor();
          listener.select.updateSelect([this.node]);
          listener.emit(Listener.TEXT_CONTENT_NODE, [this.node]);
          listener.emit(Listener.CURSOR_NODE, [this.node]);
          this.listener.history.addCommand(new UpdateTextCommand([this.node], [{
            prev: {
              content,
              rich,
            },
            next: {
              content: this.node._content,
              rich: this.node.getRich(),
            },
          }]));
        }
        else if (keyCode >= 37 && keyCode <= 40) {
          e.stopPropagation();
          const p = this.node.moveCursor(keyCode, e.shiftKey);
          if (e.shiftKey) {
            this.hideCursor();
          }
          else {
            this.showCursor();
            this.updateCursor(p);
          }
          listener.emit(Listener.CURSOR_NODE, [this.node]);
        }
      }
    });

    inputEl.addEventListener('input', (e) => {
      if (!isIme && this.node) {
        const s = (e as InputEvent).data;
        if (s) {
          const content = this.node._content;
          const rich = this.node.getRich();
          this.node.input(s);
          this.updateCursor();
          this.showCursor();
          inputEl.value = '';
          this.listener.select.updateSelect([this.node]);
          this.listener.emit(Listener.TEXT_CONTENT_NODE, [this.node]);
          this.listener.history.addCommand(new UpdateTextCommand([this.node], [{
            prev: {
              content,
              rich,
            },
            next: {
              content: this.node._content,
              rich: this.node.getRich(),
            },
          }]));
        }
      }
    });
    inputEl.addEventListener('compositionstart', (e) => {
      isIme = true;
    });
    inputEl.addEventListener('compositionend', (e) => {
      isIme = false;
      const s = e.data;
      if (this.node && s) {
        const content = this.node._content;
        const rich = this.node.getRich();
        this.node.input(s);
        this.updateCursor();
        this.showCursor();
        inputEl.value = '';
        this.listener.select.updateSelect([this.node]);
        this.listener.emit(Listener.TEXT_CONTENT_NODE, [this.node]);
        listener.emit(Listener.CURSOR_NODE, [this.node]);
        this.listener.history.addCommand(new UpdateTextCommand([this.node], [{
          prev: {
            content,
            rich,
          },
          next: {
            content: this.node._content,
            rich: this.node.getRich(),
          },
        }]));
      }
    });

    const cursorEl = this.cursorEl = document.createElement('div');
    cursorEl.style.position = 'absolute';
    cursorEl.style.left = '0px';
    cursorEl.style.top = '0px';
    cursorEl.style.width = '10px';
    cursorEl.style.height = '100%';
    cursorEl.style.borderLeft = '1px solid #000';
    cursorEl.style.pointerEvents = 'none';
    containerEl.appendChild(cursorEl);

    cursorEl.animate([
      {
        visibility: 'visible',
        borderColor: '#000',
      },
      {
        visibility: 'visible',
        borderColor: '#FFF',
      },
      {
        visibility: 'hidden',
      },
      {
        visibility: 'hidden',
      },
    ], {
      duration: 800,
      iterations: Infinity,
    });

    // 点击外部会blur，当来自画布自身且编辑态需自动focus，还有来自textPanel（ignoreBlur）
    document.addEventListener('click', (e) => {
      if (listener.state === State.EDIT_TEXT) {
        let target = e.target as HTMLElement;
        let p = target as HTMLElement | null;
        while (p) {
          if (p === listener.dom || this.ignoreBlur.includes(p)) {
            // 防止来源input无法聚焦
            if (!['INPUT', 'SELECT'].includes(target.tagName.toUpperCase())) {
              this.focus();
            }
            return;
          }
          p = p.parentElement;
        }
        listener.state = State.NORMAL;
        this.hideCursor();
        this.node?.resetCursor();
        this.node?.refresh();
      }
    });
  }

  show(node: Text, x: number, y: number) {
    this.node = node;
    this.update(x, y);
    this.containerEl.style.opacity = '1';
    this.focus();
    this.showCursor();
  }

  update(x: number, y: number) {
    const dpi = this.root.dpi;
    const p = this.node!.setCursorStartByAbsCoords(x * dpi, y * dpi);
    this.containerEl.style.left = p.x / dpi + 'px';
    this.containerEl.style.top = p.y / dpi + 'px';
    this.containerEl.style.height = p.h / dpi + 'px';
  }

  hide() {
    this.containerEl.style.opacity = '0';
    this.inputEl.blur();
    this.node = undefined;
  }

  focus() {
    this.inputEl.focus();
  }

  blur() {
    this.inputEl.blur();
  }

  showCursor() {
    this.cursorEl.style.opacity = '1';
  }

  // 选区时隐藏光标但还是focus状态（外部控制）
  hideCursor() {
    this.cursorEl.style.opacity = '0';
  }

  updateCursor(p?: { x: number, y: number, h: number }) {
    p = p || this.node!.getCursorAbsCoords();
    if (p) {
      const dpi = this.root.dpi;
      this.containerEl.style.left = p.x / dpi + 'px';
      this.containerEl.style.top = p.y / dpi + 'px';
      this.containerEl.style.height = p.h / dpi + 'px';
    }
  }

  destroy() {
    this.hide();
    this.containerEl.remove();
  }
}
