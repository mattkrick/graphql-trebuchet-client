module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/GQLHTTPClient.ts":
/*!******************************!*\
  !*** ./src/GQLHTTPClient.ts ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return GQLHTTPClient; });
class GQLHTTPClient {
    constructor(fetchData) {
        this.fetchData = fetchData;
    }
    async fetch(payload, sink) {
        const res = await this.fetchData({ type: 'start', payload });
        sink.next(res.payload);
        sink.complete();
    }
}


/***/ }),

/***/ "./src/GQLTrebuchetClient.ts":
/*!***********************************!*\
  !*** ./src/GQLTrebuchetClient.ts ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class GQLTrebuchetClient {
    constructor(trebuchet) {
        this.trebuchet = trebuchet;
        this.operations = {};
        this.nextOperationId = 0;
        trebuchet.on('data', (data) => {
            this.dispatch(data);
        });
        trebuchet.on('reconnected', () => {
            Object.keys(this.operations).forEach((opId) => {
                this.trebuchet.send({
                    id: opId,
                    type: 'start',
                    payload: this.operations[opId].payload
                });
            });
        });
    }
    dispatch(message) {
        const { id: opId } = message;
        const operation = this.operations[opId];
        if (!operation)
            return;
        const { sink } = operation;
        switch (message.type) {
            case 'complete':
                delete this.operations[opId];
                if (message.payload) {
                    sink.next(message.payload);
                }
                sink.complete();
                break;
            case 'error':
                delete this.operations[opId];
                const { errors } = message.payload;
                const [firstError] = errors;
                sink.error(firstError);
                break;
            case 'data':
                sink.next(message.payload);
        }
    }
    generateOperationId() {
        return String(++this.nextOperationId);
    }
    unsubscribe(opId) {
        if (this.operations[opId]) {
            delete this.operations[opId];
            this.trebuchet.send({ id: opId, type: 'stop' });
        }
    }
    close(reason) {
        Object.keys(this.operations).forEach((opId) => {
            this.unsubscribe(opId);
        });
        this.trebuchet.close(reason);
    }
    fetch(payload, sink) {
        if (sink) {
            const opId = this.generateOperationId();
            this.operations[opId] = {
                id: opId,
                payload,
                sink
            };
            this.trebuchet.send({ id: opId, type: 'start', payload });
        }
        else {
            this.trebuchet.send({ type: 'start', payload });
        }
    }
    subscribe(payload, sink) {
        const opId = this.generateOperationId();
        this.operations[opId] = {
            id: opId,
            payload,
            sink
        };
        this.trebuchet.send({ id: opId, type: 'start', payload });
        const unsubscribe = () => {
            this.unsubscribe(opId);
        };
        return { unsubscribe };
    }
}
/* harmony default export */ __webpack_exports__["default"] = (GQLTrebuchetClient);


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: GQLHTTPClient, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _GQLHTTPClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GQLHTTPClient */ "./src/GQLHTTPClient.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GQLHTTPClient", function() { return _GQLHTTPClient__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GQLTrebuchetClient */ "./src/GQLTrebuchetClient.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* empty/unused harmony star reexport */




/***/ })

/******/ });
//# sourceMappingURL=index.js.map