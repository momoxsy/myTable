'use strict';
/**
 *  author: momoxsy
 *  create: 2017/7/19
 */
 
var MyTable = (function() {

    function _MyTable() {}

    _MyTable.prototype = {

        tpl: '<table id="{tableId}" class="my-table" border="1" borderColor="#eee">' 
            + '<thead>{thead}</thead>' 
            + '<tbody>{tbody}<tbody>'
            + '</table>',

        id: 'myTable_' + (new Date().getTime() + parseInt(Math.random()*10, 10)), 

        tdTpl: '<td>{tdContent}</td>',

        trTpl: '<tr>{trContent}</tr>',
        
        thTpl: '<th class="both" data-index="{index}">{tdContent}</th>',

        myTable: function(options) {

            this.$el = options.$el;
            this.data = options.data || null;
            this.ajaxReq = options.ajax;

            this.init();

        }, 

        init: function() {

            var $el = this.$el,
                self = this;

            this.getData(function() {

                $el.innerHTML = self.renders();

                self.bindAction();

            });

        },
        
        _$: function(selector) {
            
            return document.querySelector(selector);
            
        },
        
        addClass: function($selector, className) {
            
            $selector.className += ' ' + className;
            
        },
        
        removeClass: function($selector, className) {
            
            var classNameArr = $selector.className.split(' '),
                newClassNameArr = [];
            
            classNameArr.map(function(cn) {
                
                if(cn != className) {
                    
                    newClassNameArr.push(cn);
                    
                }
                
            });
            
            $selector.className = newClassNameArr.join(' ');
            
        },
        
        hasClass: function($selector, className) {
            
            return $selector.className.split(' ').indexOf(className) !== -1 ? true : false;
            
        },

        bindAction: function() {
            
            var self = this;
            
            this._$('.my-table thead').onclick = function(e) {
                
                var e = e || window.Event,
                    target = e.target || e.srcElement;
                
                if(target.tagName&&target.tagName.toLowerCase() == 'th') {

                    var cacheAddClassName = '',
                        $thArr = target.parentNode.querySelectorAll('th'),
                        i = 0,
                        len = $thArr.length;

                    if(self.hasClass(target, 'both')) {

                        cacheAddClassName = 'asc';

                    }else if(self.hasClass(target, 'asc')) {

                        cacheAddClassName = 'desc';

                    }else {

                        cacheAddClassName = 'asc';

                    }

                    for(; i < len; i++) {

                        var $selector = $thArr[i];

                        self.removeClass($selector, 'asc');
                        self.removeClass($selector, 'desc');
                        self.addClass($selector, 'both');

                    }

                    self.removeClass(target, 'both');
                    self.addClass(target, cacheAddClassName);
                    self.sortData(target.getAttribute('data-index'), cacheAddClassName);

                    
                }
                
                    
            };
                        
        },

        getData: function(next) {

            var self = this;

            if(this.data) {
                
                this.theadArr = this.data.theadArr;
                this.tbodyArr = this.data.tbodyArr;
                
                this.handles();
                next();

            }else{

                this.ajax(this.ajaxReq, function(data) {

                    self.data = JSON.parse(data);
                    self.handles();
                    next();

                });

            }

        },

        handles: function() {

             var data = this.data.data,
                headerData = data.head.vars,
                resultData = data.results.bindings,
                tbodyArr = [],
                theadArr = [],
                self = this,
                isHandleTheadArr = true;

            resultData.map(function(rd) {

                var rdArr = [],
                    cacheUrl = '';

                headerData.map(function(hd) {

                    var o = rd[hd];

                    if(o.type == 'uri') {

                        cacheUrl = o.value

                    }else{

                        rdArr.push(!cacheUrl ? o.value :
                            '<a href=' + cacheUrl +' target="_blank">' + o.value + '</a>');

                        cacheUrl = '';

                        if(isHandleTheadArr) {

                            theadArr.push(hd);

                        }

                    }  

                });

                tbodyArr.push(rdArr);
                isHandleTheadArr = false;

            });

            this.theadArr = theadArr;
            this.tbodyArr = tbodyArr;

        },
        
        sortData: function(index, sortType) {
            
            var data = [],
                vaildDataType = this.tbodyArr[0][index],
                sortFun = function() {};
            
            function numAscSort(a, b) {
            
                return a[index] - b[index];
            
            }
            
            function stringAscSort(a, b) {
                
                var aVal = a[index],
                    bVal = b[index];
                    
                if(aVal.indexOf('</a>') != -1) {

                    aVal = aVal.split('</a>')[0].split('>')[1];
                    bVal = bVal.split('</a>')[0].split('>')[1];

                }

                return aVal.localeCompare(bVal);
                
            }
            
            if(vaildDataType == parseFloat(vaildDataType)) {
                
//                data = this.tbodyArr.sort(function(a, b) {
//                    
//                    return a - b;
//                    
//                });
                
                sortFun = numAscSort;
                                
            }else{
                
//                data = this.tbodyArr.sort(function(a, b) {
//                    
//                    var aVal = a[index],
//                        bVal = b[index];
//                    
//                    if(aVal.indexOf('</a>') != -1) {
//                    
//                        aVal = aVal.split('</a>')[0].split('>')[1];
//                        bVal = bVal.split('</a>')[0].split('>')[1];
//
//                    }
//                    
//                    return aVal > bVal;
//                    
//                });
                
                sortFun = stringAscSort;
                
            }
            
            data = this.tbodyArr.sort(sortFun);
            
            data = sortType == 'desc' ? data.reverse() : data;
            
//            var data = this.tbodyArr.sort(function(a, b) {
//                
//                var aVal = a[index],
//                    bVal = b[index];
//                
//                if(aVal.indexOf('</a>') != -1) {
//                    
//                    aVal = aVal.split('</a>')[0].split('>')[1];
//                    bVal = bVal.split('</a>')[0].split('>')[1];
//                    
//                    
//                }
//                
//                if(aVal == parseFloat(aVal)) {
//                
//                    return sortType == 'asc' ? aVal - bVal : bVal - aVal;
//                    
//                }else{
//                    
//                    return sortType == 'asc' ? aVal > bVal : bVal > aVal;
//                    
//                }
//                
//            });
            
            this.renderSortData(data);
            
        },
        
        renderSortData: function(data) {
            
            var self = this,
                tbodyHtmlArr = [];
            
            data.map(function(ta) {
                var arr = [];
                ta.map(function(t) {

                    arr.push(self.tdTpl.replace('{tdContent}', t));

                });

                tbodyHtmlArr.push(self.trTpl.replace('{trContent}', arr.join('')));

            });
            
            this._$('#' + this.id + ' tbody').innerHTML = tbodyHtmlArr.join('');
            
        },

        renders: function() {

           var theadHtmlArr = [],
               tbodyHtmlArr = [],
               self = this;

            this.theadArr.map(function(ta, index) {

                theadHtmlArr.push(self.thTpl.replace('{tdContent}', ta).replace('{index}', index));

            });

            this.tbodyArr.map(function(ta) {
                var arr = [];
                ta.map(function(t) {

                    arr.push(self.tdTpl.replace('{tdContent}', t));

                });

                tbodyHtmlArr.push(self.trTpl.replace('{trContent}', arr.join('')));

            });

            return this.tpl.replace('{tableId}', this.id)
                    .replace('{thead}', this.trTpl.replace('{trContent}', theadHtmlArr.join('')))
                    .replace('{tbody}', tbodyHtmlArr.join(''));

        },

        ajax: function(options, successCB) {

            var url = options.url,
                asyncBoo = options.async || true,
                type = options.type || 'GET',
                postData = options.postData || null,
                xhr = new XMLHttpRequest();

            try {

                xhr.onreadystatechange = next;
                xhr.open(type, url, asyncBoo);
                xhr.send(postData);

            }catch(e){

                console.error(e);
                successCB({});

            }

            function next() {

                if(xhr.readyState == 4) {

                    if(xhr.status == 200) {

                        successCB(xhr.responseText);

                    }else {

                        console.error('error! status is: ' + xhr.status + '; statusText is ' + xhr.statusText);
                        successCB({});

                    }

                }

            }

        }

    }
    
    return new _MyTable();

})();
