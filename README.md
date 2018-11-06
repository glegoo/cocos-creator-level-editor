# Cocos Creator 场景编辑器
本插件适用于小型游戏。<br>
由于Cocos Creator不支持Prefab嵌套，导致策划人员将元素prefab组合关卡后再次保存成prefab后，对元素prefab做修改无法反应到关卡prefab上。这十分不方便。<br>
本插件旨在策划使用元素prefab组成关卡后，将关卡节点导出为json文件。然后使用json文件加载场景。不仅解决了prefab嵌套的问题，也缩减了关卡文件体积。<br>
插件中保存及加载部分需各游戏对应修改，只提供一个思路。请着重参考编辑器模式下如何操作节点，保存文件，以及加载prefab导入场景中。
