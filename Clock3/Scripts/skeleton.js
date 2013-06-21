(function () {
    "use strict";
    var unique = (function () {
        var count = 0;
        return function () {
            return ++count;
        }
    })();
    var viewEvents = { "rendered": true };
    WinJS.Namespace.define("Skeleton", {
        Model:WinJS.Class.define(function (obj) {
            this.constructors[0].apply(this, arguments);
        }, {
            constructors:[function(obj){
                var key, i, len;
                for (key in obj) {
                    this[key] = obj[key];
                }
                this.uid = unique();
                for (i = 0, len = this._events.length; i < len; i++) {
                    this.addEventListener(this._events[i].trigger, this._events[i].callback);
                }
            }],
            uid:null,
            id: undefined,
            url: "",
            urlRoot: "",
            events: {
                set: function (events) {
                    var key;
                    for (key in events) {
                        if (length > 0) {
                            this._events.push({
                                trigger: key,
                                callback: events[key]
                            });
                        }
                    }
                },
                get: function () {
                    return this._events;
                }
            },
            _events: [],
            sync: function (type) {
                this.syncType = type;
                this.dispatchEvent("sync", this);
            },
            fetch: function () { },
            save: function () { },
            change: function () { }
        }, {
            properties:["url","urlRoot"],
            extend: function (properties, instanceMembers, staticMembers) {
                var props = [], key;
                if (!instanceMembers) {
                    instanceMembers = {};
                }
                for (key in properties) {
                    this.properties.push(key);
                    instanceMembers[key] = properties[key];
                }
                var klass = WinJS.Class.derive(this, function (obj) {
                    var i, len;
                    this.constructors.push(instanceMembers.constructor || function () { });
                    for (i = 0, len = this.constructors.length; i < len; i++) {
                        this.constructors[i].apply(this,arguments);
                    }
                    return WinJS.Binding.as(this);
                }, instanceMembers, staticMembers);
                WinJS.Class.mix(klass, WinJS.Utilities.eventMixin);
                for (var key in this) {
                    klass[key] = this[key];
                }
                return klass;
            }
        }),
        View:WinJS.Class.define(function (obj) {
            this.constructors[0].apply(this, arguments);
        }, {
            constructors: [function (obj) {
                var key;
                for(key in obj){
                    this[key] = obj[key];
                }
            }],
            _template:null,
            template: {
                set: function (t) {
                    var elem;
                    if (typeof (t) == "string" && (elem = document.getElementById(t))) {
                        this._template = elem.winControl;
                    } else {
                        this._template = t;
                    }
                },
                get: function () {
                    return this._template;
                }
            },
            model: null,
            element: null,
            events: {
                set: function (events) {
                    var key, array;
                    for (key in events) {
                        var trigger;
                        array = key.split(/\s+/);
                        trigger = array.shift();
                        if (viewEvents[trigger]) {
                            this.__events.push({
                                trigger: trigger,
                                callback: events[key]
                            });
                        } else if(array.length > 0){
                            this._events.push({
                                trigger: trigger,
                                target: array.join(" "),
                                callback: events[key]
                            });
                        }
                    }
                }
            },
            _events: [],
            __events: [],
            renderTo: function (parent) {
                var that = this;
                this.template.render(this.model, parent).done(function (element) {
                    that.element = element
                    var elem;
                    that._events.forEach(function (event) {
                        elem = element.querySelector(event.target);
                        elem.addEventListener(event.trigger, function (ev) {
                            that[event.callback](ev);
                        }, false);
                    });
                    that.__events.forEach(function (event) {
                        that.addEventListener(event.trigger, function (ev) {
                            that[event.callback](ev);
                        }, false);
                    });
                    that.dispatchEvent("rendered");
                });
            }
        }, {
            extend: function (instanceMembers, staticMembers) {
                var klass, key;
                klass = WinJS.Class.derive(this, function (obj) {
                    var i, len, ret, rets = [];
                    this.constructors.push(instanceMembers.constructor || function () { });
                    for (i = 0, len = this.constructors.length; i < len; i++) {
                        ret = this.constructors[i].apply(this, arguments);
                        if (WinJS.Promise.is(ret))
                            rets.push(ret);
                    }
                    this.promise = WinJS.Promise.join(rets);
                }, instanceMembers, staticMembers);
                for (key in this) {
                    klass[key] = this[key];
                }
                WinJS.Class.mix(klass, WinJS.UI.DOMEventMixin);
                WinJS.Class.mix(klass, WinJS.Utilities.eventMixin);
                for (key in viewEvents) {
                    WinJS.Class.mix(klass, WinJS.Utilities.createEventProperties(key));
                }
                return klass;
            }
        }),
        Collection: WinJS.Class.define(function () {
            this.constructors[0].apply(this, arguments);
        }, {
            model: null,
            models: [],
            promise:null,
            url: "",
            urlRoot: "",
            _idbOption: {},
            constructors: [function () {
            }],
            add: function (model) {
                this.models.push(model);
                model.sync();
                this.dispatchEvent("add", model);
            },
            remove: function (model) {
                var index = this.models.indexOf(model);
                this.models.splice(index, 1);
                model.sync("delete");
                this.dispatchEvent("remove", model);
            },
            /*at: function (index) {
                return this.models[index];
            },
            atDeep: function (index) {
                if (this._idb) {
                    return this._idb.transaction(this.url).store(this.url).at(index);
                } else {
                    return new WinJS.Promise(function (comp, err) {
                        comp(this.models[index]);
                    });
                }
            },
            push: function (model) {
                this.models.push(model);
            },
            pushDeep: function (model) {
                this.models.push(model);
                model.sync();
            },
            pop: function () {
                return this.models.pop();
            },
            popDeep: function () {
                if (this._idb) {
                    var 
                    return this._idb.transaction(this.url).store(this.url);
                } else {
                    return new WinJS.Promise(function (comp, err) {at
                        comp(this.models.pop());
                    });
                }
            },
            unshift: function (model) {
                this.models = new Array(model).concat(this.models);
                model.sync();
            },
            shift: function () {
                return this.models.shift();
            },
            where: function(){
            },*/
            /*cursor: function (index, range, dir) {
                var that = this, store;
                this._idbOption.index = index;
                this._idbOption.range = range;
                this._idbOption.dir = dir;
                store = (!index || index=="id") ? this.Class._idb.transaction(this.url).store(this.url) : this.Class._idb.transaction(this.url).store(this.url).index(index);
                return new WinJS.Promise(function (comp, err) {
                    store.cursor(range, dir).all().then(function (models) {
                        var i, len;
                        that.models = [];
                        for (i = 0, len = models.length; i < len; i++) {
                            that.models.push(new that.model(models[i]));
                        }
                        that.dispatchEvent("fetch");
                        comp(that.models);
                    }, function (ev) {
                        err(ev);
                    });
                });
            },*/
            fetch: function (_index, _range, _dir) {
                if (this.Class._idb) {
                    var index, range, dir, store, that = this;
                    index = this._idbOption.index = _index || this._idbOption.index || "id";
                    range = this._idbOption.range = _range || this._idbOption.range || null;
                    dir = this._idbOption.dir = _dir || this._idbOption.dir || Skeleton.IDB.Next;
                    store = (!index || index=="id")? this.Class._idb.transaction(this.url).store(this.url) : this.Class._idb.transaction(this.url).store(this.url).index(index);
                    return new WinJS.Promise(function (comp, err) {
                        store.cursor(range, dir).all().then(function (models) {
                            var i, len;
                            that.models = [];
                            for (i = 0, len = models.length; i < len; i++) {
                                that.models.push(new that.model(models[i]));
                            }
                            that.dispatchEvent("fetch", that.models);
                            comp(that.models);
                        }, function (ev) {
                            err(ev)
                        });
                    });
                }
            },
            create: function (obj) {
                var model = new this.model(obj);
                this.models.push(model);
                model.sync();
            }
        }, {
            _idb: null,
            processAll: null,
            model: null,
            extend: function (instanceMembers, staticMembers) {
                var klass, key;
                klass = WinJS.Class.derive(this, function (obj) {
                    var i, len, ret, rets = [];
                    if (!instanceMembers) {
                        instanceMembers = {}
                    }
                    this.constructors.push(instanceMembers.constructor || function () { });
                    for (i = 0, len = this.constructors.length; i < len; i++) {
                        ret = this.constructors[i].apply(this, arguments);
                        if (WinJS.Promise.is(ret))
                            rets.push(ret);
                    }
                    this.processAll = WinJS.Promise.join(rets);
                    
                }, instanceMembers, staticMembers);
                for (key in this) {
                    if (!klass[key]) {
                        klass[key] = this[key];
                    }
                }
                if (!!instanceMembers) {
                    var obj, stores, indexes, key, i, len, index, url, that = klass;
                    obj = instanceMembers;
                    klass.prototype.model = klass.model = obj.model || Skeleton.Model;
                    klass.prototype.url = url = obj.url || "models";
                    klass.prototype.urlRoot = obj.urlRoot || "/";
                    if (obj.indexedDB) {
                        stores = {};
                        indexes = {};
                        if (obj.indexedDB.indexes) {
                            for (key in obj.indexedDB.indexes) {
                                index = obj.indexedDB.indexes[key];
                                if (typeof (index) == "string") {
                                    indexes[key] = {
                                        keyPath: index,
                                        unique: false,
                                        multiEntry: false
                                    };
                                } else if (Array.isArray(index)) {
                                    indexes[key] = {
                                        keyPath: index,
                                        unique: false,
                                        multiEntry: true
                                    };
                                }
                            }
                            for (i = 0, len = obj.indexedDB.indexes.length; i < len; i++) {
                                index = obj.indexedDB.indexes[i];
                                
                            }
                        }
                        stores[url] = {
                            keyPath: "id",
                            autoIncrement: true,
                            recreate: obj.indexedDB.recreate,
                            indexes: indexes
                        }
                        klass._idb = new Skeleton.IDB({
                            dbName: obj.indexedDB.dbName,
                            version: obj.indexedDB.version,
                            stores: stores
                        });
                        for (i = 0, len = obj.model.prototype._events.length; i < len;i++){
                            if (obj.model.prototype._events[i]["sync"]) return;
                        }
                        WinJS.Class.mix(obj.model, WinJS.Utilities.createEventProperties("sync"));
                        obj.model.prototype._events.push({
                            trigger: "sync",
                            callback: function (ev) {
                                var tx, model, _obj = {}, i, len, key;
                                model = ev.target;
                                for (i = 0, len = that.model.properties.length; i < len; i++) {
                                    key = that.model.properties[i];
                                    _obj[key] = model[key];
                                }
                                tx = that._idb.transaction(url, "readwrite");
                                if (model.syncType == "delete") {
                                    tx.store(url).delete(model.id);
                                } else if (!!model.id) {
                                    tx.store(url).lookup(model.id).done(function (obj) {
                                        if (obj) {
                                            _obj.id = model.id;
                                            tx.store(url).update(_obj);
                                        } else {
                                            tx.store(url).add(_obj).done(function (id) {
                                                model.id = id;
                                            });
                                        }
                                    });
                                } else {
                                    tx.store(url).add(_obj).done(function (id) {
                                        model.id = id;
                                    });
                                }
                            }
                        });
                        klass.processAll = klass._idb.open();
                    }
                }
                WinJS.Class.mix(klass, WinJS.Utilities.eventMixin);
                WinJS.Class.mix(obj.model, WinJS.Utilities.createEventProperties("fetch"));
                WinJS.Class.mix(obj.model, WinJS.Utilities.createEventProperties("add"));
                WinJS.Class.mix(obj.model, WinJS.Utilities.createEventProperties("remove"));
                klass.prototype.Class = klass;
                return klass;
            }
        }),
        IDB: WinJS.Class.define(function (settings) {
                this.dbName = settings.dbName || "db";
                this.version = settings.version || 1;
                this.db = null;
                this.stores = settings.stores || {};
        }, {
            dbName: null,
            version: null,
            db: null,
            stores: null,
            open: function () {
                var that, request, addindex;
                that = this;
                request = window.indexedDB.open(that.dbName, that.version); 
                return new WinJS.Promise(function (comp, err) {
                    request.onerror = function (event) {
                        err(event);
                    };
                    request.onsuccess = function (event) {
                        var db = event.target.result;
                        that.db = db;
                        if (!!addindex)
                            addindex(db);
                        comp(event);
                    };
                    request.onupgradeneeded = function (event) {
                        var db, storeName, store, indexName, index, objectStore, unique, multiEntry;
                        that.db = db = event.target.result;
                        for (storeName in that.stores) {
                            store = that.stores[storeName];
                            store.autoIncrement = !!store.autoIncrement;
                            if (db.objectStoreNames.contains(storeName)) {
                                if (!store.recreate) {
                                    addindex = function (db) {
                                        var transaction, objectStore;
                                        transaction = db.transaction([storeName], "readwrite");
                                        objectStore = transaction.objectStore(storeName);
                                        for (indexName in store.indexes) {
                                            if (!objectStore.indexNames.contains(indexName)) {
                                                index = store.indexes[indexName];
                                                unique = !!index.unique;
                                                multiEntry = !!index.multiEntry;
                                                objectStore.createIndex(indexName, index.keyPath, {
                                                    unique: unique,
                                                    multiEntry: multiEntry
                                                });
                                            }
                                        }
                                    }
                                } else {
                                    db.deleteObjectStore(storeName);
                                    create();
                                }
                            } else {
                                create();
                            }
                        }
                        function create() {
                            objectStore = db.createObjectStore(storeName, {
                                keyPath: store.keyPath,
                                autoIncrement: store.autoIncrement
                            });
                            for (indexName in store.indexes) {
                                index = store.indexes[indexName];
                                unique = !!index.unique;
                                multiEntry = !!index.multiEntry;
                                objectStore.createIndex(indexName, index.keyPath, {
                                    unique: unique,
                                    multiEntry: multiEntry
                                });
                            }
                        }
                    };
                });
            },
            transaction: function () {
                return new Skeleton.IDBTransaction(this.db.transaction.apply(this.db, arguments));
            }
        }, {
            Next: "next",
            NextUnique: "nextunique",
            Prev: "prev",
            PrevUnique: "prevunique",
            bound: IDBKeyRange.bound,
            upper: IDBKeyRange.upperBound,
            lower: IDBKeyRange.lowerBound,
            only: IDBKeyRange.only,
        }),
        IDBTransaction: WinJS.Class.define(function (transaction) {
            this._transaction = transaction;
        }, {
            _transaction: null,
            store: function (storeName) {
                return new Skeleton.IDBObjectStore(this._transaction.objectStore(storeName));
            }
        }),
        IDBObjectStore: WinJS.Class.define(function (objectStore, range, dir) {
            this._objectStore = objectStore;
            this._cursorRange = range || null;
            this._cursorDir = dir || Skeleton.IDB.Next;
        }, {
            _objectStore: null,
            _cursorRange: null,
            _cursorDir:null,
            lookup: function (key) {
                var objectStore, request;
                objectStore = this._objectStore;
                if (!objectStore["get"]) {
                    throw "this is not IDBObjectStore";
                }
                request = objectStore.get(key);
                return new WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        comp(event.target.result);
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            add: function (obj) {
                var objectStore, request;
                objectStore = this._objectStore;
                if (!objectStore["add"]) {
                    throw "this is not IDBObjectStore";
                }
                request = objectStore.add(obj);
                return new WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        comp(event.target.result);
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            update: function (obj) {
                var objectStore, request;
                objectStore = this._objectStore;
                if (!objectStore["put"]) {
                    throw "this is not IDBObjectStore";
                }
                request = objectStore.put(obj);
                return new WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        comp(event.target.result);
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            remove: function (id) {
                var objectStore, request;
                objectStore = this._objectStore;
                if (!objectStore["remove"]) {
                    throw "this is not IDBObjectStore";
                }
                request = objectStore.remove(id);
                return new WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        comp(event.target.result);
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            all: function () {
                var objectStore, request, items;
                objectStore = this._objectStore;
                request = objectStore.openCursor(this._cursorRange, this._cursorDir);
                items = [];
                return new WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        var cursor;
                        cursor = event.target.result;
                        if (cursor) {
                            items.push(cursor.value);
                            cursor.continue();
                        } else {
                            comp(items);
                        }
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            each: function (callback) {
                var objectStore, request, index;
                objectStore = this._objectStore;
                request = objectStore.openCursor(this._cursorRange, this._cursorDir);
                index = 0;
                return WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        var cursor, value;
                        cursor = event.target.result;
                        if (cursor) {
                            value = cursor.value
                            callback.apply(value, [value, index++]);
                            cursor.continue();
                        } else {
                            comp(index);
                        }
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            at: function (index) {
                var objectStore, request, _index;
                objectStore = this._objectStore;
                request = objectStore.openCursor(this._cursorRange, this._cursorDir);
                _index = 0;
                return WinJS.Promise(function (comp, err) {
                    request.onsuccess = function (event) {
                        var cursor, value;
                        cursor = event.target.result;
                        if (cursor) {
                            if (_index++ < index) {
                                comp(cursor.value);
                            } else {
                                cursor.continue();
                            }
                        }
                    }
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            page: function (offset, num) {
                var objectStore, request, items;
                objectStore = this._objectStore;
                request = objectStore.openCursor(this._cursorRange, this._cursorDir);
                items = [];
                return new WinJS.Promise(function (comp, err) {
                    request.onsuccess = (offset == 0) ? function (event) {
                        var cursor;
                        cursor = event.target.result;
                        if (cursor && items.length < num) {
                            items.push(cursor.value);
                            cursor.continue();
                        } else {
                            comp(items);
                        }
                    } : function (event) {
                        var cursor;
                        cursor = event.target.result;
                        request.onsuccess = function (event) {
                            var cursor;
                            cursor = event.target.result;
                            if (cursor && items.length < num) {
                                items.push(cursor.value);
                                cursor.continue();
                            } else {
                                comp(items);
                            }
                        }
                        cursor.advance(offset*num);
                    };
                    
                    request.onerror = function (event) {
                        err(event);
                    }
                });
            },
            index: function (indexName) {
                if (!this._objectStore) {
                    throw "This is not index object.";
                    return;
                }
                return new Skeleton.IDBObjectStore(this._objectStore.index(indexName));
            },
            cursor: function (range, dir) {
                if (!!this._cursor) {
                    throw "This do not open cursor.";
                    return;
                }
                return new Skeleton.IDBObjectStore(this._objectStore, range, dir);
            }
        })
    });
})();