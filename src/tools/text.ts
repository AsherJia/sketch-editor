import Text from '../node/Text';
import { color2hexStr } from '../style/css';
import { StyleNumValue, StyleUnit, TEXT_ALIGN } from '../style/define';
import fontInfo from '../style/font';

export enum TEXT_BEHAVIOUR {
  AUTO = 0,
  FIXED_W = 1,
  FIXED_W_H = 2,
}

export const SIZE_LIST = [
  6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 21, 24, 36, 48, 60, 72,
];

function putData(
  width: StyleNumValue,
  height: StyleNumValue,
  lh: StyleNumValue,
  valid: boolean[],
  fontFamily: string[],
  name: string[],
  color: string[],
  fontSize: number[],
  letterSpacing: number[],
  lineHeight: number[],
  paragraphSpacing: number[],
  textAlign: TEXT_ALIGN[],
  textBehaviour: TEXT_BEHAVIOUR[],
  obj: any,
) {
  let autoLineHeight = false;
  const {
    fontFamily: ff,
    color: c,
    fontSize: fs,
    letterSpacing: ls,
    lineHeight: lh2,
    paragraphSpacing: ps,
    textAlign: ta,
  } = obj;
  const ff2 = ff.toLowerCase();
  const o = fontInfo.data[ff2];
  if (o) {
    if (!fontFamily.includes(ff2)) {
      fontFamily.push(ff2);
      name.push(o.name);
    }
    valid.push(true);
  }
  else {
    if (!fontFamily.includes(ff2)) {
      fontFamily.push(ff2);
      name.push(ff2);
    }
    valid.push(false);
  }
  const cl = color2hexStr(c);
  if (!color.includes(cl)) {
    color.push(cl);
  }
  if (!fontSize.includes(fs)) {
    fontSize.push(fs);
  }
  if (!letterSpacing.includes(ls)) {
    letterSpacing.push(ls);
  }
  if (lh.u === StyleUnit.AUTO) {
    autoLineHeight = true;
  }
  if (!lineHeight.includes(lh2)) {
    lineHeight.push(lh2);
  }
  if (!paragraphSpacing.includes(ps)) {
    paragraphSpacing.push(ps);
  }
  if (!textAlign.includes(ta)) {
    textAlign.push(ta);
  }
  let tb = TEXT_BEHAVIOUR.AUTO;
  if (width.u !== StyleUnit.AUTO) {
    if (height.u !== StyleUnit.AUTO) {
      tb = TEXT_BEHAVIOUR.FIXED_W_H;
    }
    else {
      tb = TEXT_BEHAVIOUR.FIXED_W;
    }
  }
  if (!textBehaviour.includes(tb)) {
    textBehaviour.push(tb);
  }
  return { autoLineHeight };
}

export function getData(nodes: Text[]) {
  const valid: boolean[] = [];
  const fontFamily: string[] = [];
  const name: string[] = [];
  const color: string[] = [];
  const fontSize: number[] = [];
  const letterSpacing: number[] = [];
  const lineHeight: number[] = [];
  const paragraphSpacing: number[] = [];
  const textAlign: TEXT_ALIGN[] = [];
  const textBehaviour: TEXT_BEHAVIOUR[] = [];
  let autoLineHeight = false;
  for (let i = 0, len = nodes.length; i < len; i++) {
    const { rich, style, computedStyle } = nodes[i];
    const { width, height, lineHeight: lh } = style;
    if (rich && rich.length) {
      for (let i = 0, len = rich.length; i < len; i++) {
        const res = putData(
          width,
          height,
          lh,
          valid,
          fontFamily,
          name,
          color,
          fontSize,
          letterSpacing,
          lineHeight,
          paragraphSpacing,
          textAlign,
          textBehaviour,
          rich[i],
        );
        autoLineHeight = res.autoLineHeight || autoLineHeight;
      }
      continue;
    }
    const res = putData(
      width,
      height,
      lh,
      valid,
      fontFamily,
      name,
      color,
      fontSize,
      letterSpacing,
      lineHeight,
      paragraphSpacing,
      textAlign,
      textBehaviour,
      computedStyle,
    );
    autoLineHeight = res.autoLineHeight || autoLineHeight;
  }
  const { fontWeight, fontWeightList } = getWeight(fontFamily);
  return {
    valid,
    fontFamily,
    name,
    fontWeight,
    fontWeightList,
    color,
    fontSize,
    autoLineHeight,
    lineHeight,
    letterSpacing,
    paragraphSpacing,
    textAlign,
    textBehaviour,
  };
}

function getWeight(fontFamily: string[]) {
  let fontWeight: string[] = [];
  const fontWeightList: Array<{ label: string; value: string }> = [];
  fontFamily.forEach(ff => {
    const data = fontInfo.data[ff.toLowerCase()];
    if (data) {
      const list = data.list;
      for (let i = 0, len = list.length; i < len; i++) {
        const item = list[i];
        fontWeightList.push({ label: item.style, value: item.postscriptName });
        if (item.postscriptName === ff.toLowerCase()) {
          if (!fontWeight.includes(item.style)) {
            fontWeight.push(item.style);
          }
        }
      }
    }
  });
  if (!fontWeight.length) {
    fontWeight.push('Regular'); // 不支持的字体默认Regular
  }
  return { fontWeight, fontWeightList };
}

export function getBehaviour(n: number): string {
  if (n === TEXT_BEHAVIOUR.FIXED_W) {
    return '自动高度';
  }
  if (n === TEXT_BEHAVIOUR.FIXED_W_H) {
    return '固定尺寸';
  }
  return '自动宽度';
}

export function getEditData(node: Text) {
  const { rich, style } = node;
  // 一般不可能，有内容都会有个rich内容，这里兜个底，只有1个rich也复用逻辑
  if (!rich.length) {
    return getData([node]);
  }
  const valid: boolean[] = [];
  const fontFamily: string[] = [];
  const name: string[] = [];
  const color: string[] = [];
  const fontSize: number[] = [];
  const letterSpacing: number[] = [];
  const lineHeight: number[] = [];
  const paragraphSpacing: number[] = [];
  const textAlign: TEXT_ALIGN[] = [];
  const textBehaviour: TEXT_BEHAVIOUR[] = [];
  let autoLineHeight = false;
  const richList = node.getCursorRich();
  const { width, height, lineHeight: lh } = style;
  for (let i = 0, len = richList.length; i < len; i++) {
    const res = putData(
      width,
      height,
      lh,
      valid,
      fontFamily,
      name,
      color,
      fontSize,
      letterSpacing,
      lineHeight,
      paragraphSpacing,
      textAlign,
      textBehaviour,
      richList[i],
    );
    autoLineHeight = res.autoLineHeight || autoLineHeight;
  }
  const { fontWeight, fontWeightList } = getWeight(fontFamily);
  return {
    valid,
    fontFamily,
    name,
    fontWeight,
    fontWeightList,
    color,
    fontSize,
    autoLineHeight,
    lineHeight,
    letterSpacing,
    paragraphSpacing,
    textAlign,
    textBehaviour,
  };
}

export default {
  TEXT_BEHAVIOUR,
  SIZE_LIST,
  getData,
  getEditData,
  getBehaviour,
};
