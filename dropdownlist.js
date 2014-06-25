if (typeof QNR == "undefined") {
    var QNR = {};
}

$(function() {
    DropDownList = function(data, args) {
        var me = this;
        var config = {
            activeClass: 'active',
            max: 5,

            onSelected: function() {},
            formatItem: function() {}
        }
        me.oriData = data;
        me.config = $.extend(config, args);
        me.itemList = '';
        me.curIdx = 0;

        DropDownList._init(me);
    };

    var AA = {
        _getObjectType: function(obj) {
            var type = Object.prototype.toString.apply(obj);
            if (type === '[object Object]') {
                return 'object';
            } else if (type === '[object Number]') {
                return 'number';
            } else if (type === '[object Array]') {
                return 'array';
            } else {
                return 'object';
            }
        },

        _init: function(me) {
            DropDownList._initHTML(me);
            DropDownList._drawList(me);
            DropDownList._initEvt(me);
        },

        _initEvt: function(me) {
            //单击输入框或者获取焦点时;
            me.config.tgt.bind('click focusin', function(e) {
                DropDownList._show(me);
                e.preventDefault();
            }).bind('blur focusout', function(e) {
                DropDownList._hide(me);
                e.preventDefault();
            }).bind('keydown', function(e) {
                var code = e.keyCode;
                if (code === 38) { //arrow up
                    DropDownList._next(me, -1);
                    e.preventDefault();
                } else if (code === 40) { //arrow down
                    DropDownList._next(me, 1);
                    e.preventDefault();
                } else if (code === 13) { //press enter
                    DropDownList._setSelectedValue(me);
                    e.preventDefault();
                } else if (code === 33) { //page up
                } else if (code === 34) { //page down
                } else if (code === 8) { //backspace
                    //do nothing;
                }
            });

            me.dom.delegate('.dropdownlist_item', 'mousedown', function(e) {
                var $ele = $(e.target);
                DropDownList._setSelectedValue(me, $ele);
            }).delegate('.dropdownlist_item', 'mouseover', function(e) {
                var self = $(e.target);
                DropDownList._setStyle(me, self);
            })


            //用户注册事件
            me.dom.bind('selected', function() {
                me.config.onSelected.apply(me);
            });
        },

        _initHTML: function(me) {
            var tgt = me.config.tgt;
            var _html = '<div class="dropdownlist_ctn"><div class="dropdownlist"><ul></ul></div></div>';

            var wd = parseInt(tgt.outerWidth()) - 2 + 'px';
            var $html = $(_html);
            me.dom = $html.find('.dropdownlist').css('width', wd);
            var prt = me.config.tgt.parent();
            prt.append($html);
        },

        _drawList: function(me) {
            var dom = me.dom;
            var data = me.oriData;
            var str = '';
            var list = '';
            var max = me.config.max;
            $.each(data, function(k, v) {
                var fmtV = DropDownList._formatItem(me, v);
                str += '<li class="dropdownlist_item" data-idx="' + k + '">' + fmtV + '</li>'
                if (k + 1 >= max) return false;
            });

            dom.find('ul').empty().append(str);

            //all items;
            me.itemList = list = dom.find('ul > li');
            me.listRect = {
                top: dom.offset().top,
                h: dom.outerHeight()
            };
            me.curRect = {
                top: list.eq(0).offset().top,
                h: list.eq(0).outerHeight()
            };
        },

        _setSelectedValue: function(me, item) {
            var tgt = me.config.tgt;
            var list = me.itemList;
            var data = me.oriData;
            var idx = '';
            if (!item) {
                idx = DropDownList._getNextIdxByCls(me);
                item = list.eq(idx);

            } else {
                //通过鼠标方式选中的列表项，要修改当前选中索引
                idx = list.index(item);
            }
            me.curIdx = idx;
            var val = data[item.data('idx')];
            tgt.val(val);

            me.dom.trigger('selected');
            DropDownList._hide(me);
        },

        _setIdx: function(me, dir) {
            var idx = me._getNextIdxByCls(me, dir);
            me.curIdx = idx;

            me._setStyle(me, idx);
        },

        _getNextIdxByCls: function(me, dir) {
            var itemList = me.itemList;
            var listLen = itemList.length;
            var actClass = me.config.activeClass;
            var activeIdx = itemList.index(itemList.filter('.' + actClass));

            //如果有上下的方向,那么对应的index就- / + 1;否则返回当前的index;
            if (dir > 0) {
                (++activeIdx > listLen - 1) && (activeIdx = 0);
            } else if (dir < 0) {
                (--activeIdx < 0) && (activeIdx = listLen - 1);
            }

            return activeIdx;
        },

        /*当列表项修改时,当前的index会超出列表长度,故在这里判断一下 */
        _getIdx: function(me) {
            var idx = me.curIdx;
            var list = me.itemList;
            var listLen = me.itemList.length;
            return (idx > listLen - 1) ? listLen - 1 : idx;
        },

        _setStyle: function(me, item) { //参数支持:jquery对象, 数字, 或空(当前的index)
            var actClass = me.config.activeClass;
            var list = me.itemList;
            var type = DropDownList._getObjectType(item);
            list.removeClass(actClass);
            if (item && item.length > 0 && type === 'object') { //jquery object
                item.addClass(actClass);
            } else if (type === 'number') { //number
                list.eq(item).addClass(actClass);
            } else {
                var idx = DropDownList._getIdx(me);
                list.eq(idx).addClass(actClass);
            }
        },

        /*设置下一个高亮的想,此操作不会对curIdx属性直接进行修改,而是间接性的;*/
        _next: function(me, dir) {
            //判断列表是否显示,如果当前未显示，那么先显示列表框，然后结束该操作；
            if (!me.shown) {
                DropDownList._show(me);
                return;
            }

            DropDownList._scrollTo(me, dir);
            DropDownList._setStyle(me, DropDownList._getNextIdxByCls(me, dir));
        },

        _show: function(me) {
            if (me.shown) return;
            DropDownList._setStyle(me);
            me.dom.show();
            me.shown = true;
        },

        _hide: function(me) {
            me.itemList.removeClass(me.config.activeClass);
            me.dom.hide();
            me.shown = false;
        },

        /*当下拉列表出现滚动条时,该方法可以实现同一方向上的循环滚动;*/
        _scrollTo: function(me, val) {
            var idx = DropDownList._getIdx(me);
            var idxDelta;
            var curH = me.curRect.h;
            var curTop = me.curRect.top - idx * curH;

            var prtTop = me.listRect.top;
            var prtH = me.listRect.h;

            var delta, top;
            var dom = me.dom;
            var scrollTop = dom.scrollTop();
            if (val > 0) {
                if ((delta = (idx + 1) * curH - scrollTop - prtH) > 0) {
                    top = scrollTop + delta + 2; //dom的border是2px
                } else if ((delta = (idx + 1) * curH - scrollTop) < 0) {
                    top = 0;
                }
            } else {
                if ((delta = (idx + 1) * curH - scrollTop - prtH) > 0) {
                    top = scrollTop + delta + 2; //dom的border是2px
                } else if ((delta = idx * curH - scrollTop) < 0) {
                    top = scrollTop + delta;
                }
            }
            dom.scrollTop(top);
        },

        _formatItem: function(me, val) {
            return me.config.formatItem.call(me, val);
        }
    };

    $.extend(DropDownList, AA);
    DropDownList.prototype = {
        //public function
        setList: function(data) {
            var me = this;
            me.oriData = data;
            DropDownList._drawList(me);
        }
    }

    $.fn.extend({
        DropDownList: function(data, args) {
            var me = this;
            me.each(function(k, v) {
                var $ele = $(v);
                var objStr = "DROPDOWNLIST";
                var obj = $ele.data(objStr);
                if (!data || Object.prototype.toString.apply(data) != '[object Array]') return;
                if (!obj) {
                    var dropDownList = new DropDownList(data, $.extend({}, args, {
                        tgt: $ele
                    }));
                    $ele.data(objStr, dropDownList);
                }
            })
        }
    });
});
