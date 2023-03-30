import { isFunction } from './type';

class Event {
  __eHash: any;
  constructor() {
    this.__eHash = {};
  }

  on(id: string, handle: Function) {
    if(!isFunction(handle)) {
      return;
    }
    let self = this;
    if(Array.isArray(id)) {
      for(let i = 0, len = id.length; i < len; i++) {
        self.on(id[i], handle);
      }
    }
    else {
      if(!self.__eHash.hasOwnProperty(id)) {
        self.__eHash[id] = [];
      }
      // 遍历防止此handle被侦听过了
      for(let i = 0, item = self.__eHash[id], len = item.length; i < len; i++) {
        if(item[i] === handle) {
          return self;
        }
      }
      self.__eHash[id].push(handle);
    }
    return self;
  }

  once(id: string, handle: Function) {
    if(!isFunction(handle)) {
      return;
    }
    let self = this;

    // 包裹一层会导致添加后删除对比引用删不掉，需保存原有引用进行对比
    function cb() {
      handle.apply(self, arguments);
      self.off(id, cb);
    }

    cb.__eventCb = handle;
    if(Array.isArray(id)) {
      for(let i = 0, len = id.length; i < len; i++) {
        self.once(id[i], handle);
      }
    }
    else if(handle) {
      self.on(id, cb);
    }
    return this;
  }

  off(id: string, handle: Function) {
    let self = this;
    if(Array.isArray(id)) {
      for(let i = 0, len = id.length; i < len; i++) {
        self.off(id[i], handle);
      }
    }
    else if(self.__eHash.hasOwnProperty(id)) {
      if(handle) {
        for(let i = 0, item = self.__eHash[id], len = item.length; i < len; i++) {
          // 需考虑once包裹的引用对比
          if(item[i] === handle || item[i].__eventCb === handle) {
            item.splice(i, 1);
            break;
          }
        }
      }
      // 未定义为全部清除
      else {
        delete self.__eHash[id];
      }
    }
    return this;
  }

  emit(id: string, ...data: any) {
    let self = this;
    if(Array.isArray(id)) {
      for(let i = 0, len = id.length; i < len; i++) {
        self.emit(id[i], data);
      }
    }
    else {
      if(self.__eHash.hasOwnProperty(id)) {
        let list = self.__eHash[id];
        if(list.length) {
          list = list.slice();
          for(let i = 0, len = list.length; i < len; i++) {
            let cb = list[i];
            if(isFunction(cb)) {
              cb.apply(self, data);
            }
          }
        }
      }
    }
    return this;
  }

  static REFRESH = 'refresh';
  static DID_ADD_DOM = 'addDom';
  static WILL_REMOVE_DOM = 'removeDom';

}

export default Event;