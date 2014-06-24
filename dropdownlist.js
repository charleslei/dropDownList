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
            me._drawList();
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
                if(code === 38){ //arrow up
                    me._next(-1);
                    e.preventDefault();
                } else if(code === 40){ //arrow down
                    me._next(1);
                    e.preventDefault();
                } else if(code === 13){ //press enter
                    me._setSelectedValue();
                    e.preventDefault();
                } else if(code === 33){ //page up
                } else if(code === 34){  //page down
                } else if(code === 8){ //backspace
                    //do nothing;
                }
            });

            me.dom.delegate('.dropdownlist_item', 'mousedown', function(e){
                var $ele = $(e.target);
                me._setSelectedValue($ele);
            }).delegate('.dropdownlist_item', 'mouseover', function(e){
                var self = $(e.target);
                me._setCurrentStyle(self);
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

        _drawList: function(){
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

        _setSelectedValue: function(item){
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

        _setCurrentIdx: function(dir){
            var me = this;
            var itemList = me.itemList;
            var listLen = itemList.length;
            var idx = me.curIdx;

            if(dir > 0){
                (++idx > listLen - 1) && (idx = 0);
            }else if(dir < 0){
                (--idx < 0) && (idx = listLen -1);
            }

            idx = idx > listLen ? listLen : idx;
            me.curIdx = idx;

            me._setCurrentStyle();
        },

        _setCurrentStyle: function(item){
            var me = this;
            var actClass = me.config.activeClass;
            var idx = me.curIdx;
            var list = me.itemList;
            list.removeClass(actClass);
            if(item && item.length > 0 ){
                item.addClass(actClass);
            }else{
                list.eq(idx).addClass(actClass);
            }
        },

        _next: function(dir){
            var me = this;

            //判断列表是否显示,如果当前未显示，那么先显示列表框，然后结束该操作；
            if(!me.shown) {
                me._show();
                return;
            }

            me._scrollTo(dir);
            me._setCurrentIdx(dir);
        },

        _show: function(){
            var me = this;

            if(me.shown) return ;
            me._setCurrentStyle();
            me.dom.show();
            me.shown = true;
        },

        _hide: function(obj){
            var me = this;
            me.itemList.removeClass(me.config.activeClass);
            me.dom.hide();
            me.shown = false;
        },

        /*当下拉列表出现滚动条时,该方法可以实现同一方向上的循环滚动;*/
        _scrollTo: function(val){
            var me = this;

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
                } else if((delta = (idx + 1) * curH - scrollTop) < 0) {
                    top = 0;
                }
            } else {
                if((delta = (idx + 1)*curH - scrollTop - prtH) > 0){
                    top = scrollTop + delta + 2; //dom的border是2px
                } else if((delta = idx * curH - scrollTop) < 0) {
                    top = scrollTop + delta;
                }
            }
            dom.scrollTop(top);
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
