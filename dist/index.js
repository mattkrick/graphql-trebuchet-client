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
/* harmony import */ var _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GQLTrebuchetClient */ "./src/GQLTrebuchetClient.ts");

class GQLHTTPClient {
    constructor(fetchData) {
        this.fetchData = fetchData;
    }
    async fetch(operationPayload) {
        const res = await this.fetchData(JSON.stringify({ type: _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_0__["ServerMessageTypes"].GQL_START, payload: operationPayload }));
        return res.payload;
    }
}
/* harmony default export */ __webpack_exports__["default"] = (GQLHTTPClient);


/***/ }),

/***/ "./src/GQLTrebuchetClient.ts":
/*!***********************************!*\
  !*** ./src/GQLTrebuchetClient.ts ***!
  \***********************************/
/*! exports provided: ServerMessageTypes, ClientMessageTypes, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ServerMessageTypes", function() { return ServerMessageTypes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClientMessageTypes", function() { return ClientMessageTypes; });
/* harmony import */ var _mattkrick_trebuchet_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @mattkrick/trebuchet-client */ "@mattkrick/trebuchet-client");
/* harmony import */ var _mattkrick_trebuchet_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mattkrick_trebuchet_client__WEBPACK_IMPORTED_MODULE_0__);

var ServerMessageTypes;
(function (ServerMessageTypes) {
    ServerMessageTypes["GQL_START"] = "start";
    ServerMessageTypes["GQL_STOP"] = "stop";
})(ServerMessageTypes || (ServerMessageTypes = {}));
var ClientMessageTypes;
(function (ClientMessageTypes) {
    ClientMessageTypes["GQL_DATA"] = "data";
    ClientMessageTypes["GQL_ERROR"] = "error";
    ClientMessageTypes["GQL_COMPLETE"] = "complete";
})(ClientMessageTypes || (ClientMessageTypes = {}));
class GQLTrebuchetClient {
    constructor(trebuchet) {
        this.trebuchet = trebuchet;
        this.isTrebuchetClosed = false;
        this.operations = {};
        this.nextOperationId = 0;
        trebuchet.on(_mattkrick_trebuchet_client__WEBPACK_IMPORTED_MODULE_0__["Events"].DATA, (data) => {
            this.dispatch(typeof data === 'string' ? JSON.parse(data) : data);
        });
        trebuchet.on(_mattkrick_trebuchet_client__WEBPACK_IMPORTED_MODULE_0__["Events"].CLOSE, ({ reason }) => {
            this.isTrebuchetClosed = true;
            this.close(reason);
        });
        trebuchet.on(_mattkrick_trebuchet_client__WEBPACK_IMPORTED_MODULE_0__["Events"].TRANSPORT_DISCONNECTED, () => {
            Object.keys(this.operations).forEach((opId) => {
                this.send({
                    id: opId,
                    type: ServerMessageTypes.GQL_START,
                    payload: this.operations[opId].payload
                });
            });
        });
    }
    dispatch(message) {
        const { id: opId } = message;
        if (!this.operations[opId]) {
            this.unsubscribe(opId);
            return;
        }
        const { onCompleted, onError, onNext } = this.operations[opId].observer;
        switch (message.type) {
            case ClientMessageTypes.GQL_COMPLETE:
                onCompleted();
                delete this.operations[opId];
                break;
            case ClientMessageTypes.GQL_ERROR:
                onError(message.payload.errors);
                delete this.operations[opId];
                break;
            case ClientMessageTypes.GQL_DATA:
                onNext(message.payload);
        }
    }
    generateOperationId() {
        return String(++this.nextOperationId);
    }
    send(message) {
        this.trebuchet.send(JSON.stringify(message));
    }
    close(reason) {
        Object.keys(this.operations).forEach((opId) => {
            this.unsubscribe(opId);
        });
        if (!this.isTrebuchetClosed) {
            this.trebuchet.close(reason);
        }
    }
    fetch(payload) {
        return new Promise((resolve, reject) => {
            const opId = this.generateOperationId();
            this.operations[opId] = {
                id: opId,
                payload,
                observer: {
                    onNext: (result) => {
                        delete this.operations[opId];
                        resolve(result);
                    },
                    onError: (errors) => {
                        delete this.operations[opId];
                        const firstError = Array.isArray(errors) ? errors[0] : errors;
                        reject(firstError.message || firstError);
                    },
                    onCompleted: () => {
                        delete this.operations[opId];
                    }
                }
            };
            this.send({ id: opId, type: ServerMessageTypes.GQL_START, payload });
        });
    }
    subscribe(payload, observer) {
        const opId = this.generateOperationId();
        this.operations[opId] = {
            id: opId,
            payload,
            observer
        };
        this.send({ id: opId, type: ServerMessageTypes.GQL_START, payload });
        const unsubscribe = () => {
            this.unsubscribe(opId);
        };
        return { unsubscribe };
    }
    unsubscribe(opId) {
        if (this.operations[opId]) {
            delete this.operations[opId];
            this.send({ id: opId, type: ServerMessageTypes.GQL_STOP });
        }
    }
}
/* harmony default export */ __webpack_exports__["default"] = (GQLTrebuchetClient);


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: GQLHTTPClient, default, ServerMessageTypes, ClientMessageTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _GQLHTTPClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GQLHTTPClient */ "./src/GQLHTTPClient.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GQLHTTPClient", function() { return _GQLHTTPClient__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GQLTrebuchetClient */ "./src/GQLTrebuchetClient.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ServerMessageTypes", function() { return _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_1__["ServerMessageTypes"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ClientMessageTypes", function() { return _GQLTrebuchetClient__WEBPACK_IMPORTED_MODULE_1__["ClientMessageTypes"]; });






/***/ }),

/***/ "@mattkrick/trebuchet-client":
/*!**********************************************!*\
  !*** external "@mattkrick/trebuchet-client" ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@mattkrick/trebuchet-client");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map