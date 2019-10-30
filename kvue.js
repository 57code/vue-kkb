// new KVue({data:{foo:{},num:1}})
class KVue {
  // 1.数据响应化
  constructor(options) {
    this.$options = options;

    // 处理传入data
    this.$data = options.data;

    // 响应化
    this.observe(this.$data);

    // 2.依赖收集
    // new Watcher(this, 'test');
    // this.test;
    new Compiler(options.el, this);

    // 执行一下钩子函数
    if (options.created) {
        options.created.call(this);
    }
  }

  observe(value) {
    // 遍历的必须是对象
    if (!value || typeof value !== "object") {
      return;
    }

    // 遍历
    Object.keys(value).forEach(key => {
      // 真正的响应化处理在defineReactive中
      this.defineReactive(value, key, value[key]);

      // 代理data中的属性到vue实例上
      this.proxyData(key);
    });
    
  }

  defineReactive(obj, key, val) {
    // 递归
    this.observe(val);

    // 创建Dep实例和key一一对应
    const dep = new Dep();

    Object.defineProperty(obj, key, {
      get() {
        //   依赖收集
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        // 通知更新
        dep.notify();
      },
    });
  }

  proxyData(key) {
    // 需要给vue实例定义属性
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      },
    });
  }
}


// Dep：和data中的每一个key对应起来，主要负责管理相关watcher
class Dep {
    constructor() {
        this.deps = [];
    }

    addDep(dep) {
        this.deps.push(dep);
    }

    notify() {
        this.deps.forEach(dep => dep.update())
    }
}

// Watcher：负责创建data中key和更新函数的映射关系
class Watcher {
    constructor(vm, key, cb) {
        
        this.vm = vm;
        this.key = key;
        this.cb = cb;

        Dep.target = this; // 把当前watcher实例附加到Dep静态属性上
        this.vm[this.key]; // 触发依赖收集
        Dep.target = null;
    }

    update() {
        // console.log(`${this.key}属性更新了`);
        this.cb.call(this.vm, this.vm[this.key])
        
    }
}