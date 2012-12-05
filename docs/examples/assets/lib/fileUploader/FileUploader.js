var FileUploader = (function () {
    function FileUploader(url, filePath, chunkSize, fileOverwrite, file, onStateChange) {
        if (typeof url === "undefined") { url = "upload.php"; }
        if (typeof filePath === "undefined") { filePath = ""; }
        if (typeof chunkSize === "undefined") { chunkSize = -1; }
        if (typeof fileOverwrite === "undefined") { fileOverwrite = true; }
        if (typeof file === "undefined") { file = null; }
        this.url = "upload.php";
        this.filePath = "";
        this.chunkSize = -1;
        this.fileOverwrite = true;
        this.file = null;
        this.maxChunkSize = 2097152;
        this.minChunkSize = 51200;
        this.bytesUploaded = 0;
        this.forceAsync = true;
        this.events = new EventListeners();
        this._xhr = null;
        this._fileReader = null;
        this._blobSlice = null;
        this._uniqueId = "";
        this._lastChunkSize = 0;
        this._currentChunkSize = 0;
        this._chunkTimer = -1;
        this._running = false;
        this._requestTimer = 0;
        this._offset = 0;
        this._continueFromOffset = 0;
        this._time = 0;
        this._fileName = "";
        this._fileSize = 0;
        this._fname = "";
        this._errorId = -1;
        this._fileChecksum = "";
        this.url = url;
        this.filePath = filePath;
        this.chunkSize = chunkSize;
        this.fileOverwrite = fileOverwrite;
        this.file = file;
        this.onStateChange = typeof onStateChange == 'undefined' ? this.onStateChange : onStateChange;
        this._blobSlice = (typeof File == 'undefined') ? null : (File.prototype.mozSlice || File.prototype.slice || File.prototype.webkitSlice);
        this._fileName = typeof file !== 'undefined' && file !== null ? file.name : "";
        this._fileSize = typeof file !== 'undefined' && file !== null ? file.size : 0;
        this.checkUploadSupport();
    }
    FileUploader.MAXIMUM_WAITING_TIME = 5000;
    FileUploader.getUploadTimeRemaining = function getUploadTimeRemaining(size, bytesUploaded, bytesPerSecond) {
        return FileUploader.formatTime(Math.round((size - bytesUploaded) / bytesPerSecond));
    }
    FileUploader.formatTime = function formatTime(seconds) {
        seconds = (seconds == "Infinity") ? 0 : seconds;
        seconds = isNaN(seconds) ? 0 : seconds;
        var str = '';
        var m = [
            "s", 
            "m ", 
            "h "
        ];

        for(var i = 0, n = m.length, t; i < n && seconds > 0; i++) {
            t = (seconds % 60);
            t = isNaN(t) ? 0 : t;
            str = (t < 10 ? '0' + t : t) + m[i] + str;
            seconds = Math.floor(seconds / 60);
            seconds = isNaN(seconds) ? 0 : seconds;
        }
        return str;
    }
    FileUploader.haveFileAPI = function haveFileAPI() {
        return (("FileReader" in window) && ("File" in window) && typeof FileReader != "undefined");
    }
    FileUploader.prototype.checkUploadSupport = function () {
        var agent = navigator.userAgent.toLowerCase();
        if(!("FileReader" in window) || !("File" in window) || !this._blobSlice || typeof FileReader == "undefined") {
            this._registerLog("<p><strong>Your browser does not support the FileAPI or slicing of files.</strong></p>", "error");
            return false;
        }
        return true;
    };
    FileUploader.prototype.startFileUpload = function (file, filePath) {
        if (typeof file === "undefined") { file = this.file; }
        if (typeof filePath === "undefined") { filePath = this.filePath; }
        if(!this.checkUploadSupport()) {
            return false;
        }
        this.file = file;
        if(typeof this.file == 'undefined' || this.file == null || typeof this.file.name == 'undefined') {
            this._registerLog("<strong>Please select a file.</strong><br/>", "error");
            return false;
        }
        this.filePath = filePath;
        this._fileName = this.file.name;
        this._fileSize = this.file.size;
        if(this._running) {
            this.stopFileUpload();
        }
        this._running = true;
        this._time = new Date().getTime();
        this._uniqueId = "chunk_" + this._time;
        this.addEventListener("checkComplete", this._onCheckComplete);
        this.checkFile();
        return true;
    };
    FileUploader.prototype.checkFile = function (file, filePath) {
        if (typeof file === "undefined") { file = this.file; }
        if (typeof filePath === "undefined") { filePath = this.filePath; }
        if(!this.checkUploadSupport()) {
            return false;
        }
        this.file = file;
        if(typeof this.file == 'undefined' || this.file == null || typeof this.file.name == 'undefined') {
            this._registerLog("<strong>Please select a file.</strong><br/>", "error");
            return false;
        }
        this.filePath = filePath;
        this._fileName = this.file.name;
        this._fileSize = this.file.size;
        this._registerLog("<p></p><strong>Starting incremental upload check (" + this.file.name + ")</strong><br/>", "checkStart");
        var query = this._getQueryString('check');
        var _this = this;
        var async = this.isAsync();
        this._xhr = new XMLHttpRequest();
        if(async) {
            this._requestTimer = setTimeout(function () {
                _this._onRequestTimeout();
            }, FileUploader.MAXIMUM_WAITING_TIME);
        }
        this._xhr.open("POST", this.url + query, async);
        this._xhr.onreadystatechange = function () {
            if(_this._xhr.readyState === 4) {
                if(!_this._isServerRespondOk()) {
                    _this.stopFileUpload();
                    return;
                }
                var responseText = _this._xhr.responseText;
                if(typeof $(responseText).attr("fname") != "undefined") {
                    _this._fname = $(responseText).attr("fname");
                }
                if(typeof $(responseText).attr("offset") != "undefined") {
                    _this._continueFromOffset = _this._offset = parseInt($(responseText).attr("offset"));
                    if(isNaN(_this._offset)) {
                        _this._offset = 0;
                    }
                    _this._registerLog("<strong>Continue</strong> file " + _this.file.name + " upload from <strong>" + _this._offset + "</strong>", "continue");
                }
                _this._registerLog("<strong>Check</strong> file " + _this.file.name + " complete. Friendly name : <strong>" + _this._fname + "</strong>. Offset :  <strong>" + _this._offset + "</strong>", "checkComplete");
            }
        };
        this._xhr.setRequestHeader("Content-Type", "application/octet-stream");
        try  {
            this._xhr.send(null);
        } catch (e) {
        }
        return true;
    };
    FileUploader.prototype.stopFileUpload = function () {
        this._running = false;
        clearTimeout(this._requestTimer);
        this.removeEventListener("checkComplete", this._onCheckComplete);
        if(this._xhr) {
            this._xhr.onreadystatechange = null;
            this._xhr.abort();
        }
        if(this.file) {
            this._registerLog("Upload stopped <strong id=\"" + this._uniqueId + "\">" + this._offset + "</strong> of <strong>" + this.file.size + "</strong><br/>", "stop");
        }
    };
    FileUploader.prototype.destroyNetworkConnection = function () {
        this.removeEventListener("checkComplete", this._onCheckComplete);
        clearTimeout(this._requestTimer);
        if(this._fileReader) {
            try  {
                this._fileReader.onload = null;
                this._fileReader.onerror = null;
                this._fileReader = null;
                delete this._fileReader;
            } catch (e) {
            }
        }
        if(this._xhr) {
            try  {
                this._xhr.abort();
            } catch (e) {
            }
            try  {
                if(typeof this._xhr.upload != 'undefined' && this._xhr.upload) {
                    this._xhr.upload.onprogress = null;
                    this._xhr.upload["onprogress"] = null;
                    delete this._xhr.upload["onprogress"];
                    try  {
                        delete this._xhr.upload;
                    } catch (e) {
                    }
                }
                this._xhr.onreadystatechange = null;
                this._xhr["onreadystatechange"] = null;
                delete this._xhr["onreadystatechange"];
                this._xhr.onprogress = null;
                this._xhr["onprogress"] = null;
                delete this._xhr["onprogress"];
                try  {
                    this._xhr.send = null;
                } catch (e) {
                }
                this._xhr.abort = null;
                this._xhr = null;
                delete this._xhr;
            } catch (e) {
            }
        }
    };
    FileUploader.prototype.reset = function () {
        clearTimeout(this._requestTimer);
        this._lastChunkSize = 0;
        this._currentChunkSize = 0;
        this._chunkTimer = -1;
        this._running = false;
        this._offset = 0;
        this._continueFromOffset = 0;
    };
    FileUploader.prototype.destroy = function () {
        this._running = false;
        this.reset();
        this.events.destroy();
        this.events = null;
        this.file = null;
        delete this.file;
        this.destroyNetworkConnection();
        this.onStateChange = null;
        delete this.onStateChange;
        if(this._blobSlice) {
            this._blobSlice.slice = null;
        }
        this._blobSlice = null;
        delete this._blobSlice;
    };
    FileUploader.prototype.isAsync = function () {
        return navigator.userAgent.toLowerCase().indexOf("webkit") < 0 || this.forceAsync;
    };
    FileUploader.prototype.getBytesPerSecond = function () {
        var a = (this.bytesUploaded - this._continueFromOffset) / ((new Date().getTime() - this._time) / 1000);
        a = (a.toString() == "Infinity") ? 0 : a;
        a = isNaN(a) ? 0 : a;
        return a.toString();
    };
    FileUploader.prototype.getChunkSize = function (chunkSize) {
        if(chunkSize < 0) {
            if(this._chunkTimer < 0) {
                chunkSize = this._lastChunkSize = this.minChunkSize;
            } else {
                var diff = (new Date().getTime()) - this._chunkTimer;
                chunkSize = this._lastChunkSize = Math.round(this._lastChunkSize / diff * 1000);
            }
            this._chunkTimer = new Date().getTime();
        }
        chunkSize = Math.min(Math.max(this.minChunkSize, chunkSize), this.maxChunkSize);
        return chunkSize;
    };
    FileUploader.prototype.addEventListener = function (type, listener) {
        return this.events.addEventListener(type, listener);
    };
    FileUploader.prototype.removeEventListener = function (type, listener) {
        if(this.events === null) {
            return false;
        }
        return this.events.removeEventListener(type, listener);
    };
    FileUploader.prototype.dispatchEvent = function (event) {
        this.events.dispatchEvent(event);
    };
    FileUploader.prototype._onCheckComplete = function (event) {
        var _this = event.target;
        _this.removeEventListener("checkComplete", _this._onCheckComplete);
        if(typeof _this.file != 'undefined') {
            _this._loadChunk();
        }
    };
    FileUploader.prototype._loadChunk = function () {
        this.destroyNetworkConnection();
        if(typeof this.file == 'undefined' || this.file == null || typeof this.file.name == 'undefined') {
            this._running = false;
            this._registerLog("<strong>Please select a file.</strong><br/>", "error");
            return;
        }
        if(!this._running) {
            this._registerLog("Upload stopped <strong id=\"" + this._uniqueId + "\">" + this._offset + "</strong> of <strong>" + this.file.size + "</strong><br/>", "stop");
            return;
        }
        var chunkSize = this.getChunkSize(this.chunkSize);
        this._fileReader = new FileReader();
        var _this = this;
        this._fileReader.onload = function (e) {
            _this._onChunkLoad(e);
        };
        this._fileReader.onerror = function (e) {
            _this._onReadFileError(e);
        };
        this.bytesUploaded = this._offset;
        var start = this._offset;
        var end = start + chunkSize >= this.file.size ? this.file.size : start + chunkSize;

        this._currentChunkSize = end - start;
        this._fileReader.readAsArrayBuffer(this._blobSlice.call(this.file, start, end));
    };
    FileUploader.prototype._onChunkLoad = function (e) {
        this._uploadChunk(e.target.result);
    };
    FileUploader.prototype._uploadChunk = function (chunk) {
        if(!this._running) {
            this._registerLog("Upload stopped <strong id=\"" + this._uniqueId + "\">" + this._offset + "</strong> of <strong>" + this.file.size + "</strong><br/>", "stop");
            return;
        }
        if(typeof this.file == 'undefined' || this.file == null || typeof this.file.name == 'undefined') {
            this._registerLog("<strong>Please select a file.</strong><br/>", "error");
            return;
        }
        var async = this.isAsync();
        if(!async) {
            this.bytesUploaded = this._offset;
        }
        var _this = this;
        onChunkUploadProgress();
        var query = this._getQueryString('upload');
        this._running = true;
        this._xhr = new XMLHttpRequest();
        if(async) {
            this._requestTimer = setTimeout(function () {
                _this._onRequestTimeout();
            }, FileUploader.MAXIMUM_WAITING_TIME);
        }
        this._xhr.open("POST", this.url + query, async);
        if(async) {
            this._xhr.addEventListener("progress", onChunkUploadProgress, false);
        }
        this._xhr.onreadystatechange = function () {
            if(_this._xhr.readyState === 4) {
                if(!_this._isServerRespondOk()) {
                    _this.stopFileUpload();
                    return;
                }
                var responseText = _this._xhr.responseText;
                if(typeof $(responseText).attr("fname") != "undefined") {
                    _this._fname = $(responseText).attr("fname");
                }
                if((_this._offset + _this._currentChunkSize) < _this.file.size) {
                    _this._offset += _this._currentChunkSize;
                    _this._loadChunk();
                } else {
                    _this._uploadComplete();
                }
            }
        };
        this._xhr.setRequestHeader("Content-Type", "application/octet-stream");
        try  {
            this._xhr.send(chunk);
        } catch (e) {
        }
        function onChunkUploadProgress(event) {
            if(typeof _this.file == 'undefined' || _this.file == null || typeof _this.file.name == 'undefined') {
                return;
            }
            _this.bytesUploaded = (typeof event == 'undefined') ? _this.bytesUploaded : _this._offset + event.loaded;
            _this._registerLog("Upload chunk <strong>(size: " + _this._currentChunkSize + ")</strong> <strong id=\"" + _this._uniqueId + "\">" + _this.bytesUploaded + "</strong> of <strong>" + _this.file.size + "</strong><br/>", "progress");
        }
    };
    FileUploader.prototype._getQueryString = function (action) {
        var query = "?fileAction=" + action + "&";
        query += "fileOffset=" + this._offset + "&";
        query += "fileSize=" + this.file.size + "&";
        query += "fileName=" + encodeURIComponent(this.file.name) + "&";
        query += "filePath=" + encodeURIComponent(this.filePath) + "&";
        query += "fileOverwrite=" + (this.fileOverwrite ? 1 : 0) + "&";
        query += "fileChecksum=" + this._fileChecksum;
        return query;
    };
    FileUploader.prototype._onRequestTimeout = function () {
        this._registerLog("Server request timeout. ", "timeout");
        this.stopFileUpload();
    };
    FileUploader.prototype._isServerRespondOk = function () {
        if(!this._xhr) {
            return false;
        }
        if(this._xhr.readyState === 4) {
            var status = this._xhr.status;
            if(status != 200) {
                if(status == 0) {
                    this._registerLog("Server request timeout. ", "timeout");
                } else {
                    this._registerLog("Server Error " + status, "error");
                }
                return false;
            }
            var responseText = this._xhr.responseText;
            if($(responseText).length == 0) {
                this._registerLog("Server did not respond", "error");
                return false;
            }
            if(responseText.indexOf('<success') != 0 && responseText.indexOf('<error') != 0) {
                this._registerLog(responseText, "error");
                return false;
            }
            if($(responseText).get(0).tagName.toUpperCase() == "ERROR") {
                this._errorId = parseInt($(responseText).attr("id"));
                if(isNaN(this._errorId)) {
                    this._errorId = -1;
                }
                this._registerLog($(responseText).text(), "error");
                return false;
            }
        }
        return true;
    };
    FileUploader.prototype._uploadComplete = function () {
        this.bytesUploaded = this.file.size;
        this._running = false;
        clearTimeout(this._requestTimer);
        this.reset();
        this.destroyNetworkConnection();
        this._registerLog("Upload chunk <strong>(size: " + this._currentChunkSize + ") <strong id=\"" + this._uniqueId + "\">" + this.bytesUploaded + "</strong> of <strong>" + this.file.size + "</strong><br/>", "progress");
        this._registerLog("<strong>Finished uploading!</strong><br/>", "complete");
    };
    FileUploader.prototype._onReadFileError = function (e) {
        console.log(e);
        this._running = false;
        this._registerLog("<strong>Oops, something went wrong.</strong>", "error");
    };
    FileUploader.prototype._registerLog = function (msg, eventType) {
        var event = {
            msg: msg,
            type: eventType,
            target: this,
            errorId: this._errorId,
            uniqueId: this._uniqueId,
            fileChecksum: this._fileChecksum,
            fname: this._fname,
            originalName: this._fileName,
            chunkSize: this._currentChunkSize,
            offset: this._offset,
            continueFromOffset: this._continueFromOffset,
            timeStarted: this._time,
            bytesUploaded: parseInt(this.bytesUploaded.toString()),
            bytesTotal: this._fileSize
        };
        if(typeof eventType != 'undefined') {
            this.dispatchEvent(event);
        }
        if(event.type == "error") {
            this.destroyNetworkConnection();
        }
        if(typeof this.onStateChange != 'undefined' && this.onStateChange != null) {
            if(typeof this.onStateChange === 'function') {
                this.onStateChange.call(this, event);
            } else {
                throw new Error("onStateChange callback is not a function");
            }
        }
    };
    return FileUploader;
})();
var EventListeners = (function () {
    function EventListeners() {
        this._listeners = {
        };
    }
    EventListeners.prototype.addEventListener = function (type, listener) {
        if(typeof this._listeners[type] == "undefined") {
            this._listeners[type] = [];
        }
        if(this.hasEventListener(type, listener)) {
            return false;
        }
        this._listeners[type].push(listener);
        return true;
    };
    EventListeners.prototype.dispatchEvent = function (event) {
        if(typeof event == "string") {
            event = {
                type: event
            };
        }
        if(!event.target) {
            event.target = this;
        }
        if(!event.type) {
            throw new Error("Event object missing 'type' property.");
        }
        if(this._listeners[event.type] instanceof Array) {
            var listeners = this._listeners[event.type];
            for(var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(event.target, event);
            }
        }
    };
    EventListeners.prototype.hasEventListener = function (type, listener) {
        if(this._listeners[type] instanceof Array) {
            var listeners = this._listeners[type];
            for(var i = 0, len = listeners.length; i < len; i++) {
                if(listeners[i] === listener) {
                    return true;
                }
            }
        }
        return false;
    };
    EventListeners.prototype.removeEventListener = function (type, listener) {
        if(this._listeners[type] instanceof Array) {
            var listeners = this._listeners[type];
            for(var i = 0, len = listeners.length; i < len; i++) {
                if(listeners[i] === listener) {
                    listeners.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };
    EventListeners.prototype.destroy = function () {
        this._listeners = {
        };
    };
    return EventListeners;
})();
var FileListManager = (function () {
    function FileListManager() {
        this.events = new EventListeners();
        this.length = 0;
        this.index = 0;
        this.list = [];
    }
    FileListManager.prototype.currentItem = function () {
        this.dispatchEvent({
            target: this,
            type: "navigate",
            index: this.index
        });
        return this.list[this.index];
    };
    FileListManager.prototype.nextIndex = function () {
        if(!this.hasNext()) {
            return;
        }
        this.index = this.index + 1;
        this.dispatchEvent({
            target: this,
            type: "navigate",
            index: this.index
        });
    };
    FileListManager.prototype.previousIndex = function () {
        if(this.index == 0) {
            return;
        }
        this.index = this.index - 1;
        this.dispatchEvent({
            target: this,
            type: "navigate",
            index: this.index
        });
    };
    FileListManager.prototype.currentIndex = function () {
        return this.index;
    };
    FileListManager.prototype.goToFirst = function () {
        this.dispatchEvent({
            target: this,
            type: "navigate",
            index: this.index
        });
        this.index = 0;
    };
    FileListManager.prototype.goToLast = function () {
        this.dispatchEvent({
            target: this,
            type: "navigate",
            index: this.index
        });
        this.index = this.list.length;
    };
    FileListManager.prototype.getItemIndex = function (name, size) {
        for(var i = 0, l = this.list.length; i < l; i++) {
            if(this.list[i].name === name && this.list[i].size === size) {
                return i;
            }
        }
        return -1;
    };
    FileListManager.prototype.addItem = function (item, dispatch) {
        if (typeof dispatch === "undefined") { dispatch = true; }
        if(this.hasItem(item)) {
            return false;
        }
        this.list.push(item);
        this.length = this.list.length;
        if(dispatch) {
            this.dispatchEvent({
                target: this,
                type: "add",
                index: this.index,
                itemsChanged: [
                    item
                ]
            });
        }
        return true;
    };
    FileListManager.prototype.hasNext = function () {
        return this.index < this.list.length;
    };
    FileListManager.prototype.hasItem = function (item) {
        for(var i = 0, l = this.list.length; i < l; i++) {
            if(this.list[i].name === item.name && this.list[i].size === item.size) {
                return true;
            }
        }
        return false;
    };
    FileListManager.prototype.removeItem = function (item, dispatch) {
        if(typeof item === "undefined" || item == null) {
            return false;
        }
        dispatch = typeof dispatch === "undefined" ? true : dispatch;
        for(var i = 0, l = this.list.length; i < l; i++) {
            if(this.list[i] === item) {
                this.list.splice(i, 1);
                this.length = this.list.length;
                if(dispatch) {
                    this.dispatchEvent({
                        target: this,
                        type: "remove",
                        index: this.index,
                        itemsChanged: [
                            item
                        ]
                    });
                }
                return true;
            }
        }
        return false;
    };
    FileListManager.prototype.addItems = function (items) {
        var itemsAdded = 0;
        for(var i = 0, l = items.length; i < l; i++) {
            if(this.addItem(items[i], false)) {
                itemsAdded++;
            }
        }
        this.dispatchEvent({
            target: this,
            type: "add",
            index: this.index,
            itemsChanged: items
        });
        return itemsAdded;
    };
    FileListManager.prototype.removeItems = function (items) {
        for(var i = 0, l = items.length; i < l; i++) {
            this.removeItem(items[i], false);
        }
        this.dispatchEvent({
            target: this,
            type: "remove",
            index: this.index,
            itemsChanged: items
        });
    };
    FileListManager.prototype.removeAll = function () {
        var itemsChanged = this.list.slice();
        this.index = 0;
        this.list = [];
        this.length = 0;
        this.dispatchEvent({
            target: this,
            type: "remove",
            index: this.index,
            itemsChanged: itemsChanged
        });
    };
    FileListManager.prototype.addEventListener = function (type, listener) {
        return this.events.addEventListener(type, listener);
    };
    FileListManager.prototype.removeEventListener = function (type, listener) {
        if(this.events === null) {
            return false;
        }
        return this.events.removeEventListener(type, listener);
    };
    FileListManager.prototype.dispatchEvent = function (event) {
        this.events.dispatchEvent(event);
    };
    FileListManager.prototype.destroy = function () {
        this.removeAll();
        this.events.destroy();
    };
    return FileListManager;
})();
