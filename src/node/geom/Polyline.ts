import Geom from './Geom';
import { Point, PolylineProps } from '../../format';
import CanvasCache from '../../refresh/CanvasCache';
import { color2rgbaStr } from '../../style/css';
import { canvasPolygon } from '../../refresh/paint';
import { getLinear } from '../../style/gradient';
import { angleBySides, pointsDistance, toPrecision } from '../../math/geom';
import { unitize } from '../../math/vector';
import { CURVE_MODE, MASK, STROKE_LINE_CAP, STROKE_LINE_JOIN, STROKE_POSITION } from '../../style/define';
import { clone } from '../../util';
import inject, { OffScreen } from '../../util/inject';

function isCornerPoint(point: Point) {
  return point.curveMode === CURVE_MODE.STRAIGHT && point.cornerRadius > 0;
}

class Polyline extends Geom {
  isClosed: boolean;
  constructor(props: PolylineProps) {
    super(props);
    this.isClosed = props.isClosed;
  }

  override calContent(): boolean {
    this.buildPoints();
    return this.hasContent = !!this.points && this.points.length > 1;
  }

  override buildPoints() {
    if (this.points) {
      return;
    }
    this.textureOutline?.release();
    const props = this.props as PolylineProps;
    const { width, height } = this;
    const temp: Array<any> = [];
    const points = props.points;
    let hasCorner = false;
    // 先算出真实尺寸，按w/h把[0,1]坐标转换
    for (let i = 0, len = points.length; i < len; i++) {
      const item = points[i];
      const res: Point = clone(item);
      res.x = res.x * width;
      res.y = res.y * height;
      if (isCornerPoint(item)) {
        hasCorner = true;
      }
      else {
        if (res.hasCurveTo) {
          res.tx = res.tx * width;
          res.ty = res.ty * height;
        }
        if (res.hasCurveFrom) {
          res.fx = res.fx * width;
          res.fy = res.fy * height;
        }
      }
      temp.push(res);
    }
    // 如果有圆角，拟合画圆
    const cache: Array<any> = [];
    if (hasCorner) {
      // 倒序将圆角点拆分为2个顶点
      for (let i = 0, len = temp.length; i < len; i++) {
        const point = temp[i];
        if (!isCornerPoint(point)) {
          continue;
        }
        // 观察前后2个顶点的情况
        const prevIdx = i ? (i - 1) : (len - 1);
        const nextIdx = (i + 1) % len;
        const prevPoint = temp[prevIdx];
        const nextPoint = temp[nextIdx];
        let radius = point.cornerRadius;
        // 看前后2点是否也设置了圆角，相邻的圆角强制要求2点之间必须是直线，有一方是曲线的话走离散近似解
        const isPrevCorner = isCornerPoint(prevPoint);
        const isPrevStraight = isPrevCorner
          || prevPoint.curveMode === CURVE_MODE.STRAIGHT
          || !prevPoint.hasCurveFrom;
        const isNextCorner = isCornerPoint(nextPoint);
        const isNextStraight = isNextCorner
          || nextPoint.curveMode === CURVE_MODE.STRAIGHT
          || !nextPoint.hasCurveTo;
        // 先看最普通的直线，可以用角平分线+半径最小值约束求解
        if (isPrevStraight && isNextStraight) {
          // 2直线边长，ABC3个点，A是prev，B是curr，C是next
          const lenAB = pointsDistance(prevPoint.x, prevPoint.y, point.x, point.y);
          const lenBC = pointsDistance(point.x, point.y, nextPoint.x, nextPoint.y);
          const lenAC = pointsDistance(prevPoint.x, prevPoint.y, nextPoint.x, nextPoint.y);
          // 三点之间的夹角
          const radian = angleBySides(lenAC, lenAB, lenBC);
          // 计算切点距离
          const tangent = Math.tan(radian * 0.5);
          let dist = radius / tangent;
          // 校准 dist，用户设置的 cornerRadius 可能太大，而实际显示 cornerRadius 受到 AB BC 两边长度限制。
          // 如果 B C 端点设置了 cornerRadius，可用长度减半
          const minDist = Math.min(
            isPrevCorner ? lenAB * 0.5 : lenAB,
            isNextCorner ? lenBC * 0.5 : lenBC,
          );
          if (dist > minDist) {
            dist = minDist;
            radius = dist * tangent;
          }
          // 方向向量
          const px = prevPoint.x - point.x, py = prevPoint.y - point.y;
          const pv = unitize(px, py);
          const nx = nextPoint.x - point.x, ny = nextPoint.y - point.y;
          const nv = unitize(nx, ny);
          // 相切的点
          const prevTangent = { x: pv.x * dist, y: pv.y * dist };
          prevTangent.x += temp[i].x;
          prevTangent.y += temp[i].y;
          const nextTangent = { x: nv.x * dist, y: nv.y * dist };
          nextTangent.x += temp[i].x;
          nextTangent.y += temp[i].y;
          // 计算 cubic handler 位置
          const kappa = (4 / 3) * Math.tan((Math.PI - radian) / 4);
          const prevHandle = { x: pv.x * -radius * kappa, y: pv.y * -radius * kappa };
          prevHandle.x += prevTangent.x;
          prevHandle.y += prevTangent.y;
          const nextHandle = { x: nv.x * -radius * kappa, y: nv.y * -radius * kappa };
          nextHandle.x += nextTangent.x;
          nextHandle.y += nextTangent.y;
          cache[i] = {
            prevTangent,
            prevHandle,
            nextTangent,
            nextHandle,
          };
        }
        // 两边只要有贝塞尔（一定是2阶），就只能用离散来逼近求圆心路径，两边中的直线则能直接求，2个圆心路径交点为所需圆心坐标
        else {
          // TODO
        }
      }
    }
    // 将圆角的2个点替换掉原本的1个点
    for(let i = 0, len = temp.length; i < len; i++) {
      const c = cache[i];
      if (c) {
        const { prevTangent, prevHandle, nextTangent, nextHandle } = c;
        const p: Point = {
          x: prevTangent.x,
          y: prevTangent.y,
          cornerRadius: 0,
          curveMode: 0,
          hasCurveFrom: true,
          fx: prevHandle.x,
          fy: prevHandle.y,
          hasCurveTo: false,
          tx: 0,
          ty: 0,
        };
        const n: Point = {
          x: nextTangent.x,
          y: nextTangent.y,
          cornerRadius: 0,
          curveMode: 0,
          hasCurveFrom: false,
          fx: 0,
          fy: 0,
          hasCurveTo: true,
          tx: nextHandle.x,
          ty: nextHandle.y,
        };
        temp.splice(i, 1, p, n);
        i++;
        len++;
        cache.splice(i, 0, undefined);
      }
    }
    // 换算为容易渲染的方式，[cx1?, cy1?, cx2?, cy2?, x, y]，贝塞尔控制点是前面的到当前的，保留4位小数防止精度问题
    const first = temp[0];
    const p: Array<number> = [first.x, first.y];
    const res: Array<Array<number>> = [p], len = temp.length;
    for (let i = 1; i < len; i++) {
      const item = temp[i];
      const prev = temp[i - 1];
      const p: Array<number> = [toPrecision(item.x), toPrecision(item.y)];
      if (item.hasCurveTo) {
        p.unshift(toPrecision(item.tx), toPrecision(item.ty));
      }
      if (prev.hasCurveFrom) {
        p.unshift(toPrecision(prev.fx), toPrecision(prev.fy));
      }
      res.push(p);
    }
    // 闭合
    if (this.isClosed) {
      const last = temp[len - 1];
      const p: Array<number> = [toPrecision(first.x), toPrecision(first.y)];
      if (first.hasCurveTo) {
        p.unshift(toPrecision(first.tx), toPrecision(first.ty));
      }
      if (last.hasCurveFrom) {
        p.unshift(toPrecision(last.fx), toPrecision(last.fy));
      }
      res.push(p);
    }
    this.points = res;
  }

  override renderCanvas() {
    super.renderCanvas();
    this.buildPoints();
    const points = this.points!;
    const bbox = this._bbox || this.bbox;
    const x = bbox[0], y = bbox[1], w = bbox[2] - x, h = bbox[3] - y;
    const canvasCache = this.canvasCache = CanvasCache.getInstance(w, h, x, y);
    canvasCache.available = true;
    const ctx = canvasCache.offscreen.ctx;
    const {
      fill,
      fillEnable,
      stroke,
      strokeEnable,
      strokeWidth,
      strokePosition,
      strokeDasharray,
      strokeLinecap,
      strokeLinejoin,
      strokeMiterlimit,
    } = this.computedStyle;
    ctx.setLineDash(strokeDasharray);
    // 先下层的fill
    for (let i = 0, len = fill.length; i < len; i++) {
      if (!fillEnable[i]) {
        continue;
      }
      const f = fill[i];
      if (Array.isArray(f)) {
        if (!f[3]) {
          continue;
        }
        ctx.fillStyle = color2rgbaStr(f);
      }
      else {
        const gd = getLinear(f.stops, f.d, 0, 0, this.width, this.height, -x, -y);
        const lg = ctx.createLinearGradient(gd.x1, gd.y1, gd.x2, gd.y2);
        gd.stop.forEach(item => {
          lg.addColorStop(item[1]!, color2rgbaStr(item[0]));
        });
        ctx.fillStyle = lg;
      }
      canvasPolygon(ctx, points, -x, -y);
      if (this.isClosed) {
        ctx.closePath();
      }
      ctx.fill();
    }
    // 线帽设置
    if (strokeLinecap === STROKE_LINE_CAP.ROUND) {
      ctx.lineCap = 'round';
    }
    else if (strokeLinecap === STROKE_LINE_CAP.SQUARE) {
      ctx.lineCap = 'square';
    }
    else {
      ctx.lineCap = 'butt';
    }
    if (strokeLinejoin === STROKE_LINE_JOIN.ROUND) {
      ctx.lineJoin = 'round';
    }
    else if (strokeLinejoin === STROKE_LINE_JOIN.BEVEL) {
      ctx.lineJoin = 'bevel';
    }
    else {
      ctx.lineJoin = 'miter';
    }
    ctx.miterLimit = strokeMiterlimit;
    // 再上层的stroke
    for (let i = 0, len = stroke.length; i < len; i++) {
      if (!strokeEnable[i] || !strokeWidth[i]) {
        continue;
      }
      const s = stroke[i];
      if (Array.isArray(s)) {
        ctx.strokeStyle = color2rgbaStr(s);
      }
      else {
        const gd = getLinear(s.stops, s.d, 0, 0, this.width, this.height, -x, -y);
        const lg = ctx.createLinearGradient(gd.x1, gd.y1, gd.x2, gd.y2);
        gd.stop.forEach(item => {
          lg.addColorStop(item[1]!, color2rgbaStr(item[0]));
        });
        ctx.strokeStyle = lg;
      }
      // 注意canvas只有居中描边，内部需用clip模拟，外部比较复杂需离屏擦除
      const p = strokePosition[i];
      let os: OffScreen | undefined, ctx2: CanvasRenderingContext2D | undefined;
      if (p === STROKE_POSITION.INSIDE) {
        ctx.lineWidth = strokeWidth[i] * 2;
        canvasPolygon(ctx, points, -x, -y);
      }
      else if (p === STROKE_POSITION.OUTSIDE) {
        os = inject.getOffscreenCanvas(w, h, 'outsideStroke');
        ctx2 = os.ctx;
        ctx2.setLineDash(strokeDasharray);
        ctx2.lineCap = ctx.lineCap;
        ctx2.lineJoin = ctx.lineJoin;
        ctx2.miterLimit = ctx.miterLimit;
        ctx2.strokeStyle = ctx.strokeStyle;
        ctx2.lineWidth = strokeWidth[i] * 2;
        canvasPolygon(ctx2, points, -x, -y);
      }
      else {
        ctx.lineWidth = strokeWidth[i];
        canvasPolygon(ctx, points, -x, -y);
      }
      if (this.isClosed) {
        if (ctx2) {
          ctx2.closePath();
        }
        else {
          ctx.closePath();
        }
      }
      if (p === STROKE_POSITION.INSIDE) {
        ctx.save();
        ctx.clip();
        ctx.stroke();
        ctx.restore();
      }
      else if (p === STROKE_POSITION.OUTSIDE) {
        ctx2!.stroke();
        ctx2!.save();
        ctx2!.clip();
        ctx2!.globalCompositeOperation = 'destination-out';
        ctx2!.strokeStyle = '#FFF';
        ctx2!.stroke();
        ctx2!.restore();
        ctx.drawImage(os!.canvas, 0, 0);
        os!.release();
      }
      else {
        ctx.stroke();
      }
    }
  }

  toSvg(scale: number) {
    return super.toSvg(scale, this.isClosed);
  }

  override get bbox(): Float64Array {
    if (!this._bbox) {
      const bbox = this._bbox = super.bbox;
      // 可能不存在
      this.buildPoints();
      const { strokeWidth, strokeEnable, strokePosition } = this.computedStyle;
      // 所有描边最大值，影响bbox，注意轮廓模板忽略外边
      let border = 0;
      if (this.computedStyle.maskMode !== MASK.OUTLINE) {
        strokeWidth.forEach((item, i) => {
          if (strokeEnable[i]) {
            if (strokePosition[i] === STROKE_POSITION.CENTER) {
              border = Math.max(border, item * 0.5);
            }
            else if (strokePosition[i] === STROKE_POSITION.INSIDE) {
              // 0
            }
            else if (strokePosition[i] === STROKE_POSITION.OUTSIDE) {
              border = Math.max(border, item);
            }
          }
        });
      }
      const points = this.points!;
      const first = points[0];
      let xa: number, ya: number;
      if (first.length === 4) {
        xa = first[2];
        ya = first[3];
      }
      else if (first.length === 6) {
        xa = first[4];
        ya = first[5];
      }
      else {
        xa = first[0];
        ya = first[1];
      }
      bbox[0] = Math.min(bbox[0], xa - border);
      bbox[1] = Math.min(bbox[1], ya - border);
      bbox[2] = Math.max(bbox[2], xa + border);
      bbox[3] = Math.max(bbox[3], ya + border);
      for (let i = 1, len = points.length; i < len; i++) {
        const item = points[i];
        let xb: number, yb: number;
        if (item.length === 4) {}
        else if (item.length === 6) {}
        else {
          xb = item[0];
          yb = item[1];
          bbox[0] = Math.min(bbox[0], xb - border);
          bbox[1] = Math.min(bbox[1], yb - border);
          bbox[2] = Math.max(bbox[2], xb + border);
          bbox[3] = Math.max(bbox[3], yb + border);
        }
        xa = xb!;
        ya = yb!;
      }
    }
    return this._bbox;
  }
}

export default Polyline;
