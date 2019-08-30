// 创建kvue.js
// new KVue({
//     data: {
//         msg: 'hello，vue',
//         foo: {bar:'bar'}
//     }
// })

class KVue {
    constructor(options) {
        this.$options = options;

        // 数据响应式处理
        this.$data = options.data;
        this.observe(this.$data);


        // 测试: 没有编译器，写伪码
        // new Watcher(this, 'test')
        // this.test

        // new Watcher(this, 'foo.bar')
        // this.foo.bar

        // 创建编译器
        new Compile(options.el, this);

        if (options.created) {
            options.created.call(this);
        }
    }

    observe(value) {
        // 希望传进来的是对象
        if (!value || typeof value !== 'object') {
            return;
        }

        // 遍历data属性
        Object.keys(value).forEach(key => {
            this.defineReactive(value, key, value[key])
            // 代理，可以通过vm.xx访问data中的属性
            this.proxyData(key);
        })
    }

    defineReactive(obj, key, val) { // 制造闭包
        // 递归
        this.observe(val);

        // 创建一个对应的Dep
        const dep = new Dep();

        // 给obj定义属性
        Object.defineProperty(obj, key, {
            get() {
                // 将Dep.target收集起来
                Dep.target && dep.addDep(Dep.target);

                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // console.log(`${key}属性更新了`);
                // 更新操作
                dep.notify();
            },
        })
    }

    proxyData(key) {
        // 给KVue实例指定属性
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key];
            },
            set(newVal) {
                this.$data[key] = newVal;
            },
        })
    }
}

// 管理若干Watcher实例，它和data中的属性1:1关系
class Dep {
    constructor() {
        this.watchers = [];
    }

    // 新增watcher
    addDep(watcher) {
        this.watchers.push(watcher)
    }

    // 通知变更
    notify() {
        this.watchers.forEach(watcher => watcher.update())
    }
}

// 监听器: 负责更新页面中的具体绑定
class Watcher {
    // vm是KVue实例
    // key是data中的一个属性
    constructor(vm, key, cb) {
        
        this.vm = vm;
        this.key = key;
        this.cb = cb;

        Dep.target = this;
        this.vm[this.key]; // 读取触发依赖收集
        Dep.target = null;
    }

    update() {
    //   console.log(this.key+'更新了');
        this.cb.call(this.vm, this.vm[this.key])
    }
}
