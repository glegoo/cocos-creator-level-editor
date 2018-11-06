'use strict';

module.exports = {
  load() {
    // execute when package loaded
  },

  unload() {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open'() {
      // open entry panel registered in package.json
      Editor.Panel.open('level-editor');
    },
    'save'(event, argv) {
      Editor.Scene.callSceneScript('level-editor', 'saveLevel', argv);
    },
    'load'(event, argv) {
      // let url = Editor.assetdb.uuidToFspath(argv._value)
      Editor.log("创建场景")
      Editor.Scene.callSceneScript('level-editor', 'loadLevel', argv._value);
    },
    'show'(event, argv){
      Editor.log(argv)
    }
  },
};