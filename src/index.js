"use strict";

let win = null; // win 对象

let $ = null; // jquery 对象

// 缓存常用字符
const doms = [
  "layui-layer",
  ".layui-layer-title",
  ".layui-layer-main",
  ".layui-layer-dialog",
  "layui-layer-iframe",
  "layui-layer-content",
  "layui-layer-btn",
  "layui-layer-close"
];
doms.anim = [
  "layer-anim-00",
  "layer-anim-01",
  "layer-anim-02",
  "layer-anim-03",
  "layer-anim-04",
  "layer-anim-05",
  "layer-anim-06"
];

// 默认参数
const ready = {
  config: {},
  end: {},
  minIndex: {},
  minLeft: [],
  btn: ["&#x786E;&#x5B9A;", "&#x53D6;&#x6D88;"],
  // 五种原始层模式
  type: ["dialog", "page", "iframe", "loading", "tips"],
  //for ie6 恢复select
  reselect() {
    $.each($("select"), function(index, value) {
      let sthis = $(this);
      if (!sthis.parents("." + doms[0])[0]) {
        sthis.attr("layer") == 1 &&
          $("." + doms[0]).length < 1 &&
          sthis.removeAttr("layer").show();
      }
      sthis = null;
    });
  },
  record(layero) {
    let area = [
      layero.width(),
      layero.height(),
      layero.position().top,
      layero.position().left + parseFloat(layero.css("margin-left"))
    ];
    layero.find(".layui-layer-max").addClass("layui-layer-maxmin");
    layero.attr({ area: area });
  },
  rescollbar(index) {
    if (doms.html.attr("layer-full") == index) {
      if (doms.html[0].style.removeProperty) {
        doms.html[0].style.removeProperty("overflow");
      } else {
        doms.html[0].style.removeAttribute("overflow");
      }
      doms.html.removeAttr("layer-full");
    }
  }
};

// 弹窗对象
const layer = {
  v: "3.1.1",
  index: window.layer && window.layer.v ? 100000 : 0,
  ie: (() => {
    let agent = navigator.userAgent.toLowerCase();
    return !!window.ActiveXObject || "ActiveXObject" in window
      ? (agent.match(/msie\s(\d+)/) || [])[1] || "11" //由于ie11并没有msie的标识
      : false;
  })(),

  /**
   * 设置配置
   */
  config(options = {}, fn) {
    this.cache = ready.config = Object.assign({}, ready.config, options);
    typeof options.extend === "string" && (options.extend = [options.extend]);

    return this;
  },
  /**
   * 各种快捷引用
   */
  alert(content, options, yes) {
    let type = typeof options === "function";
    if (type) yes = options;
    return this.open(Object.assign({}, { content, yes }, type ? {} : options));
  },

  /**
   * 确认弹窗
   */
  confirm(content, options, yes, cancel) {
    let type = typeof options === "function";
    if (type) {
      cancel = yes;
      yes = options;
    }
    return this.open(
      Object.assign(
        {},
        { content, btn: ready.btn, yes, btn2: cancel },
        type ? {} : options
      )
    );
  },

  /**
   * 轻提示
   */
  msg(content, options, end) {
    let type = typeof options === "function";
    let rskin = ready.config.skin;
    let skin = (rskin ? rskin + " " + rskin + "-msg" : "") || "layui-layer-msg";
    let anim = doms.anim.length - 1;
    if (type) end = options;
    return this.open(
      Object.assign(
        {},
        {
          content: content,
          time: 3000,
          shade: false,
          skin: skin,
          title: false,
          closeBtn: false,
          btn: false,
          resize: false,
          end: end
        },
        type && !ready.config.skin
          ? {
              skin: skin + " layui-layer-hui",
              anim: anim
            }
          : (function() {
              options = options || {};
              if (
                options.icon === -1 ||
                (options.icon === undefined && !ready.config.skin)
              ) {
                options.skin = skin + " " + (options.skin || "layui-layer-hui");
              }
              return options;
            })()
      )
    );
  },

  /**
   * 加载层
   */
  load(icon, options) {
    return this.open(
      Object.assign(
        {},
        {
          type: 3,
          icon: icon || 0,
          resize: false,
          shade: 0.01
        },
        options
      )
    );
  },

  /**
   * 提示层
   */
  tips(content, follow, options) {
    return this.open(
      Object.assign(
        {},
        {
          type: 4,
          content: [content, follow],
          closeBtn: false,
          time: 3000,
          shade: false,
          resize: false,
          fixed: false,
          maxWidth: 210
        },
        options
      )
    );
  }
};

/**
 * 容器类
 */
class Container {
  /**
   * 构造方法
   */
  constructor(settings) {
    this.index = ++layer.index;
    this.config = Object.assign({}, this.config(), ready.config, settings);
    let that = this;
    document.body
      ? that.create()
      : setTimeout(() => {
          that.create();
        }, 30);
  }

  /**
   * 默认配置
   */
  config() {
    return {
      type: 0,
      shade: 0.3,
      fixed: true,
      move: doms[1],
      title: "&#x4FE1;&#x606F;",
      offset: "auto",
      area: "auto",
      closeBtn: 1,
      time: 0, //0表示不自动关闭
      zIndex: 19891014,
      maxWidth: 360,
      anim: 0,
      isOutAnim: true,
      icon: -1,
      moveType: 1,
      resize: true,
      scrollbar: true, //是否允许浏览器滚动条
      tips: 2
    };
  }

  /**
   * 创建容器
   */
  vessel(conType, callback) {
    let times = this.index;
    let config = this.config;
    let zIndex = config.zIndex + times;
    let titype = typeof config.title === "object";
    let ismax = config.maxmin && (config.type === 1 || config.type === 2);
    let titleHTML = config.title
      ? '<div class="layui-layer-title" style="' +
        (titype ? config.title[1] : "") +
        '">' +
        (titype ? config.title[0] : config.title) +
        "</div>"
      : "";

    config.zIndex = zIndex;

    callback(
      [
        //遮罩
        config.shade
          ? '<div class="layui-layer-shade" id="layui-layer-shade' +
            times +
            '" times="' +
            times +
            '" style="' +
            ("z-index:" + (zIndex - 1) + "; ") +
            '"></div>'
          : "",

        //主体
        '<div class="' +
          doms[0] +
          (" layui-layer-" + ready.type[config.type]) +
          ((config.type == 0 || config.type == 2) && !config.shade
            ? " layui-layer-border"
            : "") +
          " " +
          (config.skin || "") +
          '" id="' +
          doms[0] +
          times +
          '" type="' +
          ready.type[config.type] +
          '" times="' +
          times +
          '" showtime="' +
          config.time +
          '" conType="' +
          (conType ? "object" : "string") +
          '" style="z-index: ' +
          zIndex +
          "; width:" +
          config.area[0] +
          ";height:" +
          config.area[1] +
          (config.fixed ? "" : ";position:absolute;") +
          '">' +
          (conType && config.type != 2 ? "" : titleHTML) +
          '<div id="' +
          (config.id || "") +
          '" class="layui-layer-content' +
          (config.type == 0 && config.icon !== -1
            ? " layui-layer-padding"
            : "") +
          (config.type == 3 ? " layui-layer-loading" + config.icon : "") +
          '">' +
          (config.type == 0 && config.icon !== -1
            ? '<i class="layui-layer-ico layui-layer-ico' +
              config.icon +
              '"></i>'
            : "") +
          (config.type == 1 && conType ? "" : config.content || "") +
          "</div>" +
          '<span class="layui-layer-setwin">' +
          (function() {
            let closebtn = ismax
              ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>'
              : "";
            config.closeBtn &&
              (closebtn +=
                '<a class="layui-layer-ico ' +
                doms[7] +
                " " +
                doms[7] +
                (config.title
                  ? config.closeBtn
                  : config.type == 4
                    ? "1"
                    : "2") +
                '" href="javascript:;"></a>');
            return closebtn;
          })() +
          "</span>" +
          (config.btn
            ? (function() {
                let button = "";
                typeof config.btn === "string" && (config.btn = [config.btn]);
                for (let i = 0, len = config.btn.length; i < len; i++) {
                  button +=
                    '<a class="' +
                    doms[6] +
                    "" +
                    i +
                    '">' +
                    config.btn[i] +
                    "</a>";
                }
                return (
                  '<div class="' +
                  doms[6] +
                  " layui-layer-btn-" +
                  (config.btnAlign || "") +
                  '">' +
                  button +
                  "</div>"
                );
              })()
            : "") +
          (config.resize ? '<span class="layui-layer-resize"></span>' : "") +
          "</div>"
      ],
      titleHTML,
      $('<div class="layui-layer-move"></div>')
    );

    return this;
  }

  /**
   * 创建骨架
   */
  create() {
    let that = this;
    let config = this.config;
    let times = this.index;
    let content = config.content;
    let conType = typeof content === "object";
    let body = $("body");

    if (config.id && $("#" + config.id)[0]) return;

    if (typeof config.area === "string") {
      config.area = config.area === "auto" ? ["", ""] : [config.area, ""];
    }

    //anim兼容旧版shift
    if (config.shift) {
      config.anim = config.shift;
    }

    if (layer.ie == 6) {
      config.fixed = false;
    }

    switch (config.type) {
      case 0:
        config.btn = "btn" in config ? config.btn : ready.btn[0];
        layer.closeAll("dialog");
        break;
      case 2:
        content = config.content = conType
          ? config.content
          : [config.content || "http://layer.layui.com", "auto"];
        config.content =
          '<iframe scrolling="' +
          (config.content[1] || "auto") +
          '" allowtransparency="true" id="' +
          doms[4] +
          "" +
          times +
          '" name="' +
          doms[4] +
          "" +
          times +
          '" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' +
          config.content[0] +
          '"></iframe>';
        break;
      case 3:
        delete config.title;
        delete config.closeBtn;
        config.icon === -1 && config.icon === 0;
        layer.closeAll("loading");
        break;
      case 4:
        conType || (config.content = [config.content, "body"]);
        config.follow = config.content[1];
        config.content =
          config.content[0] + '<i class="layui-layer-TipsG"></i>';
        delete config.title;
        config.tips =
          typeof config.tips === "object" ? config.tips : [config.tips, true];
        config.tipsMore || layer.closeAll("tips");
        break;
    }

    // 建立容器
    this.vessel(conType, (html, titleHTML, moveElem) => {
      body.append(html[0]);
      conType
        ? (function() {
            config.type == 2 || config.type == 4
              ? (function() {
                  $("body").append(html[1]);
                })()
              : (function() {
                  if (!content.parents("." + doms[0])[0]) {
                    content
                      .data("display", content.css("display"))
                      .show()
                      .addClass("layui-layer-wrap")
                      .wrap(html[1]);
                    $("#" + doms[0] + times)
                      .find("." + doms[5])
                      .before(titleHTML);
                  }
                })();
          })()
        : body.append(html[1]);
      $(".layui-layer-move")[0] || body.append((ready.moveElem = moveElem));
      this.layero = $("#" + doms[0] + times);
      config.scrollbar ||
        doms.html.css("overflow", "hidden").attr("layer-full", times);
    }).auto(times);

    //遮罩
    $("#layui-layer-shade" + this.index).css({
      "background-color": config.shade[1] || "#000",
      opacity: config.shade[0] || config.shade
    });

    config.type == 2 &&
      layer.ie == 6 &&
      this.layero.find("iframe").attr("src", content[0]);

    //坐标自适应浏览器窗口尺寸
    config.type == 4 ? this.tips() : this.offset();
    if (config.fixed) {
      win.on("resize", () => {
        that.offset();
        (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) &&
          that.auto(times);
        config.type == 4 && that.tips();
      });
    }

    config.time <= 0 ||
      setTimeout(() => {
        layer.close(that.index);
      }, config.time);
    this.move().callback();

    //为兼容jQuery3.0的css动画影响元素尺寸计算
    if (doms.anim[config.anim]) {
      let animClass = "layer-anim " + doms.anim[config.anim];
      this.layero
        .addClass(animClass)
        .one(
          "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
          function() {
            $(this).removeClass(animClass);
          }
        );
    }

    //记录关闭动画
    if (config.isOutAnim) {
      this.layero.data("isOutAnim", true);
    }
  }

  /**
   * 自适应
   */
  auto(index) {
    let config = this.config;
    let layero = $("#" + doms[0] + index);

    if (config.area[0] === "" && config.maxWidth > 0) {
      //为了修复IE7下一个让人难以理解的bug
      if (layer.ie && layer.ie < 8 && config.btn) {
        layero.width(layero.innerWidth());
      }
      layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
    }

    let area = [layero.innerWidth(), layero.innerHeight()],
      titHeight = layero.find(doms[1]).outerHeight() || 0,
      btnHeight = layero.find("." + doms[6]).outerHeight() || 0,
      setHeight = function(elem) {
        elem = layero.find(elem);
        elem.height(
          area[1] -
            titHeight -
            btnHeight -
            2 * (parseFloat(elem.css("padding-top")) | 0)
        );
      };

    switch (config.type) {
      case 2:
        setHeight("iframe");
        break;
      default:
        if (config.area[1] === "") {
          if (config.maxHeight > 0 && layero.outerHeight() > config.maxHeight) {
            area[1] = config.maxHeight;
            setHeight("." + doms[5]);
          } else if (config.fixed && area[1] >= win.height()) {
            area[1] = win.height();
            setHeight("." + doms[5]);
          }
        } else {
          setHeight("." + doms[5]);
        }
        break;
    }

    return this;
  }

  /**
   * 计算坐标
   */
  offset() {
    let config = this.config;
    let layero = this.layero;
    let area = [layero.outerWidth(), layero.outerHeight()];
    let type = typeof config.offset === "object";
    this.offsetTop = (win.height() - area[1]) / 2;
    this.offsetLeft = (win.width() - area[0]) / 2;

    if (type) {
      this.offsetTop = config.offset[0];
      this.offsetLeft = config.offset[1] || this.offsetLeft;
    } else if (config.offset !== "auto") {
      if (config.offset === "t") {
        //上
        this.offsetTop = 0;
      } else if (config.offset === "r") {
        //右
        this.offsetLeft = win.width() - area[0];
      } else if (config.offset === "b") {
        //下
        this.offsetTop = win.height() - area[1];
      } else if (config.offset === "l") {
        //左
        this.offsetLeft = 0;
      } else if (config.offset === "lt") {
        //左上角
        this.offsetTop = 0;
        this.offsetLeft = 0;
      } else if (config.offset === "lb") {
        //左下角
        this.offsetTop = win.height() - area[1];
        this.offsetLeft = 0;
      } else if (config.offset === "rt") {
        //右上角
        this.offsetTop = 0;
        this.offsetLeft = win.width() - area[0];
      } else if (config.offset === "rb") {
        //右下角
        this.offsetTop = win.height() - area[1];
        this.offsetLeft = win.width() - area[0];
      } else {
        this.offsetTop = config.offset;
      }
    }

    if (!config.fixed) {
      this.offsetTop = /%$/.test(this.offsetTop)
        ? (win.height() * parseFloat(this.offsetTop)) / 100
        : parseFloat(this.offsetTop);
      this.offsetLeft = /%$/.test(this.offsetLeft)
        ? (win.width() * parseFloat(this.offsetLeft)) / 100
        : parseFloat(this.offsetLeft);
      this.offsetTop += win.scrollTop();
      this.offsetLeft += win.scrollLeft();
    }

    if (layero.attr("minLeft")) {
      this.offsetTop = win.height() - (layero.find(doms[1]).outerHeight() || 0);
      this.offsetLeft = layero.css("left");
    }

    layero.css({ top: this.offsetTop, left: this.offsetLeft });
  }

  /**
   * 提示层
   */
  tips() {
    let config = this.config;
    let layero = this.layero;
    let layArea = [layero.outerWidth(), layero.outerHeight()],
      follow = $(config.follow);
    if (!follow[0]) follow = $("body");
    let goal = {
        width: follow.outerWidth(),
        height: follow.outerHeight(),
        top: follow.offset().top,
        left: follow.offset().left
      },
      tipsG = layero.find(".layui-layer-TipsG");

    let guide = config.tips[0];
    config.tips[1] || tipsG.remove();

    goal.autoLeft = function() {
      if (goal.left + layArea[0] - win.width() > 0) {
        goal.tipLeft = goal.left + goal.width - layArea[0];
        tipsG.css({ right: 12, left: "auto" });
      } else {
        goal.tipLeft = goal.left;
      }
    };

    //辨别tips的方位
    goal.where = [
      function() {
        //上
        goal.autoLeft();
        goal.tipTop = goal.top - layArea[1] - 10;
        tipsG
          .removeClass("layui-layer-TipsB")
          .addClass("layui-layer-TipsT")
          .css("border-right-color", config.tips[1]);
      },
      function() {
        //右
        goal.tipLeft = goal.left + goal.width + 10;
        goal.tipTop = goal.top;
        tipsG
          .removeClass("layui-layer-TipsL")
          .addClass("layui-layer-TipsR")
          .css("border-bottom-color", config.tips[1]);
      },
      function() {
        //下
        goal.autoLeft();
        goal.tipTop = goal.top + goal.height + 10;
        tipsG
          .removeClass("layui-layer-TipsT")
          .addClass("layui-layer-TipsB")
          .css("border-right-color", config.tips[1]);
      },
      function() {
        //左
        goal.tipLeft = goal.left - layArea[0] - 10;
        goal.tipTop = goal.top;
        tipsG
          .removeClass("layui-layer-TipsR")
          .addClass("layui-layer-TipsL")
          .css("border-bottom-color", config.tips[1]);
      }
    ];
    goal.where[guide - 1]();

    /* 8*2为小三角形占据的空间 */
    if (guide === 1) {
      goal.top - (win.scrollTop() + layArea[1] + 8 * 2) < 0 && goal.where[2]();
    } else if (guide === 2) {
      win.width() - (goal.left + goal.width + layArea[0] + 8 * 2) > 0 ||
        goal.where[3]();
    } else if (guide === 3) {
      goal.top -
        win.scrollTop() +
        goal.height +
        layArea[1] +
        8 * 2 -
        win.height() >
        0 && goal.where[0]();
    } else if (guide === 4) {
      layArea[0] + 8 * 2 - goal.left > 0 && goal.where[1]();
    }

    layero.find("." + doms[5]).css({
      "background-color": config.tips[1],
      "padding-right": config.closeBtn ? "30px" : ""
    });
    layero.css({
      left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0),
      top: goal.tipTop - (config.fixed ? win.scrollTop() : 0)
    });
  }

  /**
   * 拖拽层
   */
  move() {
    let config = this.config,
      _DOC = $(document),
      layero = this.layero,
      moveElem = layero.find(config.move),
      resizeElem = layero.find(".layui-layer-resize"),
      dict = {};

    if (config.move) {
      moveElem.css("cursor", "move");
    }

    moveElem.on("mousedown", function(e) {
      e.preventDefault();
      if (config.move) {
        dict.moveStart = true;
        dict.offset = [
          e.clientX - parseFloat(layero.css("left")),
          e.clientY - parseFloat(layero.css("top"))
        ];
        ready.moveElem.css("cursor", "move").show();
      }
    });

    resizeElem.on("mousedown", function(e) {
      e.preventDefault();
      dict.resizeStart = true;
      dict.offset = [e.clientX, e.clientY];
      dict.area = [layero.outerWidth(), layero.outerHeight()];
      ready.moveElem.css("cursor", "se-resize").show();
    });

    _DOC
      .on("mousemove", function(e) {
        //拖拽移动
        if (dict.moveStart) {
          let X = e.clientX - dict.offset[0],
            Y = e.clientY - dict.offset[1],
            fixed = layero.css("position") === "fixed";

          e.preventDefault();

          dict.stX = fixed ? 0 : win.scrollLeft();
          dict.stY = fixed ? 0 : win.scrollTop();

          //控制元素不被拖出窗口外
          if (!config.moveOut) {
            let setRig = win.width() - layero.outerWidth() + dict.stX,
              setBot = win.height() - layero.outerHeight() + dict.stY;
            X < dict.stX && (X = dict.stX);
            X > setRig && (X = setRig);
            Y < dict.stY && (Y = dict.stY);
            Y > setBot && (Y = setBot);
          }

          layero.css({
            left: X,
            top: Y
          });
        }

        //Resize
        if (config.resize && dict.resizeStart) {
          let X = e.clientX - dict.offset[0],
            Y = e.clientY - dict.offset[1];

          e.preventDefault();

          layer.style(this.index, {
            width: dict.area[0] + X,
            height: dict.area[1] + Y
          });
          dict.isResize = true;
          config.resizing && config.resizing(layero);
        }
      })
      .on("mouseup", function(e) {
        if (dict.moveStart) {
          delete dict.moveStart;
          ready.moveElem.hide();
          config.moveEnd && config.moveEnd(layero);
        }
        if (dict.resizeStart) {
          delete dict.resizeStart;
          ready.moveElem.hide();
        }
      });

    return this;
  }

  /**
   * 回调
   */
  callback() {
    //按钮
    let that = this;
    let layero = this.layero,
      config = this.config;
    this.openLayer();
    if (config.success) {
      if (config.type == 2) {
        layero.find("iframe").on("load", function() {
          config.success(layero, that.index);
        });
      } else {
        config.success(layero, that.index);
      }
    }

    layer.ie == 6 && this.IE6(layero);

    layero
      .find("." + doms[6])
      .children("a")
      .on("click", function() {
        let index = $(this).index();
        if (index === 0) {
          if (config.yes) {
            config.yes(that.index, layero);
          } else if (config["btn1"]) {
            config["btn1"](that.index, layero);
          } else {
            layer.close(that.index);
          }
        } else {
          let close =
            config["btn" + (index + 1)] &&
            config["btn" + (index + 1)](that.index, layero);
          close === false || layer.close(that.index);
        }
      });

    //取消
    function cancel() {
      let close = config.cancel && config.cancel(that.index, layero);
      close === false || layer.close(that.index);
    }

    //右上角关闭回调
    layero.find("." + doms[7]).on("click", cancel);

    //点遮罩关闭
    if (config.shadeClose) {
      $("#layui-layer-shade" + this.index).on("click", function() {
        layer.close(that.index);
      });
    }

    //最小化
    layero.find(".layui-layer-min").on("click", function() {
      let min = config.min && config.min(layero);
      min === false || layer.min(that.index, config);
    });

    //全屏/还原
    layero.find(".layui-layer-max").on("click", function() {
      if ($(this).hasClass("layui-layer-maxmin")) {
        layer.restore(that.index);
        config.restore && config.restore(layero);
      } else {
        layer.full(that.index, config);
        setTimeout(function() {
          config.full && config.full(layero);
        }, 100);
      }
    });

    config.end && (ready.end[this.index] = config.end);
  }

  IE6() {
    //隐藏select
    $("select").each(function(index, value) {
      let sthis = $(this);
      if (!sthis.parents("." + doms[0])[0]) {
        sthis.css("display") === "none" || sthis.attr({ layer: "1" }).hide();
      }
      sthis = null;
    });
  }

  /**
   * 需依赖原型的对外方法
   */
  openLayer() {
    //置顶当前窗口
    layer.zIndex = this.config.zIndex;
    layer.setTop = function(layero) {
      let setZindex = function() {
        layer.zIndex++;
        layero.css("z-index", layer.zIndex + 1);
      };
      layer.zIndex = parseInt(layero[0].style.zIndex);
      layero.on("mousedown", setZindex);
      return layer.zIndex;
    };
  }
}

// 获取子iframe的DOM
layer.getChildFrame = function(selector, index) {
  index = index || $("." + doms[4]).attr("times");
  return $("#" + doms[0] + index)
    .find("iframe")
    .contents()
    .find(selector);
};

// 得到当前iframe层的索引，子iframe时使用
layer.getFrameIndex = function(name) {
  return $("#" + name)
    .parents("." + doms[4])
    .attr("times");
};

// iframe层自适应宽高
layer.iframeAuto = function(index) {
  if (!index) return;
  let heg = layer.getChildFrame("html", index).outerHeight();
  let layero = $("#" + doms[0] + index);
  let titHeight = layero.find(doms[1]).outerHeight() || 0;
  let btnHeight = layero.find("." + doms[6]).outerHeight() || 0;
  layero.css({ height: heg + titHeight + btnHeight });
  layero.find("iframe").css({ height: heg });
};

// 重置iframe url
layer.iframeSrc = function(index, url) {
  $("#" + doms[0] + index)
    .find("iframe")
    .attr("src", url);
};

// 设定层的样式
layer.style = function(index, options, limit) {
  let layero = $("#" + doms[0] + index),
    contElem = layero.find(".layui-layer-content"),
    type = layero.attr("type"),
    titHeight = layero.find(doms[1]).outerHeight() || 0,
    btnHeight = layero.find("." + doms[6]).outerHeight() || 0;

  if (type === ready.type[3] || type === ready.type[4]) {
    return;
  }

  if (!limit) {
    if (parseFloat(options.width) <= 260) {
      options.width = 260;
    }

    if (parseFloat(options.height) - titHeight - btnHeight <= 64) {
      options.height = 64 + titHeight + btnHeight;
    }
  }

  layero.css(options);
  btnHeight = layero.find("." + doms[6]).outerHeight();

  if (type === ready.type[2]) {
    layero.find("iframe").css({
      height: parseFloat(options.height) - titHeight - btnHeight
    });
  } else {
    contElem.css({
      height:
        parseFloat(options.height) -
        titHeight -
        btnHeight -
        parseFloat(contElem.css("padding-top")) -
        parseFloat(contElem.css("padding-bottom"))
    });
  }
};

// 最小化
layer.min = function(index, options) {
  let layero = $("#" + doms[0] + index),
    titHeight = layero.find(doms[1]).outerHeight() || 0,
    left = layero.attr("minLeft") || 181 * ready.minIndex + "px",
    position = layero.css("position");

  ready.record(layero);

  if (ready.minLeft[0]) {
    left = ready.minLeft[0];
    ready.minLeft.shift();
  }

  layero.attr("position", position);

  layer.style(
    index,
    {
      width: 180,
      height: titHeight,
      left: left,
      top: win.height() - titHeight,
      position: "fixed",
      overflow: "hidden"
    },
    true
  );

  layero.find(".layui-layer-min").hide();
  layero.attr("type") === "page" && layero.find(doms[4]).hide();
  ready.rescollbar(index);

  if (!layero.attr("minLeft")) {
    ready.minIndex++;
  }
  layero.attr("minLeft", left);
};

//还原
layer.restore = function(index) {
  let layero = $("#" + doms[0] + index),
    area = layero.attr("area").split(",");
  let type = layero.attr("type");
  layer.style(
    index,
    {
      width: parseFloat(area[0]),
      height: parseFloat(area[1]),
      top: parseFloat(area[2]),
      left: parseFloat(area[3]),
      position: layero.attr("position"),
      overflow: "visible"
    },
    true
  );
  layero.find(".layui-layer-max").removeClass("layui-layer-maxmin");
  layero.find(".layui-layer-min").show();
  layero.attr("type") === "page" && layero.find(doms[4]).show();
  ready.rescollbar(index);
};

//全屏
layer.full = function(index) {
  let layero = $("#" + doms[0] + index),
    timer;
  ready.record(layero);
  if (!doms.html.attr("layer-full")) {
    doms.html.css("overflow", "hidden").attr("layer-full", index);
  }
  clearTimeout(timer);
  timer = setTimeout(function() {
    let isfix = layero.css("position") === "fixed";
    layer.style(
      index,
      {
        top: isfix ? 0 : win.scrollTop(),
        left: isfix ? 0 : win.scrollLeft(),
        width: win.width(),
        height: win.height()
      },
      true
    );
    layero.find(".layui-layer-min").hide();
  }, 100);
};

//改变title
layer.title = function(name, index) {
  let title = $("#" + doms[0] + (index || layer.index)).find(doms[1]);
  title.html(name);
};

//关闭layer总方法
layer.close = function(index) {
  let layero = $("#" + doms[0] + index),
    type = layero.attr("type"),
    closeAnim = "layer-anim-close";
  if (!layero[0]) return;
  let WRAP = "layui-layer-wrap",
    remove = function() {
      if (type === ready.type[1] && layero.attr("conType") === "object") {
        layero.children(":not(." + doms[5] + ")").remove();
        let wrap = layero.find("." + WRAP);
        for (let i = 0; i < 2; i++) {
          wrap.unwrap();
        }
        wrap.css("display", wrap.data("display")).removeClass(WRAP);
      } else {
        //低版本IE 回收 iframe
        if (type === ready.type[2]) {
          try {
            let iframe = $("#" + doms[4] + index)[0];
            iframe.contentWindow.document.write("");
            iframe.contentWindow.close();
            layero.find("." + doms[5])[0].removeChild(iframe);
          } catch (e) {}
        }
        layero[0].innerHTML = "";
        layero.remove();
      }
      typeof ready.end[index] === "function" && ready.end[index]();
      delete ready.end[index];
    };

  if (layero.data("isOutAnim")) {
    layero.addClass("layer-anim " + closeAnim);
  }

  $("#layui-layer-moves, #layui-layer-shade" + index).remove();
  layer.ie == 6 && ready.reselect();
  ready.rescollbar(index);
  if (layero.attr("minLeft")) {
    ready.minIndex--;
    ready.minLeft.push(layero.attr("minLeft"));
  }

  if ((layer.ie && layer.ie < 10) || !layero.data("isOutAnim")) {
    remove();
  } else {
    setTimeout(function() {
      remove();
    }, 200);
  }
};

//关闭所有层
layer.closeAll = function(type) {
  $.each($("." + doms[0]), function() {
    let othis = $(this);
    let is = type ? othis.attr("type") === type : 1;
    is && layer.close(othis.attr("times"));
    is = null;
  });
};

/**
  拓展模块
 */
const cache = layer.cache || {},
  skin = function(type) {
    return cache.skin ? " " + cache.skin + " " + cache.skin + "-" + type : "";
  };

// 初始化
layer.init = function(_$ = window.jQuery, isGlobal = true) {
  if (!_$) {
    return;
  }
  $ = _$;
  win = $(window);
  doms.html = $("html");
  this.open = function(deliver) {
    let o = new Container(deliver);
    return o.index;
  };
  if (isGlobal) {
    window.layer = this;
  }
};

layer.init();

export default layer;