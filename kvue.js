// KVue类：
// 1. 对传入data对象执行响应化处理

class KVue {
    constructor(options) {
        // 保存选项
        this.$options = options;

        // 保存data
        this.$data = options.data;

        // 对传入data对象执行响应化处理
        this.observe(this.$data);


        // 测试
        // new Watcher(this, 'test')
        // this.test; // 读取属性，触发依赖收集

        new Compile(options.el, this);

        if(options.created) {
            options.created.call(this)
        }
    }

    observe(value) {
        // 参数必须是对象
        if (!value || typeof value !== 'object') {
            return;
        }

        Object.keys(value).forEach(key => {
            // 执行响应化
            this.defineReactive(value, key, value[key])

            // 执行代理
            this.proxyData(key);
        })
    }

    // obj: data对象
    // {
    //     data: {
    //         test: 'aaa',
    //         foo:'abc'
    //     }
    // }
    defineReactive(obj, key, val) {
        // 递归判断
        this.observe(val);

        // 创建Dep，它和key 1:1关系
        const dep = new Dep();

        // 定义属性
        // 参数3是属性描述符，定义配置型、遍历性、可读、可写
        Object.defineProperty(obj, key, {
            get() {
                // 依赖收集
                Dep.target && dep.addDep(Dep.target)
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal;
                // 通知更新
                dep.notify();
                
            }
        })
    }

    proxyData(key) {
        // 想Vue实例上面定义属性key
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key]
            },
            set(newVal) {
                this.$data[key] = newVal;
            }
        })
    }
}

// Dep: 管理若干Watcher实例，通知它们更新
// {{foo}}{{foo}}
class Dep {
    constructor() {
        this.deps = [];
    }

    addDep(dep) {
        this.deps.push(dep);
    }

    notify() {
        // set函数调用
        this.deps.forEach(dep => dep.update())
    }
}

// Watcher: 执行具体更新操作
class Watcher {
    constructor(vm, key, updater) {
        
        this.vm = vm;
        this.key = key;
        this.updater = updater;


        Dep.target = this; // 依赖收集时要用到
        this.vm[this.key];
        Dep.target = null;
    }

    update() {
        // console.log('属性'+this.key+'更新了');
        this.updater.call(this.vm, this.vm[this.key])
    }
}