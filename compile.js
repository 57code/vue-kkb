// new Compile(el, this)

class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el);
      this.compile(this.$fragment);
      this.$el.appendChild(this.$fragment);
    }
  }

  node2Fragment(el) {
    const fragment = document.createDocumentFragment();
    let child;
    while ((child = el.firstChild)) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElement(node)) {
        // console.log("编译元素" + node.nodeName);
        this.compileElement(node);
      } else if (this.isInerpolation(node)) {
        // console.log("编译插值文本" + node.textContent);
        this.compileText(node);
      }
      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  compileElement(node) {}
  compileText(node) {
    // console.log(RegExp.$1);
    // node.textContent = this.$vm.$data[RegExp.$1];
    const exp = RegExp.$1;
    this.update(node, exp, 'text')
  }

  // node-更新节点, exp-绑定表达式，dir-指令名
  update(node, exp, dir) {
    const updater = this[dir+'Updater'];
    const val = this.$vm.$data[exp];
    updater && updater(node, val);
    // 创建依赖
    new Watcher(this.$vm, exp, function(val){
        updater && updater(node, val);
    })
  }

  textUpdater(node, val) {
      node.textContent = val;
  }

  isElement(node) {
    return node.nodeType == 1;
  }

  isInerpolation(node) {
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
}
