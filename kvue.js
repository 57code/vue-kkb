// new KVue({
//     data: {
//         msg: 'hello，vue'
//     }
// })

class KVue {
  constructor(options) {
    // 传入data选项
    this.$data = options.data;
    // 响应化
    this.observe(this.$data);

    // new Watcher();
    // this.$data.test;
    // new Watcher();
    // this.$data.foo.bar;

    // 编译
    new Compile(options.el, this);

    // 执行created钩子
    options.created.call(this);
  }

  observe(value) {
    if (!value || typeof value !== "object") {
      return;
    }
    // 遍历，执行数据响应式
    Object.keys(value).forEach(key => {
      this.defineReactive(value, key);
    });
  }

  defineReactive(obj, key) {
    const val = obj[key];
    // 递归
    // this.observe(val);

    const dep = new Dep(key);

    // 给obj定义属性
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addDep(Dep.target);
        // Dep.target = null;
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        // console.log(`${key}属性更新了：${val}`);
        dep.notify(key, newVal);
      }
    });
  }
}

class Dep {
  constructor(name) {
    this.name = name;
    // 存储所有依赖
    this.deps = [];
  }
  addDep(dep) {
    this.deps.push(dep);
  }
  notify(...args) {
    this.deps.forEach(dep => dep.update(...args));
  }
}

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    Dep.target = this;
    this.vm[this.key];
    // Dep.target = null;
  }
  update(key, val) {
    console.log(`${key}属性更新了：${val}`);
    this.cb.call(this.vm, val);
  }
}
