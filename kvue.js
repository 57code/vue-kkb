// 定义KVue构造函数
class KVue {
  constructor(options) {
    // 保存选项
    this.$options = options;

    // 传入data
    this.$data = options.data;

    // 响应化处理
    this.observe(this.$data);

    // new Watcher(this, "foo");
    // this.foo; //读一次，触发依赖收集
    // new Watcher(this, "bar.mua");
    // this.bar.mua;

    new Compile(options.el, this);

    if (options.created) {
        options.created.call(this);
    }
  }

  observe(value) {
    if (!value || typeof value !== "object") {
      return;
    }

    // 遍历value
    Object.keys(value).forEach(key => {
      // 响应式处理
      this.defineReactive(value, key, value[key]);
      // 代理data中的属性到vue根上
      this.proxyData(key);
    });
  }

  defineReactive(obj, key, val) {
    // 递归遍历
    this.observe(val);

    // 定义了一个Dep
    const dep = new Dep(); // 每个dep实例和data中每个key有一对一关系

    // 给obj的每一个key定义拦截
    Object.defineProperty(obj, key, {
      get() {
        // 依赖收集
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set(newVal) {
        if (newVal !== val) {
          val = newVal;
          //   console.log(key + "属性更新了");
          dep.notify();
        }
      }
    });
  }

  // 在vue根上定义属性代理data中的数据
  proxyData(key) {
    // this指的KVue实例
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      }
    });
  }
}

// 创建Dep：管理所有Watcher
class Dep {
  constructor() {
    // 存储所有依赖
    this.watchers = [];
  }

  addDep(watcher) {
    this.watchers.push(watcher);
  }

  notify() {
    this.watchers.forEach(watcher => watcher.update());
  }
}
// 创建Watcher：保存data中数值和页面中的挂钩关系
class Watcher {
  constructor(vm, key, cb) {
    // 创建实例时立刻将该实例指向Dep.target便于依赖收集
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    //触发依赖收集
    Dep.target = this;
    this.vm[this.key];//触发依赖收集
    Dep.target = null;
  }

  // 更新
  update() {
    // console.log(this.key + "更新了！");
    this.cb.call(this.vm, this.vm[this.key])
  }
}
