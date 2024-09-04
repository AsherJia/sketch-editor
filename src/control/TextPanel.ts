import Node from '../node/Node';
import Root from '../node/Root';
import Text from '../node/Text';
import { toPrecision } from '../math';
import style from '../style';
import { getEditTextInfo, getFontWeightList, getTextBehaviour, getTextInfo, setTextBehaviour } from '../tools/text';
import { TEXT_ALIGN, TEXT_BEHAVIOUR, TEXT_VERTICAL_ALIGN } from '../style/define';
import ResizeCommand, { CONTROL_TYPE, ResizeData } from '../history/ResizeCommand';
import UpdateRichCommand, { UpdateRichData } from '../history/UpdateRichCommand';
import VerticalAlignCommand, { VerticalAlignData } from '../history/VerticalAlignCommand';
import Listener from './Listener';
import picker from './picker';
import State from './State';
import Panel from './Panel';
import { Rich } from '../format';
import fontInfo from '../style/font';
import font from '../style/font';
import inject from '../util/inject';

const html = `
  <h4 class="panel-title">字符<b class="btn arrow"></b></h4>
  <div class="line ff">
    <select>
      <option value="arial">Arial</option>
    </select>
    <span class="multi">多种字体</span>
  </div>
  <div class="line wc">
    <div class="weight">
      <select></select>
      <span class="multi">多种字重</span>
    </div>
    <div class="color">
      <span class="picker-btn"><b class="pick">○○○</b></span>
    </div>
  </div>
  <div class="line num">
    <div class="fs">
      <input type="number" min="0" step="1"/>
      <span>字号</span>
    </div>
    <div class="ls">
      <input type="number" step="1"/>
      <span>字距</span>
    </div>
    <div class="lh">
      <input type="number" min="0" step="1"/>
      <span>行高</span>
    </div>
    <div class="ps">
      <input type="number" step="1"/>
      <span>段落</span>
    </div>
  </div>
  <div class="line wh">
    <div>
      <span class="auto" title="自动宽度"></span>
      <span class="fw" title="自动高度"></span>
      <span class="fwh" title="固定尺寸"></span>
    </div>
    <span class="txt"></span>
  </div>
  <div class="line al">
    <span class="left" title="水平左对齐"></span>
    <span class="center" title="水平居中对齐"></span>
    <span class="right" title="水平右对齐"></span>
    <span class="justify" title="水平两端对齐"></span>
  </div> 
  <div class="line va">
    <span class="top" title="垂直上对齐"></span>
    <span class="middle" title="垂直居中对齐"></span>
    <span class="bottom" title="垂直下对齐"></span>
  </div> 
`;

const KEY_INFO = 'textPanelFold';

class TextPanel extends Panel {
  panel: HTMLElement;
  nodes: Text[];

  constructor(root: Root, dom: HTMLElement, listener: Listener) {
    super(root, dom, listener);
    this.nodes = [];

    const panel = this.panel = document.createElement('div');
    panel.className = 'text-panel';
    panel.style.display = 'none';
    panel.innerHTML = html;
    this.dom.appendChild(panel);
    this.initFontList();

    const fold = localStorage.getItem(KEY_INFO);
    if (fold === '1') {
      panel.classList.add('fold');
    }

    const fs = panel.querySelector('.fs input') as HTMLInputElement;
    const ls = panel.querySelector('.ls input') as HTMLInputElement;
    const lh = panel.querySelector('.lh input') as HTMLInputElement;
    const ps = panel.querySelector('.ps input') as HTMLInputElement;
    const ff = panel.querySelector('.ff select') as HTMLSelectElement;
    const fw = panel.querySelector('.weight select') as HTMLSelectElement;

    let nodes: Text[] = [];
    let prevs: Rich[][] = [];
    let nexts: Rich[][] = [];

    // 选择颜色会刷新但不产生步骤，关闭颜色面板后才callback产生
    const pickCallback = () => {
      // 只有变更才会有next
      if (nodes.length && nexts.length) {
        listener.history.addCommand(new UpdateRichCommand(nodes, prevs.map((prev, i) => {
          return { prev, next: nexts[i] };
        }), UpdateRichCommand.COLOR));
      }
      nodes = [];
      prevs = [];
      nexts = [];
    };

    const onInput = (e: Event, key: 'fontSize' | 'letterSpacing' | 'lineHeight' | 'paragraphSpacing') => {
      this.silence = true;
      const input = e.target as HTMLInputElement;
      const value = parseFloat(input.value) || 0;
      pickCallback();
      // 连续多次只有首次记录节点和prev值，但每次都更新next值
      const isFirst = !nodes.length;
      if (isFirst) {
        prevs = [];
      }
      nexts = [];
      const isInput = e instanceof InputEvent; // 上下键还是真正输入
      if (listener.state === State.EDIT_TEXT && this.nodes.length === 1) {
        const node = this.nodes[0];
        const cursor = node.getSortedCursor();
        if (cursor.isMulti) {
          if (isFirst) {
            nodes.push(node);
            prevs.push(node.getRich());
          }
          // 按上下可能是多个值的情况
          if (!isInput) {
            let d = 0;
            if (input.placeholder) {
              d = value > 0 ? 1 : -1;
              if (listener.shiftKey) {
                d *= 10;
              }
            }
            else {
              d = value - prevs[0][0][key];
              if (listener.shiftKey) {
                d *= 10;
              }
            }
            let { start, end } = cursor;
            node.rich.forEach(rich => {
              if (rich.location < end && rich.location + rich.length > start) {
                const location = Math.max(rich.location, start);
                const len = Math.min(rich.length, end - rich.location) - (location - rich.location);
                node.updateRangeStyle(location, len, {
                  [key]: getRichKeyValue(rich, key, d),
                });
              }
            });
          }
          else {
            node.updateRangeStyle(cursor.startString, cursor.endTextBox - cursor.startString, {
              [key]: value,
            });
          }
          nexts.push(node.getRich());
        }
        else {
          node.setInputStyle({
            [key]: value,
          });
        }
      }
      else {
        this.nodes.forEach((node) => {
          if (isFirst) {
            nodes.push(node);
            prevs.push(node.getRich());
          }
          // 按上下可能是多个值的情况
          if (!isInput) {
            let d = 0;
            if (input.placeholder) {
              d = value > 0 ? 1 : -1;
              if (listener.shiftKey) {
                d *= 10;
              }
            }
            else {
              d = value - prevs[0][0][key];
              if (listener.shiftKey) {
                d *= 10;
              }
            }
            node.rich.forEach((rich) => {
              node.updateRangeStyle(rich.location, rich.length, {
                [key]: getRichKeyValue(rich, key, d),
              });
            });
          }
          // 输入统一改为单个值比较简单
          else {
            node.updateRangeStyle(0, node._content.length, {
              [key]: value,
            });
          }
          nexts.push(node.getRich());
        });
      }
      if (nodes.length) {
        listener.select.updateSelect(nodes);
        if (key === 'fontSize') {
          listener.emit(Listener.FONT_SIZE_NODE, nodes.slice(0));
        }
        else if (key === 'letterSpacing') {
          listener.emit(Listener.LETTER_SPACING_NODE, nodes.slice(0));
        }
        else if (key === 'paragraphSpacing') {
          listener.emit(Listener.PARAGRAPH_SPACING_NODE, nodes.slice(0));
        }
        else if (key === 'lineHeight') {
          listener.emit(Listener.LINE_HEIGHT_NODE, nodes.slice(0));
        }
        this.show(this.nodes);
      }
      this.silence = false;
    };

    const onChange = (key: 'fontSize' | 'letterSpacing' | 'lineHeight' | 'paragraphSpacing') => {
      if (nodes.length) {
        let type = '';
        if (key == 'fontSize') {
          type = UpdateRichCommand.FONT_SIZE;
        }
        else if (key === 'letterSpacing') {
          type = UpdateRichCommand.LETTER_SPACING;
        }
        else if (key === 'lineHeight') {
          type = UpdateRichCommand.LINE_HEIGHT;
        }
        else if (key === 'paragraphSpacing') {
          type = UpdateRichCommand.PARAGRAPH_SPACING;
        }
        listener.history.addCommand(new UpdateRichCommand(nodes, prevs.map((prev, i) => {
          return { prev, next: nexts[i] };
        }), type));
        nodes = [];
        prevs = [];
        nexts = [];
      }
    };

    fs.addEventListener('input', (e) => {
      onInput(e, 'fontSize');
    });
    ls.addEventListener('input', (e) => {
      onInput(e, 'letterSpacing');
    });
    lh.addEventListener('input', (e) => {
      onInput(e, 'lineHeight');
    });
    ps.addEventListener('input', (e) => {
      onInput(e, 'paragraphSpacing');
    });
    fs.addEventListener('change', (e) => {
      onChange('fontSize');
    });
    ls.addEventListener('change', (e) => {
      onChange('letterSpacing');
    });
    lh.addEventListener('change', (e) => {
      onChange('lineHeight');
    });
    ps.addEventListener('change', (e) => {
      onChange('paragraphSpacing');
    });

    const onSelectChange = (e: Event, key: 'fontFamily' | 'fontWeight') => {
      this.silence = true;
      const select = e.target as HTMLSelectElement;
      const value = select.value;
      const nodes = this.nodes.slice(0);
      if (key === 'fontFamily') {
        const multi = panel.querySelector('.ff .multi') as HTMLElement;
        multi.style.display = 'none';
        const fontWeightList = getFontWeightList(value);
        const select = panel.querySelector('.wc select') as HTMLSelectElement;
        let s = '';
        fontWeightList.forEach((item) => {
          s += `<option value="${item.value}">${item.label}</option>`;
        });
        select.innerHTML = s;
        // 暂时切换后统一Regular，如果没有则第一个
        let ff = fontWeightList[0].value;
        for (let i = 0, len = fontWeightList.length; i < len; i++) {
          const item = fontWeightList[i];
          if (item.label.toLowerCase() === 'regular') {
            ff = item.value;
            break;
          }
        }
        select.value = ff;
        select.disabled = false;
        const data: UpdateRichData[] = [];
        if (listener.state === State.EDIT_TEXT && this.nodes.length === 1) {
          const node = nodes[0];
          const cursor = node.getSortedCursor();
          if (cursor.isMulti) {
            const prev = node.getRich();
            node.updateRangeStyle(cursor.start, cursor.end - cursor.start, {
              fontFamily: ff,
            });
            data.push({ prev, next: node.getRich() });
          }
          else {
            node.setInputStyle({
              fontFamily: ff,
            });
          }
        }
        else {
          nodes.forEach(node => {
            const prev = node.getRich();
            node.updateRangeStyle(0, node._content.length, {
              fontFamily: ff,
            });
            data.push({ prev, next: node.getRich() });
          });
        }
        if (data.length) {
          listener.history.addCommand(new UpdateRichCommand(nodes, data, UpdateRichCommand.FONT_FAMILY));
          listener.select.updateSelect(nodes);
          listener.emit(Listener.FONT_FAMILY_NODE, nodes.slice(0));
        }
      }
      else if (key === 'fontWeight') {
        const multi = panel.querySelector('.wc .multi') as HTMLElement;
        multi.style.display = 'none';
        const option = select.querySelector(':disabled') as HTMLOptionElement;
        if (option) {
          option.remove();
        }
        const data: UpdateRichData[] = [];
        if (listener.state === State.EDIT_TEXT && this.nodes.length === 1) {
          const node = nodes[0];
          const cursor = node.getSortedCursor();
          if (cursor.isMulti) {
            const prev = node.getRich();
            node.updateRangeStyle(cursor.start, cursor.end - cursor.start, {
              fontFamily: value,
            });
            data.push({ prev, next: node.getRich() });
          }
          else {
            node.setInputStyle({
              fontFamily: value,
            });
          }
        }
        else {
          nodes.forEach(node => {
            const prev = node.getRich();
            node.updateRangeStyle(0, node._content.length, {
              fontFamily: value,
            });
            data.push({ prev, next: node.getRich() });
          });
        }
        if (data.length) {
          listener.history.addCommand(new UpdateRichCommand(nodes, data, UpdateRichCommand.FONT_FAMILY));
          listener.select.updateSelect(nodes);
          listener.emit(Listener.FONT_FAMILY_NODE, nodes.slice(0));
        }
      }
      this.silence = false;
    };

    ff.addEventListener('change', (e) => {
      onSelectChange(e, 'fontFamily');
    });
    fw.addEventListener('change', (e) => {
      onSelectChange(e, 'fontWeight');
    });

    panel.addEventListener('click', (e) => {
      this.silence = true;
      const el = e.target as HTMLElement;
      const classList = el.classList;
      if (classList.contains('pick')) {
        // picker侦听了document全局click隐藏窗口，这里停止向上冒泡
        e.stopPropagation();
        if (picker.isShowFrom('textPanel')) {
          picker.hide();
          pickCallback();
          this.silence = false;
          return;
        }
        const p = picker.show(el, 'textPanel', pickCallback, true);
        // 最开始记录nodes/prevs
        nodes = this.nodes.slice(0);
        prevs = nodes.map(item => item.getRich());
        // 每次变更记录更新nexts
        p.onChange = (color: any) => {
          nexts = [];
          if (listener.state === State.EDIT_TEXT && nodes.length === 1) {
            const node = nodes[0];
            const cursor = node.getSortedCursor();
            if (cursor.isMulti) {
              node.updateRangeStyle(cursor.start, cursor.end - cursor.start, {
                color: color.rgba.slice(0),
              });
              nexts.push(node.getRich());
            }
            else {
              node.setInputStyle({
                color: color.rgba.slice(0),
              });
            }
          }
          else {
            nodes.forEach(node => {
              node.updateRangeStyle(0, node._content.length, {
                color: color.rgba.slice(0),
              });
              nexts.push(node.getRich());
            });
          }
        };
        p.onDone = () => {
          picker.hide();
          pickCallback();
        };
      }
      else if (classList.contains('arrow')) {
        if (panel.classList.contains('fold')) {
          panel.classList.remove('fold');
          localStorage.removeItem(KEY_INFO);
        }
        else {
          panel.classList.add('fold');
          localStorage.setItem(KEY_INFO, '1');
        }
      }
      // 尺寸固定模式
      else if ((classList.contains('auto') || classList.contains('fw') || classList.contains('fwh'))
        && !classList.contains('cur')) {
        pickCallback();
        nodes = this.nodes.slice(0);
        let next = TEXT_BEHAVIOUR.AUTO;
        if (classList.contains('fw')) {
          next = TEXT_BEHAVIOUR.FIXED_W;
        }
        else if (classList.contains('fwh')) {
          next = TEXT_BEHAVIOUR.FIXED_W_H;
        }
        const data: ResizeData[] = [];
        nodes.map(item => {
          const { width, height } = item;
          const tb = getTextBehaviour(item);
          setTextBehaviour(item, next);
          const dx = item.width - width;
          const dy = item.height - height;
          const rd: ResizeData = {
            dx,
            dy,
            controlType: CONTROL_TYPE.BR,
            aspectRatio: false,
            fromCenter: false,
          };
          if (tb === TEXT_BEHAVIOUR.AUTO) {
            rd.widthFromAuto = true;
            rd.heightFromAuto = true;
          }
          else if (tb === TEXT_BEHAVIOUR.FIXED_W) {
            rd.heightFromAuto = true;
          }
          if (next === TEXT_BEHAVIOUR.AUTO) {
            rd.widthToAuto = true;
            rd.heightToAuto = true;
          }
          else if (next === TEXT_BEHAVIOUR.FIXED_W) {
            rd.heightToAuto = true;
          }
          data.push(rd);
        });
        listener.history.addCommand(new ResizeCommand(nodes, data));
        listener.select.updateSelect(nodes);
        listener.emit(Listener.RESIZE_NODE, nodes.slice(0));
        dom.querySelector('.wh .cur')?.classList.remove('cur');
        classList.add('cur');
        dom.querySelector('.wh .txt')!.innerHTML = el.title;
      }
      // 左右对齐
      else if ((classList.contains('left') || classList.contains('right') || classList.contains('center') || el.classList.contains('justify'))
        && !classList.contains('cur')) {
        pickCallback();
        const nodes = this.nodes.slice(0);
        let value = TEXT_ALIGN.LEFT;
        if (classList.contains('right')) {
          value = TEXT_ALIGN.RIGHT;
        }
        else if (classList.contains('center')) {
          value = TEXT_ALIGN.CENTER;
        }
        else if (classList.contains('justify')) {
          value = TEXT_ALIGN.JUSTIFY;
        }
        const data: UpdateRichData[] = [];
        // 编辑状态下特殊处理，只有\n造成的lineBox才会局部生效，否则向首尾扩展直至整个text
        if (nodes.length === 1 && listener.state === State.EDIT_TEXT) {
          const node = nodes[0];
          const { content } = node;
          const cursor = node.getSortedCursor();
          let { start, end } = cursor;
          start = content.lastIndexOf('\n', start);
          if (start < 0) {
            start = 0;
          }
          else {
            start++;
          }
          end = content.indexOf('\n', end);
          if (end < 0) {
            end = content.length;
          }
          const prev = node.getRich();
          node.updateRangeStyle(start, end - start, {
            textAlign: value,
          });
          data.push({ prev, next: node.getRich() });
          if (!cursor.isMulti) {
            const p = node.updateCursorByIndex(cursor.start);
            listener.input.updateCursor(p);
          }
        }
        // 普通状态
        else {
          nodes.forEach(node => {
            const prev = node.getRich();
            node.updateRangeStyle(0, node._content.length, {
              textAlign: value,
            });
            data.push({ prev, next: node.getRich() });
          });
        }
        if (data.length) {
          listener.history.addCommand(new UpdateRichCommand(nodes, data, UpdateRichCommand.TEXT_ALIGN));
          listener.emit(Listener.TEXT_ALIGN_NODE, nodes.slice(0));
        }
        dom.querySelector('.al .cur')?.classList.remove('cur');
        classList.add('cur');
      }
      // 上下对齐
      else if ((classList.contains('top') || classList.contains('bottom') || classList.contains('middle'))
        && !classList.contains('cur')) {
        pickCallback();
        const nodes = this.nodes.slice(0);
        let value: 'top' | 'middle' | 'bottom' = 'top';
        if (classList.contains('middle')) {
          value = 'middle';
        }
        else if (classList.contains('bottom')) {
          value = 'bottom';
        }
        const data: VerticalAlignData[] = [];
        nodes.forEach(node => {
          const tva = node.computedStyle.textVerticalAlign;
          let prev: 'top' | 'middle' | 'bottom' = 'top';
          if (tva === TEXT_VERTICAL_ALIGN.MIDDLE) {
            prev = 'middle';
          }
          else if (tva === TEXT_VERTICAL_ALIGN.BOTTOM) {
            prev = 'bottom';
          }
          node.updateStyle({
            textVerticalAlign: value,
          });
          data.push({
            prev: { textVerticalAlign: prev },
            next: { textVerticalAlign: value },
          });
        });
        listener.history.addCommand(new VerticalAlignCommand(nodes, data));
        listener.emit(Listener.TEXT_VERTICAL_ALIGN_NODE, nodes.slice(0));
        dom.querySelector('.va .cur')?.classList.remove('cur');
        classList.add('cur');
      }
      this.silence = false;
    });

    listener.on([
      Listener.SELECT_NODE,
      Listener.RESIZE_NODE,
      Listener.FONT_SIZE_NODE,
      Listener.FONT_FAMILY_NODE,
      Listener.LETTER_SPACING_NODE,
      Listener.LINE_HEIGHT_NODE,
      Listener.PARAGRAPH_SPACING_NODE,
      Listener.COLOR_NODE,
      Listener.TEXT_ALIGN_NODE,
      Listener.TEXT_VERTICAL_ALIGN_NODE,
      Listener.ADD_NODE,
      Listener.CURSOR_NODE,
    ], (nodes: Node[]) => {
      // 输入的时候，防止重复触发；选择/undo/redo的时候则更新显示
      if (this.silence) {
        return;
      }
      this.show(nodes);
    });
    listener.on(Listener.REMOVE_NODE, () => {
      if (this.silence) {
        return;
      }
      this.show([]);
    });
  }

  initFontList(names?: string[]) {
    const { info, data } = style.font;
    const hash: Record<string, boolean> = {};
    if (names && names.length) {
      names.forEach((name) => {
        // family
        if (info.hasOwnProperty(name)) {
          hash[name] = true;
        }
        // postscriptName
        else if (data.hasOwnProperty(name)) {
          hash[data[name].family] = true;
        }
      });
    }
    let s = '';
    for (let i in info) {
      if (info.hasOwnProperty(i)) {
        if (names && names.length) {
          if (!hash.hasOwnProperty(i)) {
            continue;
          }
        }
        const item = info[i];
        const list = item.list || [];
        if (list.length) {
          s += `<option value="${i}">${item.name || i}</option>`;
        }
      }
    }
    const select = this.panel.querySelector('select') as HTMLSelectElement;
    select.innerHTML = s;
  }

  show(nodes: Node[]) {
    const panel = this.panel;
    let willShow = false;
    for (let i = 0, len = nodes.length; i < len; i++) {
      const item = nodes[i];
      if (item instanceof Text) {
        willShow = true;
        break;
      }
    }
    if (!willShow) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = 'block';
    panel.querySelectorAll('input').forEach(item => {
      item.disabled = false;
      item.placeholder = '';
    });
    const texts = nodes.filter(item => item instanceof Text) as Text[];
    this.nodes = texts;
    const isEditText = this.listener.state === State.EDIT_TEXT && nodes.length === 1;
    const o = isEditText ? getEditTextInfo(texts[0]) : getTextInfo(texts);
    {
      const select = panel.querySelector('.ff select') as HTMLSelectElement;
      // 移除上次可能遗留的无效字体展示
      const option = select.querySelector(':disabled') as HTMLOptionElement;
      if (option) {
        option.remove();
      }
      const multi = panel.querySelector('.ff .multi') as HTMLElement;
      const list = select.querySelectorAll('option');
      for (let i = 0, len = list.length; i < len; i++) {
        const option = list[i];
        if (option.selected) {
          option.selected = false;
          break;
        }
      }
      // 多种字体
      if (o.fontFamily.length > 1) {
        multi.innerText = '多种字体';
        multi.style.display = 'block';
        multi.classList.remove('invalid');
        const option = `<option value="" selected="selected" disabled>多种字体</option>`;
        select.innerHTML += option;
      }
      else {
        if (!o.valid[0]) {
          multi.innerText = o.fontFamily[0];
          multi.classList.add('invalid');
          multi.style.display = 'block';
          const option = `<option value="${o.postscriptName[0]}" selected="selected" disabled>${o.fontFamily[0]}</option>`;
          select.innerHTML += option;
        }
        else {
          multi.style.display = 'none';
          multi.classList.remove('invalid');
          select.value = o.fontFamily[0];
        }
      }
    }
    {
      const select = panel.querySelector('.wc select') as HTMLSelectElement;
      // 移除上次可能遗留的无效字重展示
      const option = select.querySelector(':disabled') as HTMLOptionElement;
      if (option) {
        option.remove();
      }
      let s = '';
      o.fontWeightList.forEach(item => {
        s += `<option value="${item.value}">${item.label}</option>`;
      });
      select.innerHTML = s;
      const multi = panel.querySelector('.wc .multi') as HTMLElement;
      if (o.fontWeight.length > 1) {
        multi.style.display = 'block';
        const option = `<option value="" selected="selected" disabled>多种字体</option>`;
        select.innerHTML += option;
      }
      else {
        multi.style.display = 'none';
        const list = select.querySelectorAll('option');
        for (let i = 0, len = list.length; i < len; i++) {
          const option = list[i];
          if (option.innerHTML === o.fontWeight[0]) {
            option.selected = true;
            break;
          }
        }
      }
      select.disabled = !(o.valid.length === 1 && o.valid[0]);
    }
    {
      const color = panel.querySelector('.color b') as HTMLElement;
      if (o.color.length > 1) {
        color.style.background = '';
        color.classList.add('multi');
      }
      else {
        color.style.background = o.color[0];
        color.classList.remove('multi');
      }
      color.setAttribute('color', o.color[0]);
    }
    {
      const input = panel.querySelector('.fs input') as HTMLInputElement;
      if (o.fontSize.length > 1) {
        input.value = '';
        input.placeholder = '多个';
      }
      else {
        input.value = toPrecision(o.fontSize[0] || 0, 2).toString();
        input.placeholder = '';
      }
    }
    {
      const input = panel.querySelector('.ls input') as HTMLInputElement;
      if (o.letterSpacing.length > 1) {
        input.value = '';
        input.placeholder = '多个';
      }
      else {
        input.value = toPrecision(o.letterSpacing[0] || 0, 2).toString();
        input.placeholder = '';
      }
    }
    {
      const input = panel.querySelector('.lh input') as HTMLInputElement;
      if (o.lineHeight.length > 1) {
        input.value = '';
        input.placeholder = '多个';
      }
      else {
        if (o.autoLineHeight[0]) {
          input.value = '';
          input.placeholder = toPrecision(o.lineHeight[0] || 0, 2).toString();
        }
        else {
          input.value = toPrecision(o.lineHeight[0] || 0, 2).toString();
          input.placeholder = '';
        }
      }
    }
    {
      const input = panel.querySelector('.ps input') as HTMLInputElement;
      if (o.paragraphSpacing.length > 1) {
        input.value = '';
        input.placeholder = '多个';
      }
      else {
        input.value = toPrecision(o.paragraphSpacing[0] || 0, 2).toString();
        input.placeholder = '';
      }
    }
    {
      const span = panel.querySelector('.wh .cur') as HTMLElement;
      if (span) {
        span.classList.remove('cur');
      }
      const txt = panel.querySelector('.wh .txt') as HTMLSpanElement;
      if (o.textBehaviour.length === 1) {
        const tb = o.textBehaviour[0];
        if (tb === TEXT_BEHAVIOUR.AUTO) {
          panel.querySelector('.wh .auto')!.classList.add('cur');
          txt.innerHTML = '自动宽度';
        }
        else if (tb === TEXT_BEHAVIOUR.FIXED_W) {
          panel.querySelector('.wh .fw')!.classList.add('cur');
          txt.innerHTML = '自动高度';
        }
        else if (tb === TEXT_BEHAVIOUR.FIXED_W_H) {
          panel.querySelector('.wh .fwh')!.classList.add('cur');
          txt.innerHTML = '固定尺寸';
        }
      }
      else {
        txt.innerHTML = '多种';
      }
    }
    {
      const span = panel.querySelector('.al .cur') as HTMLElement;
      if (span) {
        span.classList.remove('cur');
      }
      if (o.textAlign.length === 1) {
        const ta = o.textAlign[0];
        if (ta === TEXT_ALIGN.LEFT) {
          panel.querySelector('.al .left')!.classList.add('cur');
        }
        else if (ta === TEXT_ALIGN.CENTER) {
          panel.querySelector('.al .center')!.classList.add('cur');
        }
        else if (ta === TEXT_ALIGN.RIGHT) {
          panel.querySelector('.al .right')!.classList.add('cur');
        }
        else if (ta === TEXT_ALIGN.JUSTIFY) {
          panel.querySelector('.al .justify')!.classList.add('cur');
        }
      }
    }
    {
      const span = panel.querySelector('.va .cur') as HTMLElement;
      if (span) {
        span.classList.remove('cur');
      }
      if (o.textVerticalAlign.length === 1) {
        const tva = o.textVerticalAlign[0];
        if (tva === TEXT_VERTICAL_ALIGN.TOP) {
          panel.querySelector('.va .top')!.classList.add('cur');
        }
        else if (tva === TEXT_VERTICAL_ALIGN.MIDDLE) {
          panel.querySelector('.va .middle')!.classList.add('cur');
        }
        else if (tva === TEXT_VERTICAL_ALIGN.BOTTOM) {
          panel.querySelector('.va .bottom')!.classList.add('cur');
        }
      }
    }
  }
}

function getRichKeyValue(rich: Rich, key: 'fontSize' | 'letterSpacing' | 'lineHeight' | 'paragraphSpacing', d: number) {
  let p = rich[key];
  // 0表示auto，需从fontFamily何fontSize自动计算
  if (!p && key === 'lineHeight') {
    const data = fontInfo.data[rich.fontFamily];
    if (data) {
      p = rich.fontSize * data.lhr;
    }
    // 兜底防止没有
    else {
      p = rich.fontSize * (font.data[inject.defaultFontFamily] || font.data.arial).lhr;
    }
  }
  let n = p + d;
  if (key === 'fontSize' || key === 'lineHeight') {
    n = Math.max(0, n);
  }
  return n;
}

export default TextPanel;
