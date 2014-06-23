if(typeof QNR=="undefined"){
    var QNR={};
}

$(function(){
    CC = function(data, args){//i_cls:item class; c_cls: content class; a_cls: active class; callback(function):点击tab切换显示区域之后执行
        var me = this;
        var config = {
            activeClass: 'active'
        }
        me.oriData = data;
        me.config = $.extend(config, args);
        me.itemList = '';
        me.curIdx = 0;

        me._init();
    }

    CC.prototype = {
        _init: function(){
            var me = this;
            me._initHTML();
            me._drawHTML();
            me._initEvt();
        },

        _initEvt: function(){
            //单击输入框或者获取焦点时;
            var me = this;
            me.config.tgt.bind('click focusin', function(e){
                me._show();
                e.preventDefault();
            }).bind('blur focusout', function(e){
                me._hide();
                e.preventDefault();
            }).bind('keydown', function(e){
                var code = e.keyCode;
                if(code === 37 || code === 38){ //arrow up and left
                    me._scrollTo(-1);
                } else if(code === 39 || code === 40){ //arrow down and right
                    me._scrollTo(1);
                } else if(code === 13){ //press enter
                    me._setValue();
                } else if(code === 33){ //page up
                } else if(code === 34){  //page down
                } else if(code === 8){ //backspace
                    //do nothing;
                }
                e.preventDefault();
            });

            me.dom.delegate('.dropdownlist_item', 'mousedown', function(e){
                var $ele = $(e.target);
                me._setValue($ele);
            }).delegate('.dropdownlist_item', 'mouseover', function(e){
                var self = $(e.target);
                var activeClass = me.config.activeClass;
                me.itemList.removeClass(activeClass);
                self.addClass(activeClass);
            })
        },

        _initHTML: function(){
            var me = this;
            var tgt = me.config.tgt;
            var _html = '<div class="dropdownlist"><ul></ul></div>';

            var wd = tgt.outerWidth();
            me.dom = $(_html).css('width', wd);
            var prt = me.config.tgt.parent();
            prt.css({"position": "relative"});
            prt.append(me.dom);
        },

        _drawHTML: function(){
            var me = this;
            var dom = me.dom;
            var data = me.oriData;
            var str = '';
            var list = '';
            $.each(data, function(k, v){
                str += '<li class="dropdownlist_item" data-value="' + v + '">' + v + '</li>'
            });

            dom.find('ul').empty().append(str);

            //all items;
            me.itemList = list = dom.find('ul > li');
            me.listRect = {top: dom.offset().top, h: dom.outerHeight()};
            me.curRect = {top: list.eq(0).offset().top, h: list.eq(0).outerHeight()};
        },

        _setValue: function(item){
            var me = this;
            var tgt = me.config.tgt;
            if(!item){
                var idx = me.curIdx;
                var list = me.itemList;
                item = list.eq(idx);
            }
            var val = item.data('value');
            tgt.val(val);
            me._hide();
        },

        _setCurrent: function(dir){
            var me = this;
            var itemList = me.itemList;
            var listLen = itemList.length;
            var idx = me.curIdx;

            idx = dir > 0 ? idx + 1 : idx -1;

            idx = idx > listLen ? listLen : idx;
            me.curIdx = idx;
            var actClass = me.config.activeClass;
            itemList.removeClass(actClass).eq(idx).addClass(actClass);
            console.log('setCurrent         ' + idx);
        },

        _show: function(){
            var me = this;

            if(me.shown) return ;
            me._setCurrent();
            me.dom.show();
            me.shown = true;
        },

        _hide: function(obj){
            var me = this;
            me.itemList.removeClass(me.config.activeClass);
            me.dom.hide();
            me.shown = false;
        },

        _scrollTo: function(val){
            var me = this;

            //判断列表是否显示,
            if(!me.shown) {
                me._show();
                return;
            }


            var idx = me.curIdx;
            var idxDelta;
            var curH = me.curRect.h;
            var curTop = me.curRect.top - idx * curH;

            var prtTop = me.listRect.top;
            var prtH = me.listRect.h;

            var delta, top;
            var dom = me.dom;
            var scrollTop = dom.scrollTop();
            if(val > 0){
                if((delta = (idx + 1)*curH - scrollTop - prtH) > 0){
                    top = scrollTop + delta + 2; //dom的border是2px
                    idx += 1;
                } else if((delta = (idx + 1) * curH - scrollTop) < 0) {
                    top = 0;
                    idx = 0;
                }
            } else {
                if((delta = (idx + 1)*curH - scrollTop - prtH) > 0){
                    top = scrollTop + delta + 2; //dom的border是2px
                    idx = 0;
                } else if((delta = idx * curH - scrollTop) < 0) {
                    top = scrollTop + delta;
                    idx = me.itemList.length;
                }
            }
            dom.scrollTop(top);
            me.curIdx = idx;
            me._setCurrent(val);
        },

    }

    $.fn.extend({
        DropDownList: function(data, args){
            var me = this;
            me.each(function(k, v){
                var $ele = $(v);
                var objStr = "DROPDOWNLIST";
                var obj = $ele.data(objStr);
                if(!data || Object.prototype.toString.apply(data) != '[object Array]') return;
                if(!obj){
                    var dropDownList = new CC(data, $.extend({}, args, {tgt: $ele}));
                    $ele.data(objStr, dropDownList);
                }
            })
        }
    });
});
