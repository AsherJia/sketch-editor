import Text from '../node/Text';
import Root from '../node/Root';
import Select from './Select';

export default class Input {
  root: Root;
  dom: HTMLElement;
  select: Select;
  containerEl: HTMLDivElement;
  inputEl: HTMLInputElement;
  cursorEl: HTMLDivElement;
  node?: Text;

  constructor(root: Root, dom: HTMLElement, select: Select) {
    this.root = root;
    this.dom = dom;
    this.select = select;

    const containerEl = this.containerEl = document.createElement('div');
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
          // 回车等候一下让input先触发，输入法状态不会触发
          setTimeout(() => {
            this.node!.enter();
            this.updateCurCursor();
            this.select.updateSelect([this.node!]);
          }, 1);
        }
        else if (keyCode === 8) {
          e.stopPropagation();
          this.node!.delete();
          this.updateCurCursor();
          this.select.updateSelect([this.node]);
        }
        else if (keyCode >= 37 && keyCode <= 40) {
          this.node.moveCursor(keyCode);
          this.updateCurCursor();
        }
      }
    });
    // @ts-ignore
    inputEl.addEventListener('input', (e: InputEvent) => {
      if (!isIme) {
        if (this.node) {
          const s = e.data;
          if (s) {
            this.node.input(s);
            this.updateCurCursor();
            this.showCursor();
            inputEl.value = '';
            this.select.updateSelect([this.node]);
          }
        }
      }
    });
    inputEl.addEventListener('compositionstart', (e) => {
      isIme = true;
    });
    inputEl.addEventListener('compositionend', (e) => {
      isIme = false;
      if (this.node) {
        const s = e.data;
        this.node.input(s);
        this.updateCurCursor();
        this.showCursor();
        inputEl.value = '';
        this.select.updateSelect([this.node]);
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
      },
      {
        visibility: 'visible',
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
  }

  show(node: Text, x: number, y: number) {
    this.node = node;
    this.update(x, y);
    this.containerEl.style.opacity = '1';
    this.inputEl.focus();
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

  hideCursor() {
    this.cursorEl.style.opacity = '0';
  }

  updateCurCursor() {
    const dpi = this.root.dpi;
    const p = this.node!.getCursorAbsCoords();
    this.containerEl.style.left = p.x / dpi + 'px';
    this.containerEl.style.top = p.y / dpi + 'px';
  }

  destroy() {
    this.hide();
    this.containerEl.remove();
  }
}
