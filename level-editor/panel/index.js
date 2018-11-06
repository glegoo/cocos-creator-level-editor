// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h2>关卡编辑器</h2>
    <hr />
    <ui-node style="width: 200px;" type="cc.Node" id="node"></ui-node>    
    <ui-button id="save">导出关卡</ui-button>
    <hr />
    <ui-asset style="width: 200px;" type="json" id="json"></ui-asset>    
    <ui-button id="load">载入关卡</ui-button>
  `,

  // element and variable binding
  $: {
    save: '#save',
    load: '#load',
    node: '#node',
    json: '#json'
  },

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.$save.addEventListener('confirm', () => {
      // Editor.Scene.callSceneScript('level-editor', 'save', this.$node);
      Editor.Ipc.sendToMain('level-editor:save', this.$node);
    });
    this.$load.addEventListener('confirm', () => {
      Editor.Ipc.sendToMain('level-editor:load', this.$json);
      // Editor.Scene.callSceneScript('level-editor', 'load', this.$json);
    });
  },

  // register your ipc messages here
  messages: {
    'level-editor:hello'(event) {
      // this.$node.innerText = 'Hello!';
      // Editor.log(this.$node.name)
    }
  }
});