import Node from './Node';
import { BitmapProps } from '../format';
import inject from '../util/inject';
import { isFunction } from '../util/type';
import Container from '../node/Container';
import { LayoutData } from './layout';
import { StyleKey } from '../style';
import { RefreshLevel } from '../refresh/level';
import TextureCache from '../refresh/TextureCache';

type Loader = {
  error: boolean,
  loading: boolean,
  src?: string,
  source?: HTMLImageElement,
  width: number,
  height: number,
  onlyImg: boolean,
};

class Bitmap extends Node {
  src: string | undefined;
  loader: Loader;

  constructor(name: string, props: BitmapProps) {
    super(name, props);
    const src = this.src = props.src;
    this.loader = {
      error: false,
      loading: false,
      src,
      width: 0,
      height: 0,
      onlyImg: true,
    };
    if (!src) {
      this.loader.error = true;
    }
    else {
      const cache = inject.IMG[src];
      if (!cache) {
        inject.measureImg(src, (res: any) => {
          // 可能会变更，所以加载完后对比下是不是当前最新的
          if (src === this.loader.src) {
            if (res.success) {
              if (isFunction(props.onLoad)) {
                props.onLoad!();
              }
            }
            else {
              if (isFunction(props.onError)) {
                props.onError!();
              }
            }
          }
        });
      }
      else if (cache.state === inject.LOADED) {
        if (cache.success) {
          this.loader.source = cache.source;
          this.loader.width = cache.source.width;
          this.loader.height = cache.source.height;
        }
        else {
          this.loader.error = true;
        }
      }
    }
  }

  layout(container: Container, data: LayoutData) {
    super.layout(container, data);
    const src = this.loader.src;
    if (src) {
      const cache = inject.IMG[src];
      if (!cache || cache.state === inject.LOADING) {
        if (!this.loader.loading) {
          this.loadAndRefresh();
        }
      }
      else if (cache && cache.state === inject.LOADED) {
        this.loader.loading = false;
        if (cache.success) {
          this.loader.source = cache.source;
          this.loader.width = cache.width;
          this.loader.height = cache.height;
        }
        else {
          this.loader.error = true;
        }
      }
    }
  }

  private loadAndRefresh() {
    // 加载前先清空之前可能遗留的老数据
    const loader = this.loader;
    loader.source = undefined;
    loader.error = false;
    loader.loading = true;
    inject.measureImg(loader.src!, (data: any) => {
      // 还需判断url，防止重复加载时老的替换新的，失败走error绘制
      if (data.url === loader.src) {
        loader.loading = false;
        if (data.success) {
          loader.source = data.source;
          loader.width = data.width;
          loader.height = data.height;
          if (!this.isDestroyed) {
            this.root!.addUpdate(this, [], RefreshLevel.REPAINT, false, false, false, undefined);
          }
        }
        else {
          loader.error = true;
        }
      }
    });
  }

  calContent(): boolean {
    let res = super.calContent();
    const { computedStyle, loader } = this;
    if (res) {
      loader.onlyImg = false;
    }
    else {
      loader.onlyImg = true;
      const {
        [StyleKey.VISIBLE]: visible,
      } = computedStyle;
      if (visible) {
        if (loader.source) {
          res = true;
        }
      }
    }
    return this.hasContent = res;
  }

  renderCanvas(ctx: CanvasRenderingContext2D, dx = 0, dy = 0) {
    super.renderCanvas(ctx, dx, dy);
  }

  genTexture(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    const { outerBbox, loader } = this;
    if (loader.onlyImg) {
      const w = outerBbox[2] - outerBbox[0];
      const h = outerBbox[3] - outerBbox[1];
      this.textureCache = TextureCache.getImgInstance(gl, this, w / loader.width, h / loader.height);
    }
    else {
      this.textureCache = TextureCache.getInstance(gl, this);
    }
  }
}

export default Bitmap;
