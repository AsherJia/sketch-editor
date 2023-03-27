import { JFile, getDefaultStyle } from './format';
import { isNumber } from './util/type';
import Root from './node/Root';
import Page from './node/Page';
import ArtBoard from './node/ArtBoard';
import Group from './node/Group';
import Container from './node/Container';
import { openAndConvertSketchBuffer } from './format/sketch';

function apply(json: any, imgs: Array<string>): any {
  if (!json) {
    return;
  }
  if (Array.isArray(json)) {
    return json.map(item => apply(item, imgs));
  }
  const { type, props = {}, children = [] } = json;
  if (type === 'Bitmap') {
    const src = props.src;
    if (isNumber(src)) {
      props.src = imgs[src];
    }
  }
  if (children.length) {
    json.children = apply(children, imgs);
  }
  return json;
}

export default {
  parse(json: JFile, canvas: HTMLCanvasElement) {
    // json中的imgs下标替换
    json.pages = apply(json.pages, json.imgs);
    const { width, height } = canvas;
    const root = new Root(canvas, {
      name: 'Root',
      style: getDefaultStyle({
        width,
        height,
      }),
    });
    root.setJPages(json.pages);
    root.setPageIndex(0);
    return root;
  },
  openAndConvertSketchBuffer,
  Page,
  ArtBoard,
  Group,
  Container,
};
