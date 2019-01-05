'use strict'
import '../scss/layer-mobile.scss'
const doc = document
const query = 'querySelectorAll'
const claname = 'getElementsByClassName'
const S = s => {
  return doc[query](s)
}

let index = 0
let classs = ['layui-m-layer']

/**
 * 准备对象
 */
const ready = {
  timer: {},
  end: {},
  /**
   * 点触事件
   */
  touch(elem, fn) {
    elem.addEventListener(
      'click',
      function(e) {
        fn.call(this, e)
      },
      false
    )
  }
}

class Layer {
  /**
   * 构造方法
   */
  constructor(options) {
    this.config = Object.assign({}, options)
    this.view()
  }

  /**
   * 视图方法
   */
  view() {
    let config = this.config
    let layerbox = doc.createElement('div')

    this.id = layerbox.id = classs[0] + index
    layerbox.setAttribute('class', classs[0] + ' ' + classs[0] + (config.type || 0))
    layerbox.setAttribute('index', index)

    //标题区域
    let title = (function() {
      let titype = typeof config.title === 'object'
      return config.title ? '<h3 style="' + (titype ? config.title[1] : '') + '">' + (titype ? config.title[0] : config.title) + '</h3>' : ''
    })()

    //按钮区域
    let button = (function() {
      typeof config.btn === 'string' && (config.btn = [config.btn])
      let btns = (config.btn || []).length,
        btndom
      if (btns === 0 || !config.btn) {
        return ''
      }
      btndom = '<span yes type="1">' + config.btn[0] + '</span>'
      if (btns === 2) {
        btndom = '<span no type="0">' + config.btn[1] + '</span>' + btndom
      }
      return '<div class="layui-m-layerbtn">' + btndom + '</div>'
    })()

    if (!config.fixed) {
      config.top = config.hasOwnProperty('top') ? config.top : 100
      config.style = config.style || ''
      config.style += ' top:' + (doc.body.scrollTop + config.top) + 'px'
    }

    if (config.type === 2) {
      config.content = '<i></i><i class="layui-m-layerload"></i><i></i><p>' + (config.content || '') + '</p>'
    }

    if (config.skin) config.anim = 'up'
    if (config.skin === 'msg') config.shade = false

    layerbox.innerHTML =
      (config.shade
        ? '<div ' + (typeof config.shade === 'string' ? 'style="' + config.shade + '"' : '') + ' class="layui-m-layershade"></div>'
        : '') +
      '<div class="layui-m-layermain" ' +
      (!config.fixed ? 'style="position:static;"' : '') +
      '>' +
      '<div class="layui-m-layersection">' +
      '<div class="layui-m-layerchild ' +
      (config.skin ? 'layui-m-layer-' + config.skin + ' ' : '') +
      (config.className ? config.className : '') +
      ' ' +
      (config.anim ? 'layui-m-anim-' + config.anim : '') +
      '" ' +
      (config.style ? 'style="' + config.style + '"' : '') +
      '>' +
      title +
      '<div class="layui-m-layercont">' +
      config.content +
      '</div>' +
      button +
      '</div>' +
      '</div>' +
      '</div>'

    if (!config.type || config.type === 2) {
      let dialogs = doc[claname](classs[0] + config.type),
        dialen = dialogs.length
      if (dialen >= 1) {
        layer.close(dialogs[0].getAttribute('index'))
      }
    }

    document.body.appendChild(layerbox)
    let elem = (this.elem = S('#' + this.id)[0])
    config.success && config.success(elem)

    this.index = index++
    this.action(config, elem)
  }

  /**
   * 方法操作
   */
  action() {
    let that = this

    //自动关闭
    if (config.time) {
      ready.timer[that.index] = setTimeout(function() {
        layer.close(that.index)
      }, config.time * 1000)
    }

    //确认取消
    let btn = function() {
      let type = this.getAttribute('type')
      if (type == 0) {
        config.no && config.no()
        layer.close(that.index)
      } else {
        config.yes ? config.yes(that.index) : layer.close(that.index)
      }
    }
    if (config.btn) {
      let btns = elem[claname]('layui-m-layerbtn')[0].children,
        btnlen = btns.length
      for (let ii = 0; ii < btnlen; ii++) {
        ready.touch(btns[ii], btn)
      }
    }

    //点遮罩关闭
    if (config.shade && config.shadeClose) {
      let shade = elem[claname]('layui-m-layershade')[0]
      ready.touch(shade, function() {
        layer.close(that.index, config.end)
      })
    }

    config.end && (ready.end[that.index] = config.end)
  }
}

export default {
  v: '2.0',
  index: index,

  /**
   * 核心方法
   */
  open: function(options) {
    let o = new Layer(options || {})
    return o.index
  },

  /**
   * 关闭弹窗
   */
  close: function(index) {
    let ibox = S('#' + classs[0] + index)[0]
    if (!ibox) return
    ibox.innerHTML = ''
    doc.body.removeChild(ibox)
    clearTimeout(ready.timer[index])
    delete ready.timer[index]
    typeof ready.end[index] === 'function' && ready.end[index]()
    delete ready.end[index]
  },

  /**
   * 关闭所有layer层
   */
  closeAll: function() {
    let boxs = doc[claname](classs[0])
    for (let i = 0, len = boxs.length; i < len; i++) {
      layer.close(boxs[0].getAttribute('index') | 0)
    }
  }
}
