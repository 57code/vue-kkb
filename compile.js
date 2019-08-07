// 遍历dom结构，解析指令和插值表达式
class Compile {
  // el-带编译模板，vm-KVue实例
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    // 把模板中的内容移到片段操作
    this.$fragment = this.node2Fragment(this.$el);
    // 执行编译
    this.compile(this.$fragment);
    // 放回$el中
    this.$el.appendChild(this.$fragment);
  }

  //
  node2Fragment(el) {
    // 创建片段
    const fragment = document.createDocumentFragment();
    //
    let child;
    while ((child = el.firstChild)) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (node.nodeType == 1) {
        // 元素
        // console.log('编译元素'+node.nodeName);
        this.compileElement(node);
      } else if (this.isInter(node)) {
        // 只关心{{xxx}}
        // console.log('编译插值文本'+node.textContent);
        this.compileText(node);
      }

      // 递归子节点
      if (node.children && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  isInter(node) {
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }

  // 文本替换
  compileText(node) {
    console.log(RegExp.$1);
    console.log(this.$vm[RegExp.$1]);

    // 表达式
    const exp = RegExp.$1;
    this.update(node, exp, "text"); // v-text
  }

  update(node, exp, dir) {
    const updator = this[dir + "Updator"];
    updator && updator(node, this.$vm[exp]); // 首次初始化
    // 创建Watcher实例，依赖收集完成了
    new Watcher(this.$vm, exp, function(value) {
      updator && updator(node, value);
    });
  }

  textUpdator(node, value) {
    node.textContent = value;
  }

  compileElement(node) {
    // 关心属性
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach(attr => {
      // 规定：k-xxx="yyy"
      const attrName = attr.name; //k-xxx
      const exp = attr.value; //yyy
      if (attrName.indexOf("k-") == 0) {
        // 指令
        const dir = attrName.substring(2); //xxx
        // 执行
        this[dir] && this[dir](node, exp);
      }
    });
  }

  text(node, exp) {
    this.update(node, exp, 'text')
  }
}
