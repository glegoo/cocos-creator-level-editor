let fs = require('fire-fs');
let GameDefine = require('../../temp/quick-scripts/assets/script/GameDefine.js').GameDefine
let NodeType = require('../../temp/quick-scripts/assets/script/GameDefine.js').NodeType

module.exports = {
    // prefabs: null,
    'saveLevel': function (event, info) {
        let node = cc.engine.getInstanceById(info._value)

        let ret = {}
        ret.nodes = []
        node.children.forEach(element => {
            let nodeJson = this.getNodeJson(element)
            if (nodeJson) {
                ret.nodes.push(nodeJson)
            }
        });
        // Editor.Ipc.sendToMain('level-editor:saveJson', info._name, JSON.stringify(ret));
        let name = info._name, str = JSON.stringify(ret)
        let url = 'db://assets/resources/table/level/' + name + '.json'
        if (Editor.assetdb.remote.exists(url)) {
            Editor.assetdb.remote.saveExists(url, str);
        }
        else {
            Editor.assetdb.remote.create(url, str);
        }
    },
    getNodeJson(node) {
        let ret = null
        let obs = node.getComponent('Obstacle')
        if (obs) {
            ret = this.getObstacleJson(obs)
        }
        let rail = node.getComponent('Rail')
        if (rail) {
            ret = this.getRailJson(rail)
        }
        let dead = node.getComponent('Deadzone')
        if (dead) {
            ret = this.getSpine(dead)
        }
        if (node.name === 'end') {
            ret = { t: NodeType.END }
        }

        if (ret) {
            ret.r = [node.x / GameDefine.WALL_INTERVAL, node.y / GameDefine.WALL_INTERVAL, node.width / GameDefine.WALL_UNIT_WIDTH, node.height / GameDefine.WALL_UNIT_HEIGHT]
        }

        return ret
    },
    getObstacleJson(obs) {
        let wall = {}
        wall.t = NodeType.WALL
        // wall.name = obs.node.name
        if (obs.holdMoveVec) {
            wall.hmv = obs.holdMoveVec
        }
        if (obs.lifeTime) {
            wall.lt = obs.lifeTime
        }
        if (obs.levelFinish) {
            wall.lf = obs.levelFinish
        }
        if (obs.bounce) {
            wall.b = obs.bounce
        }
        if (obs.loopActionType) {
            wall.lad = obs.loopActionDuration
            wall.lat = obs.loopActionType
            if (obs.loopActionDelay) {
                wall.dly = obs.loopActionDelay
            }
            if (obs.loopActionTarget) {
                wall.ltar = this.getNodeJson(obs.loopActionTarget)
            }
        }
        else {
            let child = this.getChild(obs.node)
            if (child) {
                wall.child = child
            }
        }
        if (obs.allowLeaf) {
            wall.al = obs.allowLeaf
        }

        return wall
    },
    getRailJson(comp) {
        let rail = {}
        rail.t = NodeType.RAIL
        rail.mpp = comp.movePathPoints
        rail.md = comp.moveDuration
        if (comp.moveNode) {
            rail.mn = this.getNodeJson(comp.moveNode)
        }
        return rail
    },
    getSpine(dz) {
        let spine = {}
        spine.t = NodeType.SPINE
        spine.st = dz.type
        spine.r = [dz.node.x / GameDefine.WALL_INTERVAL, dz.node.y / GameDefine.WALL_INTERVAL, dz.node.width / GameDefine.WALL_UNIT_WIDTH, dz.node.height / GameDefine.WALL_UNIT_HEIGHT]
        if (spine.st === 0) {
            spine.f = dz.node.scaleX
        }
        else if (spine.st === 1) {
            spine.ay = dz.node.anchorY
        }
        return spine
    },
    getChild(node) {
        let ret = null
        node.children.forEach(element => {
            let dz = element.getComponent('Deadzone')
            if (dz) {
                let spine = this.getSpine(dz)
                if (!ret) {
                    ret = []
                }
                ret.push(spine)
            }
        });
        return ret
    },
    'loadLevel': function (event, uuid) {
        if (!this.prefabs) {
            this.loadPrefabs(() => {
                this.createLevel(uuid)
            })
        }
        else {
            this.createLevel(uuid)
        }
    },
    loadPrefabs(callback) {
        let self = this
        Editor.assetdb.queryAssets('db://assets/resources/prefab/*', 'prefab', function (err, prefabs) {
            self.prefabs = {}
            prefabs.forEach((element, index) => {
                cc.AssetLibrary.loadAsset(element.uuid, function (error, asset) {
                    self.prefabs[asset.name] = asset
                    if (index == prefabs.length - 1) {
                        if (callback) {
                            callback()
                        }
                    }
                })
            })
        })
    },
    createLevel(uuid) {
        Editor.log("开始创建场景")
        let self = this
        cc.loader.load({ type: 'uuid', uuid: uuid }, function (err, res) {
            let root = new cc.Node(res._name)
            let info = res.json
            if (info.nodes) {
                info.nodes.forEach((element, index) => {
                    let node = self.createNode(element)
                    self.addChild(node, root, element)
                });
            }
            root.setParent(cc.find('Canvas'))
        })
    },

    createNode(info) {
        let node = null
        // 结束节点
        if (info.t === NodeType.END) {
            node = new cc.Node('end')
        }
        else {
            let temp = null
            if (info.t === NodeType.WALL) {
                if (info.b) {
                    temp = this.getPrefab('bounce')
                }
                else if (info.lt) {
                    temp = this.getPrefab('disappear')
                }
                else if (info.lad) {
                    temp = this.getPrefab('timer')
                }
                else if (info.hmv) {
                    temp = this.getPrefab('up')
                }
                else {
                    temp = this.getPrefab('common')
                }
                node = cc.instantiate(temp)
                let obs = node.getComponent('Obstacle')
                if (!obs) {
                    Editor.log(info)
                }
                if (info.hmv) {
                    obs.holdMoveVec = info.hmv
                }
                if (info.lt) {
                    obs.lifeTime = info.lt
                }
                if (info.lf) {
                    obs.levelFinish = info.lf
                }
                if (info.b) {
                    obs.bounce = info.b
                }
                if (info.lad) {
                    obs.loopActionDuration = info.lad
                    obs.loopActionType = info.lat
                    if (info.dly) {
                        obs.loopActionDelay = info.dly
                    }
                    if (info.ltar) {
                        let child = this.createNode(info.ltar)
                        this.addChild(child, node, info.ltar)
                        obs.loopActionTarget = child
                    }
                }
                if (info.al) {
                    obs.allowLeaf = info.al
                }
            }
            else if (info.t === NodeType.RAIL) {
                temp = this.getPrefab('rail')
                node = cc.instantiate(temp)
                let comp = node.getComponent('Rail')

                comp.movePathPoints = info.mpp
                comp.moveDuration = info.md
                if (info.mn) {
                    let child = this.createNode(info.mn)
                    this.addChild(child, node, info.mn)
                    comp.moveNode = child
                }
            }
            else if (info.t === NodeType.SPINE) {
                if (info.st === 0) {
                    temp = this.getPrefab('side')
                }
                else if (info.st === 1) {
                    temp = this.getPrefab('head')
                }
                node = cc.instantiate(temp)
                let comp = node.getComponent('Deadzone')

                comp.type = info.st
                if (info.st == 0) {
                    comp.node.scaleX = info.f
                    info.r[2] = 24 / GameDefine.WALL_UNIT_WIDTH
                } else if (info.st == 1) {
                    comp.node.anchorY = info.ay
                }
            }

            if (info.child) {
                info.child.forEach(element => {
                    let child = this.createNode(element)
                    if (child) {
                        Editor.log('创建子节点')
                        this.addChild(child, node, element)
                    }
                });
            }
        }
        return node
    },

    addChild(node, root, info) {
        if (node) {
            node.setParent(root)
            node.position = cc.v2(info.r[0] * GameDefine.WALL_INTERVAL, info.r[1] * GameDefine.WALL_INTERVAL)
            node.width = info.r[2] * GameDefine.WALL_UNIT_WIDTH
            node.height = info.r[3] * GameDefine.WALL_UNIT_HEIGHT
        }
    },

    getPrefab(name) {
        return this.prefabs[name]
    },

    show(any) {
        Editor.Ipc.sendToMain('level-editor:show', any)
    }
};