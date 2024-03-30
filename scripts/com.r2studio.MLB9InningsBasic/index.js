var window = window || {};

/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/Rerouter/dist/index.js":
/*!*********************************************!*\
  !*** ./node_modules/Rerouter/dist/index.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.version = void 0;
__exportStar(__webpack_require__(/*! ./src/screen */ "./node_modules/Rerouter/dist/src/screen.js"), exports);
__exportStar(__webpack_require__(/*! ./src/rerouter */ "./node_modules/Rerouter/dist/src/rerouter.js"), exports);
__exportStar(__webpack_require__(/*! ./src/struct */ "./node_modules/Rerouter/dist/src/struct.js"), exports);
__exportStar(__webpack_require__(/*! ./src/utils */ "./node_modules/Rerouter/dist/src/utils.js"), exports);
exports.version = 1;
var writeFileTmp = writeFile;
// @ts-ignore
writeFile = function (path, content) {
    var rtn = writeFileTmp(path, content);
    execute("chmod 777 ".concat(path));
    return rtn;
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/Rerouter/dist/src/rerouter.js":
/*!****************************************************!*\
  !*** ./node_modules/Rerouter/dist/src/rerouter.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rerouter = exports.Rerouter = void 0;
var struct_1 = __webpack_require__(/*! ./struct */ "./node_modules/Rerouter/dist/src/struct.js");
var screen_1 = __webpack_require__(/*! ./screen */ "./node_modules/Rerouter/dist/src/screen.js");
var utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/Rerouter/dist/src/utils.js");
__webpack_require__(/*! core-js/es/object/assign */ "./node_modules/core-js/es/object/assign.js");
__webpack_require__(/*! core-js/es/array/find-index */ "./node_modules/core-js/es/array/find-index.js");
var Rerouter = /** @class */ (function () {
    function Rerouter() {
        this.debug = true;
        this.defaultConfig = struct_1.DefaultConfigValue;
        this.rerouterConfig = struct_1.DefaultRerouterConfig;
        this.screenConfig = struct_1.DefaultScreenConfig;
        this.screen = new screen_1.Screen(this.screenConfig);
        this.running = false;
        this.routeConflictRecord = [];
        this.routes = [];
        this.tasks = [];
        this.routeContext = null;
        this.unknownRouteAction = null;
        this.startAppRouteAction = null;
    }
    Rerouter.prototype.reset = function () {
        // NOTE: this is an another way that resets Rerouter, just leaving here for memory
        // rerouterContainer.instance = new Rerouter();
        // @ts-ignore included 'core-js/es/object/assign'
        Object.assign(this, new Rerouter());
    };
    /**
     * Recalculate some value like device width or height in screenConfig
     */
    Rerouter.prototype.init = function () {
        var _a;
        // sort routes by priority
        this.routes.sort(function (a, b) { return b.priority - a.priority; });
        // check and calculate screen config
        var deviceWH = getScreenSize();
        var max = Math.max(deviceWH.width, deviceWH.height);
        var min = Math.min(deviceWH.width, deviceWH.height);
        var dWidth = this.screenConfig.rotation === 'horizontal' ? max : min;
        var dHeight = this.screenConfig.rotation === 'vertical' ? max : min;
        this.screenConfig.deviceWidth = this.screenConfig.deviceWidth || dWidth;
        this.screenConfig.deviceHeight = this.screenConfig.deviceHeight || dHeight;
        this.screenConfig.screenWidth = this.screenConfig.screenWidth || dWidth;
        this.screenConfig.screenHeight = this.screenConfig.screenHeight || dHeight;
        this.log("screenWidth: ".concat(this.screenConfig.screenWidth, ", screenHeight: ").concat(this.screenConfig.screenHeight));
        this.screenConfig.logScreenshotFolder = utils_1.Utils.joinPaths(this.rerouterConfig.saveImageRoot, this.rerouterConfig.deviceId);
        if ((_a = this.rerouterConfig.savePageReference) === null || _a === void 0 ? void 0 : _a.enable) {
            var folderPath = this.rerouterConfig.savePageReference.folderPath || utils_1.Utils.joinPaths(this.rerouterConfig.saveImageRoot, 'pageReference');
            this.rerouterConfig.savePageReference.folderPath = folderPath;
            execute("mkdir -p ".concat(folderPath));
        }
        // new screen if screen config changed
        this.screen = new screen_1.Screen(this.screenConfig);
    };
    /**
     * Add RouteConfig to Rerouter routes, after starting Rerouter will run over all RouteConfigs to match screen and do action
     * @param config information about how route match and route action
     */
    Rerouter.prototype.addRoute = function (config) {
        // @ts-ignore included 'core-js/es/array/find-index'
        var existingRouteIndex = this.routes.findIndex(function (route) { return route.path === config.path; });
        // If it exists, log a warning and decide what to do next
        if (existingRouteIndex !== -1) {
            this.warning("A route with the path '".concat(config.path, "' already exists. Duplicate route will not be added."));
            // Option 1: Update the existing route with the new configuration
            // this.routes[existingRouteIndex] = this.wrapRouteConfigWithDefault(config);
            // Option 2: Simply return and don't add the new route
            return;
        }
        // If it doesn't exist, push the new route
        this.routes.push(this.wrapRouteConfigWithDefault(config));
    };
    /**
     * Tell Rerouter what to do if not matching any route
     * @param action function to do if not matching
     */
    Rerouter.prototype.addUnknownAction = function (action) {
        this.unknownRouteAction = action;
    };
    Rerouter.prototype.addStartAppAction = function (action) {
        this.startAppRouteAction = action;
    };
    /**
     * Add TaskConfig to Rerouter tasks, after starting Rerouter will run over all Tasks by task condition
     * @param config information about how task works
     */
    Rerouter.prototype.addTask = function (config) {
        this.tasks.push({
            name: config.name,
            config: this.wrapTaskConfigWithDefault(config),
            startTime: 0,
            lastRunTime: 0,
            runTimes: 0,
        });
    };
    /**
     * start Rerouter to run over tasks and routes
     * @param packageName
     */
    Rerouter.prototype.start = function (packageName) {
        this.rerouterConfig.packageName = packageName;
        // check tasks
        if (this.tasks.length === 0) {
            this.log("Rerouter start failed, no tasks ...");
            return;
        }
        this.init();
        this.log("Rerouter started ...");
        // task controller
        this.running = true;
        this.startTaskLoop();
        this.log("Rerouter stopped ...");
    };
    /**
     * stop Rerouter
     */
    Rerouter.prototype.stop = function () {
        this.log("Rerouter stop called, trying to stop task loop");
        this.running = false;
        if (this.routeContext !== null) {
            this.routeContext.scriptRunning = false;
        }
    };
    Rerouter.prototype.checkInApp = function () {
        var packageName = utils_1.Utils.getCurrentApp()[0];
        if (packageName === this.rerouterConfig.packageName) {
            return true;
        }
        return utils_1.Utils.isAppOnTop(this.rerouterConfig.packageName);
    };
    Rerouter.prototype.checkAndStartApp = function () {
        if (!this.checkInApp()) {
            this.log("AppIsNotStarted, startApp ".concat(this.rerouterConfig.packageName));
            this.startApp();
            return true;
        }
        return false;
    };
    Rerouter.prototype.startApp = function () {
        if (!this.rerouterConfig.packageName) {
            this.log("Rerouter start app failed, no packageName ...");
            return;
        }
        utils_1.Utils.startApp(this.rerouterConfig.packageName);
        utils_1.Utils.sleep(this.rerouterConfig.startAppDelay);
    };
    Rerouter.prototype.stopApp = function () {
        if (!this.rerouterConfig.packageName) {
            this.log("Rerouter stop app failed, no packageName ...");
            return;
        }
        utils_1.Utils.stopApp(this.rerouterConfig.packageName);
        utils_1.Utils.sleep(1000);
    };
    Rerouter.prototype.restartApp = function () {
        this.stopApp();
        this.startApp();
    };
    Rerouter.prototype.goNext = function (page) {
        if (page.next !== undefined) {
            this.screen.tap(page.next);
        }
        else {
            this.warning("".concat(page.name, " action == goNext, but no next xy"));
        }
    };
    Rerouter.prototype.goBack = function (page) {
        if (page.back !== undefined) {
            this.screen.tap(page.back);
        }
        else {
            this.warning("".concat(page.name, " action == goBack, but no back xy"));
        }
    };
    Rerouter.prototype.isPageMatch = function (page) {
        var image = this.screen.getCvtDevScreenshot();
        var isMatch = this.isPageMatchImage(page, image);
        releaseImage(image);
        return isMatch;
    };
    Rerouter.prototype.isPageMatchImage = function (page, image) {
        if (typeof page === 'string') {
            var p = this.getPageByName(page);
            if (p === null) {
                this.warning("isPageMatchImage ".concat(page, " not exist"));
                return false;
            }
            page = p;
        }
        if (page instanceof struct_1.Page) {
            return this.isMatchPageImpl(image, page, this.defaultConfig.PageThres, this.debug);
        }
        else {
            var pages = this.isMatchGroupPageImpl(image, page, this.defaultConfig.GroupPageThres, this.debug);
            return pages.length > 0;
        }
    };
    Rerouter.prototype.getPagesMatch = function (groupPage) {
        var image = this.screen.getCvtDevScreenshot();
        var match = this.getPagesMatchImage(groupPage, image, this.defaultConfig.GroupPageThres);
        releaseImage(image);
        return match;
    };
    Rerouter.prototype.getPagesMatchImage = function (groupPage, image, parentThres, debug) {
        var _a, _b;
        var pages = [];
        var thres = (_b = (_a = groupPage.thres) !== null && _a !== void 0 ? _a : parentThres) !== null && _b !== void 0 ? _b : this.defaultConfig.PageThres;
        for (var i = 0; i < groupPage.pages.length; i++) {
            var page = groupPage.pages[i];
            var isPageMatch = this.isMatchPageImpl(image, page, thres, this.debug);
            if (isPageMatch) {
                pages.push(page);
            }
        }
        return pages;
    };
    Rerouter.prototype.waitScreenForMatchingPage = function (page, timeout, matchTimes, interval) {
        var _this = this;
        if (matchTimes === void 0) { matchTimes = 1; }
        if (interval === void 0) { interval = 600; }
        return utils_1.Utils.waitForAction(function () { return _this.isPageMatch(page); }, timeout, matchTimes, interval);
    };
    Rerouter.prototype.isRouteMatch = function (route) {
        var image = this.screen.getCvtDevScreenshot();
        var isMatch = this.isRouteMatchImage(route, image);
        releaseImage(image);
        return isMatch;
    };
    Rerouter.prototype.isRouteMatchImage = function (route, image) {
        var routeConfig = this.getRouteConfig(route);
        if (routeConfig === null) {
            this.warning("isRouteMatchImage ".concat(route, " not exist"));
            return false;
        }
        var filledRouteConfig = this.wrapRouteConfigWithDefault(routeConfig);
        var rotation = this.screen.getImageRotation(image);
        var isMatched = this.isMatchRouteImpl(image, rotation, filledRouteConfig, 'waitScreenForMatchingRoute').isMatched;
        if (isMatched) {
            return true;
        }
        return false;
    };
    Rerouter.prototype.waitScreenForMatchingRoute = function (route, timeout, matchTimes, interval) {
        var _this = this;
        if (matchTimes === void 0) { matchTimes = 1; }
        if (interval === void 0) { interval = 600; }
        return utils_1.Utils.waitForAction(function () { return _this.isRouteMatch(route); }, timeout, matchTimes, interval);
    };
    Rerouter.prototype.getPageByName = function (name) {
        var _a;
        for (var _i = 0, _b = this.routes; _i < _b.length; _i++) {
            var route = _b[_i];
            if (name === ((_a = route.match) === null || _a === void 0 ? void 0 : _a.name)) {
                return route.match;
            }
        }
        return null;
    };
    Rerouter.prototype.getRouteConfigByPath = function (path) {
        for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
            var route = _a[_i];
            if (path === route.path) {
                return route;
            }
        }
        return null;
    };
    Rerouter.prototype.getCurrentMatchNames = function () {
        var _this = this;
        var image = this.screen.getCvtDevScreenshot();
        var matchedNames = [];
        this.routes.forEach(function (route) {
            var match = route.match;
            if ((match instanceof struct_1.Page && _this.isMatchPageImpl(image, match, _this.defaultConfig.PageThres, _this.debug)) ||
                (match instanceof struct_1.GroupPage && _this.isMatchGroupPageImpl(image, match, _this.defaultConfig.PageThres, _this.debug).length > 0)) {
                matchedNames.push(match.name);
            }
        });
        this.log("current match: ", matchedNames);
        releaseImage(image);
        return matchedNames;
    };
    Rerouter.prototype.getRouteConfig = function (r) {
        var route;
        if (typeof r === 'string') {
            route = this.getRouteConfigByPath(r);
        }
        else {
            route = r;
        }
        return route;
    };
    Rerouter.prototype.wrapRouteConfigWithDefault = function (config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return {
            path: config.path,
            action: config.action,
            match: (_a = config.match) !== null && _a !== void 0 ? _a : null,
            customMatch: (_b = config.customMatch) !== null && _b !== void 0 ? _b : null,
            rotation: (_c = config.rotation) !== null && _c !== void 0 ? _c : this.screenConfig.rotation,
            shouldMatchTimes: (_d = config.shouldMatchTimes) !== null && _d !== void 0 ? _d : this.defaultConfig.RouteConfigShouldMatchTimes,
            shouldMatchDuring: (_e = config.shouldMatchDuring) !== null && _e !== void 0 ? _e : this.defaultConfig.RouteConfigShouldMatchDuring,
            beforeActionDelay: (_f = config.beforeActionDelay) !== null && _f !== void 0 ? _f : this.defaultConfig.RouteConfigBeforeActionDelay,
            afterActionDelay: (_g = config.afterActionDelay) !== null && _g !== void 0 ? _g : this.defaultConfig.RouteConfigAfterActionDelay,
            priority: (_h = config.priority) !== null && _h !== void 0 ? _h : this.defaultConfig.RouteConfigPriority,
            debug: (_j = config.debug) !== null && _j !== void 0 ? _j : this.defaultConfig.RouteConfigDebug,
        };
    };
    Rerouter.prototype.wrapTaskConfigWithDefault = function (config) {
        var _a, _b, _c, _d, _e, _f, _g;
        return {
            name: config.name,
            maxTaskRunTimes: (_a = config.maxTaskRunTimes) !== null && _a !== void 0 ? _a : this.defaultConfig.TaskConfigMaxTaskRunTimes,
            maxTaskDuring: (_b = config.maxTaskDuring) !== null && _b !== void 0 ? _b : this.defaultConfig.TaskConfigMaxTaskDuring,
            minRoundInterval: (_c = config.minRoundInterval) !== null && _c !== void 0 ? _c : this.defaultConfig.TaskConfigMinRoundInterval,
            forceStop: (_d = config.forceStop) !== null && _d !== void 0 ? _d : this.defaultConfig.TaskConfigAutoStop,
            findRouteDelay: (_e = config.findRouteDelay) !== null && _e !== void 0 ? _e : this.defaultConfig.TaskConfigFindRouteDelay,
            beforeRoute: (_f = config.beforeRoute) !== null && _f !== void 0 ? _f : null,
            afterRoute: (_g = config.afterRoute) !== null && _g !== void 0 ? _g : null,
        };
    };
    Rerouter.prototype.startTaskLoop = function () {
        var taskIdx = 0;
        while (this.running) {
            var task = this.tasks[taskIdx % this.tasks.length];
            taskIdx++;
            var now = Date.now();
            var isTaskRunFirstTime = task.lastRunTime === 0;
            if (now - task.lastRunTime <= task.config.minRoundInterval && !isTaskRunFirstTime) {
                this.log("Task: ".concat(task.name, " during: ").concat(now - task.lastRunTime, " <= minRoundInterval, skip"));
                utils_1.Utils.sleep(this.rerouterConfig.taskDelay);
                continue;
            }
            task.startTime = now;
            task.runTimes = 0;
            var exitTask = false;
            for (var i = 0; i < task.config.maxTaskRunTimes && this.running && !exitTask; i++) {
                this.log("Task: ".concat(task.name, " run ").concat(task.runTimes));
                var skipRoute = false;
                if (task.config.beforeRoute !== null) {
                    this.log("Task: ".concat(task.name, " run ").concat(task.runTimes, " do beforeRoute()"));
                    if (task.config.beforeRoute(task) === 'skipRouteLoop') {
                        skipRoute = true;
                    }
                }
                if (skipRoute) {
                    this.log("Task: ".concat(task.name, " run ").concat(task.runTimes, " skipRouteLoop"));
                }
                else {
                    exitTask = this.startRouteLoop(task);
                }
                if (task.config.afterRoute !== null) {
                    this.log("Task: ".concat(task.name, " run ").concat(task.runTimes, " do afterRoute()"));
                    task.config.afterRoute(task);
                }
                task.runTimes++;
                task.lastRunTime = now;
                var during = now - task.startTime;
                if (task.config.maxTaskDuring > 0 && during >= task.config.maxTaskDuring) {
                    this.log("Task: ".concat(task.name, " taskDuring: ").concat(during, "/").concat(task.config.maxTaskDuring, " reached, stop"));
                    break;
                }
            }
            utils_1.Utils.sleep(this.rerouterConfig.taskDelay);
        }
    };
    Rerouter.prototype.startRouteLoop = function (task) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.routeContext = {
            task: task,
            screen: this.screen,
            scriptRunning: this.running,
            path: '',
            lastMatchedPath: (_b = (_a = this.routeContext) === null || _a === void 0 ? void 0 : _a.lastMatchedPath) !== null && _b !== void 0 ? _b : '',
            matchTimes: 0,
            matchStartTS: 0,
            matchDuring: 0,
        };
        var routeLoop = true;
        var exitTaskResult = false;
        var finishRoundFunc = function (exitTask) {
            var _a;
            if (exitTask === void 0) { exitTask = false; }
            routeLoop = false;
            exitTaskResult = exitTask;
            _this.log("finish round: ".concat((_a = _this.routeContext) === null || _a === void 0 ? void 0 : _a.task.name, "; exitTask: ").concat(exitTask));
        };
        // pointer for short code
        var context = this.routeContext;
        while (routeLoop && this.running) {
            var now = Date.now();
            // check task.autoStop
            var taskRunDuring = now - task.startTime;
            if (task.config.forceStop && taskRunDuring > task.config.maxTaskDuring) {
                this.log("Task ".concat(task.name, " AutoStop, exceed taskRunDuring"));
                break;
            }
            // check isAppOn or auto launch it
            if (this.rerouterConfig.autoLaunchApp) {
                if (this.checkAndStartApp()) {
                    if (this.startAppRouteAction !== null) {
                        this.startAppRouteAction(context, finishRoundFunc);
                    }
                    continue;
                }
            }
            var rotation = this.screen.getRotation();
            var image = this.screen.getCvtDevScreenshot();
            var matches = this.findMatchedRouteImpl(task.name, image, rotation);
            var matchedRoute = (_c = matches[0]) === null || _c === void 0 ? void 0 : _c.matchedRoute;
            var matchedPages = (_d = matches[0]) === null || _d === void 0 ? void 0 : _d.matchedPages;
            // context.matchStartTS = 0 if init run
            context.matchStartTS = context.matchStartTS || now;
            context.path = (_e = matchedRoute === null || matchedRoute === void 0 ? void 0 : matchedRoute.path) !== null && _e !== void 0 ? _e : '';
            // first match
            if (context.path !== context.lastMatchedPath) {
                context.matchTimes = 0;
                context.matchStartTS = now;
            }
            context.matchDuring = now - context.matchStartTS;
            context.matchTimes++;
            switch (matches.length) {
                case 0:
                    // no match
                    if (this.unknownRouteAction !== null) {
                        this.unknownRouteAction(context, image, finishRoundFunc);
                    }
                    break;
                case 1:
                    // perfect match 1
                    this.doActionForRoute(context, image, matchedRoute, matchedPages, finishRoundFunc);
                    break;
                default:
                    // conflict
                    var error = this.handleConflictRoutes(task.name, image, matches, finishRoundFunc);
                    if (error) {
                        releaseImage(image);
                        throw error;
                    }
                    break;
            }
            // update lastMatchedPath after action done
            // otherwise the lastMatchedPath will be current path when doing action
            context.lastMatchedPath = context.path;
            releaseImage(image);
            utils_1.Utils.sleep(task.config.findRouteDelay);
        }
        return exitTaskResult;
    };
    Rerouter.prototype.doActionForRoute = function (context, image, route, matchedPages, finishRound) {
        var _a, _b;
        this.logImpl(route.debug, "handleMatchedRoute: ".concat(route.path, ", times: ").concat(context.matchTimes, ", during: ").concat(context.matchDuring));
        if (context.matchTimes < route.shouldMatchTimes || context.matchDuring < route.shouldMatchDuring) {
            // should still wait for matching condition
            return;
        }
        var nextXY = (_a = matchedPages[0]) === null || _a === void 0 ? void 0 : _a.next;
        var backXY = (_b = matchedPages[0]) === null || _b === void 0 ? void 0 : _b.back;
        // matched and fit condition, do action
        utils_1.Utils.sleep(route.beforeActionDelay);
        if (route.action === 'goNext') {
            if (nextXY !== undefined) {
                this.screen.tap(nextXY);
            }
            else {
                this.warning("".concat(route.path, " action == goNext, but no next xy"));
            }
        }
        else if (route.action === 'goBack') {
            if (backXY !== undefined) {
                this.screen.tap(backXY);
            }
            else {
                this.warning("".concat(route.path, " action == goBack, but no back xy"));
            }
        }
        else if (route.action === 'keycodeBack') {
            keycode('BACK', this.screenConfig.actionDuring);
        }
        else {
            route.action(context, image, matchedPages, finishRound);
        }
        this.savePageReferenceImage(image, matchedPages);
        utils_1.Utils.sleep(route.afterActionDelay);
    };
    Rerouter.prototype.findMatchedRouteImpl = function (taskName, image, rotation) {
        var matches = [];
        for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
            var route = _a[_i];
            var _b = this.isMatchRouteImpl(image, rotation, route, taskName), isMatched = _b.isMatched, matchedPages = _b.matchedPages;
            if (isMatched) {
                this.logImpl(route.debug, 'current match:', matchedPages.map(function (p) { return p.name; }));
                matches.push({ matchedRoute: route, matchedPages: matchedPages });
            }
        }
        return matches;
    };
    Rerouter.prototype.handleConflictRoutes = function (taskName, image, matches, finishRound) {
        var matchDetails = matches
            .map(function (item) {
            var _a;
            var path = ((_a = item.matchedRoute) === null || _a === void 0 ? void 0 : _a.path) || 'emptyRoutePath';
            var pages = item.matchedPages.map(function (p) { return p.name; });
            return "".concat(path, ": (").concat(pages.join(', '), ")");
        })
            .join('\n');
        var warningMsg = "a route conflict when in Task: \"".concat(taskName, "\", details: \n").concat(matchDetails);
        this.warning(warningMsg);
        if (this.rerouterConfig.debugSlackUrl !== '') {
            utils_1.Utils.sendSlackMessage(this.rerouterConfig.debugSlackUrl, 'Conflict Routes Report', "".concat(struct_1.DefaultRerouterConfig.deviceId, " just logged ").concat(warningMsg));
        }
        if (this.rerouterConfig.strictMode) {
            // TODO: save image rather than take another screenshot
            utils_1.Utils.saveScreenshotToDisk(this.rerouterConfig.saveImageRoot, "".concat(struct_1.DefaultRerouterConfig.deviceId, "_conflictedRoutes"));
            return new Error("Intentional crash due to multiple route applied to current screen: ".concat(matchDetails));
        }
        // default handle conflict routes in non-strict mode
        this.log("try handle conflict");
        finishRound(true);
        var now = Date.now();
        this.routeConflictRecord.push(now);
        var duringLimit = 60 * 1000;
        var countsLimit = 5;
        while (this.routeConflictRecord.length > 0 && now - this.routeConflictRecord[0] > duringLimit) {
            this.routeConflictRecord.shift();
        }
        if (this.routeConflictRecord.length >= countsLimit) {
            this.routeConflictRecord = [now];
            this.restartApp();
            return;
        }
        keycode('BACK', this.screenConfig.actionDuring);
    };
    Rerouter.prototype.isMatchRouteImpl = function (image, rotation, route, taskName) {
        var _a;
        // check rotation
        if (route.rotation !== rotation) {
            this.logImpl(route.debug, "findMatchedRoute ".concat(route.path, " not match rotation, skip"));
            return { isMatched: false, matchedPages: [] };
        }
        var isMatched = false;
        var matchedPages = [];
        // check route.match
        if (route.match !== null) {
            if (route.match instanceof struct_1.Page) {
                var match = this.isMatchPageImpl(image, route.match, this.defaultConfig.PageThres, route.debug);
                if (match) {
                    isMatched = true;
                    matchedPages.push(route.match);
                }
            }
            else if (route.match instanceof struct_1.GroupPage) {
                var match = this.isMatchGroupPageImpl(image, route.match, this.defaultConfig.GroupPageThres, route.debug);
                if (match.length !== 0) {
                    isMatched = true;
                    matchedPages.push.apply(matchedPages, match);
                }
            }
        }
        // check route.isMatch function
        if (!isMatched && route.customMatch !== null) {
            isMatched = route.customMatch(taskName, image);
            this.logImpl(route.debug, "findMatchedRoute ".concat(route.path, " isMatch() => ").concat(isMatched));
        }
        this.logImpl(route.debug, "findMatchedRoute ".concat(route.path, " match: ").concat(isMatched, ", firstPage: ").concat((_a = matchedPages[0]) === null || _a === void 0 ? void 0 : _a.name));
        return {
            isMatched: isMatched,
            matchedPages: matchedPages,
        };
    };
    Rerouter.prototype.isMatchPageImpl = function (image, page, parentThres, debug) {
        var _a, _b, _c;
        var pageThres = page.thres;
        var isSame = true;
        this.logImpl(debug, "checkMatchPage[".concat(page.name, "]"));
        for (var i = 0; isSame && i < page.points.length; i++) {
            var point = page.points[i];
            var thres = (_b = (_a = point.thres) !== null && _a !== void 0 ? _a : pageThres) !== null && _b !== void 0 ? _b : parentThres;
            var shouldMatch = (_c = point.match) !== null && _c !== void 0 ? _c : true;
            var color = getImageColor(image, point.x, point.y);
            var score = utils_1.Utils.identityColor(point, color);
            var isPointColorMatch = score >= thres === shouldMatch;
            if (!isPointColorMatch) {
                isSame = false;
                this.logImpl(debug, "point[".concat(i, "] match false: score: ").concat(score, ", thres: ").concat(thres, "\n"), "expect: ".concat(utils_1.Utils.formatXYRGB(point), "\n"), "   get: ".concat(utils_1.Utils.formatXYRGB(__assign(__assign({}, color), { x: point.x, y: point.y }))));
            }
        }
        this.logImpl(debug, "checkMatchPage[".concat(page.name, "][match: ").concat(isSame, "]"));
        return isSame;
    };
    Rerouter.prototype.isMatchGroupPageImpl = function (image, groupPage, parentThres, debug) {
        var _a;
        var thres = (_a = groupPage.thres) !== null && _a !== void 0 ? _a : parentThres;
        for (var i = 0; i < groupPage.pages.length; i++) {
            var page = groupPage.pages[i];
            var isPageMatch = this.isMatchPageImpl(image, page, thres, debug);
            this.logImpl(debug, "checkMatchGroupPage: ".concat(groupPage.name, ", page[").concat(i, "]: ").concat(page.name, " match: ").concat(isPageMatch));
            if (groupPage.matchOP === '||' && isPageMatch) {
                return [page];
            }
            if (groupPage.matchOP === '&&' && !isPageMatch) {
                return [];
            }
        }
        return groupPage.matchOP === '&&' ? groupPage.pages : [];
    };
    Rerouter.prototype.savePageReferenceImage = function (image, matchedPages) {
        var _a = this.rerouterConfig.savePageReference || {}, enable = _a.enable, folderPath = _a.folderPath, rgba = _a.rgba;
        if (!enable || !folderPath || matchedPages.length === 0) {
            return;
        }
        matchedPages.forEach(function (page) {
            utils_1.Utils.savePointsMarkedImage({
                image: image,
                name: page.name,
                points: page.points,
                folderPath: folderPath,
                rgba: rgba,
            });
        });
    };
    Rerouter.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.logImpl.apply(this, __spreadArray([this.debug], args, false));
    };
    Rerouter.prototype.logImpl = function (debug) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!debug || !this.debug) {
            return;
        }
        // only log when debug + this.debug is true
        utils_1.Utils.log.apply(utils_1.Utils, __spreadArray(['[Rerouter][debug]'], args, false));
    };
    Rerouter.prototype.warning = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        utils_1.Utils.log.apply(utils_1.Utils, __spreadArray(['[Rerouter][warning]'], args, false));
    };
    return Rerouter;
}());
exports.Rerouter = Rerouter;
// NOTE: this is an another way that resets Rerouter, just leaving here for memory
// const rerouterContainer = {
//   instance: new Rerouter(),
// };
// import 'proxy-polyfill';
// export const rerouter: Rerouter = new Proxy(rerouterContainer, {
//   get: (target, prop: keyof Rerouter) => {
//     return target.instance[prop];
//   },
//   set: (target, prop: keyof Rerouter, value: any) => {
//     target.instance[prop] = value;
//     return true;
//   },
// }) as any as Rerouter;
exports.rerouter = new Rerouter();
//# sourceMappingURL=rerouter.js.map

/***/ }),

/***/ "./node_modules/Rerouter/dist/src/screen.js":
/*!**************************************************!*\
  !*** ./node_modules/Rerouter/dist/src/screen.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Screen = void 0;
var utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/Rerouter/dist/src/utils.js");
var Screen = /** @class */ (function () {
    function Screen(config) {
        this.config = config;
    }
    Screen.prototype.calculateDeviceOffset = function (func) {
        var results = func(this);
        this.config.screenWidth = results.screenWidth;
        this.config.screenHeight = results.screenHeight;
        this.config.screenOffsetX = results.screenOffsetX;
        this.config.screenOffsetY = results.screenOffsetY;
    };
    Screen.prototype.getScreenX = function (devX) {
        return Math.floor(this.config.screenOffsetX + (devX * this.config.screenWidth) / this.config.devWidth) || 0;
    };
    Screen.prototype.getScreenY = function (devY) {
        return Math.floor(this.config.screenOffsetY + (devY * this.config.screenHeight) / this.config.devHeight) || 0;
    };
    Screen.prototype.getScreenXY = function (p1, p2) {
        if (p2 === void 0) { p2 = undefined; }
        if (typeof p1 === 'object') {
            var x = this.getScreenX(p1.x);
            var y = this.getScreenY(p1.y);
            return { x: x, y: y };
        }
        else if (typeof p1 === 'number' && typeof p2 === 'number') {
            var x = this.getScreenX(p1);
            var y = this.getScreenY(p2);
            return { x: x, y: y };
        }
        else {
            throw new Error("getScreenXY wrong params ".concat(p1, ", ").concat(p2));
        }
    };
    Screen.prototype.tap = function (p1, p2) {
        if (p2 === void 0) { p2 = undefined; }
        if (typeof p1 === 'object') {
            var x = this.getScreenX(p1.x);
            var y = this.getScreenY(p1.y);
            tap(x, y, this.config.actionDuring);
        }
        else if (typeof p1 === 'number' && typeof p2 === 'number') {
            var x = this.getScreenX(p1);
            var y = this.getScreenY(p2);
            tap(x, y, this.config.actionDuring);
        }
        else {
            throw new Error("tapDown wrong params ".concat(p1, ", ").concat(p2));
        }
    };
    Screen.prototype.tapDown = function (p1, p2) {
        if (p2 === void 0) { p2 = undefined; }
        if (typeof p1 === 'object') {
            var x = this.getScreenX(p1.x);
            var y = this.getScreenY(p1.y);
            tapDown(x, y, this.config.actionDuring);
        }
        else if (typeof p1 === 'number' && typeof p2 === 'number') {
            var x = this.getScreenX(p1);
            var y = this.getScreenY(p2);
            tapDown(x, y, this.config.actionDuring);
        }
        else {
            throw new Error("tapDown wrong params ".concat(p1, ", ").concat(p2));
        }
    };
    Screen.prototype.moveTo = function (p1, p2) {
        if (p2 === void 0) { p2 = undefined; }
        if (typeof p1 === 'object') {
            var x = this.getScreenX(p1.x);
            var y = this.getScreenY(p1.y);
            moveTo(x, y, this.config.actionDuring);
        }
        else if (typeof p1 === 'number' && typeof p2 === 'number') {
            var x = this.getScreenX(p1);
            var y = this.getScreenY(p2);
            moveTo(x, y, this.config.actionDuring);
        }
        else {
            throw new Error("tapDown wrong params ".concat(p1, ", ").concat(p2));
        }
    };
    Screen.prototype.tapUp = function (p1, p2) {
        if (p2 === void 0) { p2 = undefined; }
        if (typeof p1 === 'object') {
            var x = this.getScreenX(p1.x);
            var y = this.getScreenY(p1.y);
            tapUp(x, y, this.config.actionDuring);
        }
        else if (typeof p1 === 'number' && typeof p2 === 'number') {
            var x = this.getScreenX(p1);
            var y = this.getScreenY(p2);
            tapUp(x, y, this.config.actionDuring);
        }
        else {
            throw new Error("tapDown wrong params ".concat(p1, ", ").concat(p2));
        }
    };
    Screen.prototype.getScreenColor = function (p1, p2) {
        if (p2 === void 0) { p2 = undefined; }
        if (typeof p1 === 'object') {
            var img = this.getCvtDevScreenshot();
            var rgb = getImageColor(img, p1.x, p1.y);
            releaseImage(img);
            return rgb;
        }
        else if (typeof p1 === 'number' && typeof p2 === 'number') {
            var img = this.getCvtDevScreenshot();
            var rgb = getImageColor(img, p1, p2);
            releaseImage(img);
            return rgb;
        }
        else {
            throw new Error("tapDown wrong params ".concat(p1, ", ").concat(p2));
        }
    };
    Screen.prototype.findImage = function (devImg) {
        var img = this.getCvtDevScreenshot();
        var result = findImage(img, devImg);
        releaseImage(img);
        return result;
    };
    Screen.prototype.tapImage = function (devImg) {
        var xy = this.findImage(devImg);
        this.tap(xy);
    };
    Screen.prototype.isSameColor = function (devColorPoint, thres) {
        if (thres === void 0) { thres = 0.9; }
        var rgb = this.getScreenColor(devColorPoint);
        var score = utils_1.Utils.identityColor(rgb, devColorPoint);
        if (score > thres) {
            return true;
        }
        return false;
    };
    Screen.prototype.isSameColorImage = function (devColorPoint, image, thres) {
        if (thres === void 0) { thres = 0.9; }
        var rgb = getImageColor(image, devColorPoint.x, devColorPoint.y);
        var score = utils_1.Utils.identityColor(rgb, devColorPoint);
        if (score > thres) {
            return true;
        }
        return false;
    };
    // currently real device screenshot
    Screen.prototype.getDeviceScreenshot = function () {
        return getScreenshot();
    };
    // currently device screenshot cut by offset
    Screen.prototype.getScreenScreenshot = function () {
        return getScreenshotModify(this.config.screenOffsetX, this.config.screenOffsetY, this.config.screenWidth, this.config.screenHeight, this.config.screenWidth, this.config.screenHeight, 100);
    };
    Screen.prototype.checkAndSaveScreenshots = function () {
        if (this.config.logScreenshotFolder !== '' && Date.now() - this.config.logScreenshotLastTime > this.config.logScreenshotMinIntervalInSec * 1000) {
            this.config.logScreenshotLastTime = Date.now();
            utils_1.Utils.saveScreenshotToDisk(this.config.logScreenshotFolder, 'log');
            utils_1.Utils.removeOldestFilesIfExceedsLimit(this.config.logScreenshotFolder, this.config.logScreenshotMaxFiles);
        }
    };
    Screen.prototype.getCvtDevScreenshot = function () {
        this.checkAndSaveScreenshots();
        return getScreenshotModify(this.config.screenOffsetX, this.config.screenOffsetY, this.config.screenWidth, this.config.screenHeight, this.config.devWidth, this.config.devHeight, 100);
    };
    Screen.prototype.getRotation = function () {
        var _a = getScreenSize(), width = _a.width, height = _a.height;
        if (width > height) {
            return 'horizontal';
        }
        return 'vertical';
    };
    Screen.prototype.getImageRotation = function (image) {
        var _a = getImageSize(image), width = _a.width, height = _a.height;
        if (width > height) {
            return 'horizontal';
        }
        return 'vertical';
    };
    Screen.prototype.setActionDuring = function (during) {
        this.config.actionDuring = during;
    };
    Screen.debug = false;
    return Screen;
}());
exports.Screen = Screen;
//# sourceMappingURL=screen.js.map

/***/ }),

/***/ "./node_modules/Rerouter/dist/src/struct.js":
/*!**************************************************!*\
  !*** ./node_modules/Rerouter/dist/src/struct.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultScreenConfig = exports.DefaultRerouterConfig = exports.DefaultConfigValue = exports.GroupPage = exports.Page = void 0;
var Page = /** @class */ (function () {
    function Page(name, devPoints, next, back, thres) {
        if (next === void 0) { next = undefined; }
        if (back === void 0) { back = undefined; }
        if (thres === void 0) { thres = undefined; }
        this.name = name;
        this.points = devPoints;
        this.next = next;
        this.back = back;
        this.thres = thres;
    }
    return Page;
}());
exports.Page = Page;
var GroupPage = /** @class */ (function () {
    function GroupPage(name, pages, next, back, thres, matchOP) {
        if (next === void 0) { next = undefined; }
        if (back === void 0) { back = undefined; }
        if (thres === void 0) { thres = undefined; }
        if (matchOP === void 0) { matchOP = undefined; }
        this.name = name;
        this.pages = pages;
        this.next = next;
        this.back = back;
        this.thres = thres;
        this.matchOP = matchOP || '||';
    }
    return GroupPage;
}());
exports.GroupPage = GroupPage;
exports.DefaultConfigValue = {
    XYRGBThres: 0.9,
    PageThres: 0.9,
    GroupPageThres: 0.9,
    GroupPageMatchOP: '||',
    RouteConfigShouldMatchTimes: 1,
    RouteConfigShouldMatchDuring: 0,
    RouteConfigBeforeActionDelay: 250,
    RouteConfigAfterActionDelay: 250,
    RouteConfigPriority: 1,
    RouteConfigDebug: false,
    TaskConfigMaxTaskRunTimes: 1,
    TaskConfigMaxTaskDuring: 0,
    TaskConfigMinRoundInterval: 0,
    TaskConfigAutoStop: false,
    TaskConfigFindRouteDelay: 2000,
};
exports.DefaultRerouterConfig = {
    packageName: '',
    taskDelay: 2000,
    startAppDelay: 6000,
    autoLaunchApp: true,
    testingScreenshotPath: './screenshot',
    deviceId: '',
    strictMode: false,
    debugSlackUrl: '',
    saveImageRoot: '/sdcard/Pictures/Screenshots/robotmon',
};
exports.DefaultScreenConfig = {
    devWidth: 640,
    devHeight: 360,
    deviceWidth: 0,
    deviceHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    screenOffsetX: 0,
    screenOffsetY: 0,
    actionDuring: 180,
    rotation: 'horizontal',
    logScreenshotLastTime: 0,
    logScreenshotMinIntervalInSec: 10,
    logScreenshotMaxFiles: 100,
    logScreenshotFolder: '',
};
//# sourceMappingURL=struct.js.map

/***/ }),

/***/ "./node_modules/Rerouter/dist/src/utils.js":
/*!*************************************************!*\
  !*** ./node_modules/Rerouter/dist/src/utils.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = exports.log = void 0;
function log() {
    var msgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msgs[_i] = arguments[_i];
    }
    var date = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Taipei',
    });
    var message = "[".concat(date, "] ");
    for (var _a = 0, msgs_1 = msgs; _a < msgs_1.length; _a++) {
        var msg = msgs_1[_a];
        if (typeof msg === 'object') {
            message += "".concat(JSON.stringify(msg), " ");
        }
        else {
            message += "".concat(msg, " ");
        }
    }
    console.log(message.substr(0, message.length - 1));
}
exports.log = log;
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.identityColor = function (e1, e2) {
        var mean = (e1.r + e2.r) / 2;
        var r = e1.r - e2.r;
        var g = e1.g - e2.g;
        var b = e1.b - e2.b;
        return 1 - Math.sqrt((((512 + mean) * r * r) >> 8) + 4 * g * g + (((767 - mean) * b * b) >> 8)) / 768;
    };
    Utils.formatXYRGB = function (xyrgb) {
        var keys = Object.keys(xyrgb);
        var formatObj = {};
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            var str = "".concat(xyrgb[k]);
            while (str.length < 3) {
                str = ' ' + str;
            }
            formatObj[k] = str;
        }
        var x = formatObj.x, y = formatObj.y, r = formatObj.r, g = formatObj.g, b = formatObj.b;
        return "{ x: ".concat(x, ", y: ").concat(y, ", r: ").concat(r, ", g: ").concat(g, ", b: ").concat(b, " }");
    };
    Utils.sortStringNumberMap = function (map) {
        var results = [];
        for (var key in map) {
            results.push({ key: key, count: map[key] });
        }
        results.sort(function (a, b) { return b.count - a.count; });
        return results;
    };
    Utils.sleep = function (during) {
        while (during > 200) {
            during -= 200;
            sleep(200);
        }
        if (during > 0) {
            sleep(during);
        }
    };
    Utils.getTaiwanTime = function () {
        return Date.now() + 8 * 60 * 60 * 1000;
    };
    Utils.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (typeof arg === 'object') {
                args[i] = JSON.stringify(arg);
            }
        }
        var date = new Date(Utils.getTaiwanTime());
        var dateString = "[".concat(date.getMonth() + 1, "-").concat(date.getDate(), "T").concat(date.getHours(), ":").concat(date.getMinutes(), ":").concat(date.getSeconds(), "]");
        console.log.apply(console, __spreadArray([dateString], args, false));
    };
    Utils.notifyEvent = function (event, content) {
        if (sendEvent != undefined) {
            Utils.log('sendEvent', event, content);
            sendEvent('' + event, '' + content);
        }
    };
    Utils.startApp = function (packageName) {
        execute("BOOTCLASSPATH=/system/framework/core.jar:/system/framework/conscrypt.jar:/system/framework/okhttp.jar:/system/framework/core-junit.jar:/system/framework/bouncycastle.jar:/system/framework/ext.jar:/system/framework/framework.jar:/system/framework/framework2.jar:/system/framework/telephony-common.jar:/system/framework/voip-common.jar:/system/framework/mms-common.jar:/system/framework/android.policy.jar:/system/framework/services.jar:/system/framework/apache-xml.jar:/system/framework/webviewchromium.jar am start -n ".concat(packageName));
        execute("ANDROID_DATA=/data BOOTCLASSPATH=/system/framework/core-oj.jar:/system/framework/core-libart.jar:/system/framework/conscrypt.jar:/system/framework/okhttp.jar:/system/framework/core-junit.jar:/system/framework/bouncycastle.jar:/system/framework/ext.jar:/system/framework/framework.jar:/system/framework/telephony-common.jar:/system/framework/voip-common.jar:/system/framework/ims-common.jar:/system/framework/mms-common.jar:/system/framework/android.policy.jar:/system/framework/apache-xml.jar:/system/framework/org.apache.http.legacy.boot.jar am start -n ".concat(packageName));
        execute("ANDROID_DATA=/data monkey --pct-syskeys 0 -p ".concat(packageName, " -c android.intent.category.LAUNCHER 1"));
        execute('ANDROID_BOOTLOGO=1 ' +
            'ANDROID_ROOT=/system ' +
            'ANDROID_ASSETS=/system/app ' +
            'ANDROID_DATA=/data ' +
            'ANDROID_STORAGE=/storage ' +
            'ANDROID_ART_ROOT=/apex/com.android.art ' +
            'ANDROID_I18N_ROOT=/apex/com.android.i18n ' +
            'ANDROID_TZDATA_ROOT=/apex/com.android.tzdata ' +
            'EXTERNAL_STORAGE=/sdcard ' +
            'ASEC_MOUNTPOINT=/mnt/asec ' +
            'BOOTCLASSPATH=/apex/com.android.art/javalib/core-oj.jar:/apex/com.android.art/javalib/core-libart.jar:/apex/com.android.art/javalib/core-icu4j.jar:/apex/com.android.art/javalib/okhttp.jar:/apex/com.android.art/javalib/bouncycastle.jar:/apex/com.android.art/javalib/apache-xml.jar:/system/framework/framework.jar:/system/framework/ext.jar:/system/framework/telephony-common.jar:/system/framework/voip-common.jar:/system/framework/ims-common.jar:/system/framework/framework-atb-backward-compatibility.jar:/apex/com.android.conscrypt/javalib/conscrypt.jar:/apex/com.android.media/javalib/updatable-media.jar:/apex/com.android.mediaprovider/javalib/framework-mediaprovider.jar:/apex/com.android.os.statsd/javalib/framework-statsd.jar:/apex/com.android.permission/javalib/framework-permission.jar:/apex/com.android.sdkext/javalib/framework-sdkextensions.jar:/apex/com.android.wifi/javalib/framework-wifi.jar:/apex/com.android.tethering/javalib/framework-tethering.jar ' +
            'DEX2OATBOOTCLASSPATH=/apex/com.android.art/javalib/core-oj.jar:/apex/com.android.art/javalib/core-libart.jar:/apex/com.android.art/javalib/core-icu4j.jar:/apex/com.android.art/javalib/okhttp.jar:/apex/com.android.art/javalib/bouncycastle.jar:/apex/com.android.art/javalib/apache-xml.jar:/system/framework/framework.jar:/system/framework/ext.jar:/system/framework/telephony-common.jar:/system/framework/voip-common.jar:/system/framework/ims-common.jar:/system/framework/framework-atb-backward-compatibility.jar ' +
            'SYSTEMSERVERCLASSPATH=/system/framework/com.android.location.provider.jar:/system/framework/services.jar:/system/framework/ethernet-service.jar:/apex/com.android.permission/javalib/service-permission.jar:/apex/com.android.ipsec/javalib/android.net.ipsec.ike.jar ' +
            "monkey --pct-syskeys 0 -p ".concat(packageName, " -c android.intent.category.LAUNCHER 1"));
    };
    Utils.stopApp = function (packageName) {
        execute("BOOTCLASSPATH=/system/framework/core.jar:/system/framework/conscrypt.jar:/system/framework/okhttp.jar:/system/framework/core-junit.jar:/system/framework/bouncycastle.jar:/system/framework/ext.jar:/system/framework/framework.jar:/system/framework/framework2.jar:/system/framework/telephony-common.jar:/system/framework/voip-common.jar:/system/framework/mms-common.jar:/system/framework/android.policy.jar:/system/framework/services.jar:/system/framework/apache-xml.jar:/system/framework/webviewchromium.jar am force-stop ".concat(packageName));
        execute("ANDROID_DATA=/data BOOTCLASSPATH=/system/framework/core-oj.jar:/system/framework/core-libart.jar:/system/framework/conscrypt.jar:/system/framework/okhttp.jar:/system/framework/core-junit.jar:/system/framework/bouncycastle.jar:/system/framework/ext.jar:/system/framework/framework.jar:/system/framework/telephony-common.jar:/system/framework/voip-common.jar:/system/framework/ims-common.jar:/system/framework/mms-common.jar:/system/framework/android.policy.jar:/system/framework/apache-xml.jar:/system/framework/org.apache.http.legacy.boot.jar am force-stop ".concat(packageName));
    };
    Utils.getCurrentApp = function () {
        var result = execute('dumpsys window windows').split('mCurrentFocus');
        if (result.length < 2) {
            return ['', ''];
        }
        result = result[1].split(' ');
        if (result.length < 3) {
            return ['', ''];
        }
        result[2] = result[2].replace('}', '');
        result = result[2].split('/');
        var packageName = '';
        var activityName = '';
        if (result.length == 1) {
            packageName = result[0].trim();
        }
        else if (result.length > 1) {
            packageName = result[0].trim();
            activityName = result[1].trim();
        }
        return [packageName, activityName];
    };
    Utils.isAppOnTop = function (packageName) {
        var topInfo = execute('dumpsys activity activities | grep mResumedActivity');
        return topInfo.indexOf(packageName) !== -1;
    };
    Utils.sendSlackMessage = function (url, title, message) {
        var body = {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*' + title + '*',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message,
                    },
                },
            ],
        };
        httpClient('POST', url, JSON.stringify(body), {
            'Content-Type': 'application/json',
        });
    };
    Utils.waitForAction = function (action, timeout, matchTimes, interval) {
        if (matchTimes === void 0) { matchTimes = 1; }
        if (interval === void 0) { interval = 600; }
        var now = Date.now();
        var matchs = 0;
        while (Date.now() - now < timeout) {
            if (action()) {
                matchs++;
            }
            if (matchs >= matchTimes) {
                break;
            }
            Utils.sleep(interval);
        }
        if (matchs >= matchTimes) {
            return true;
        }
        return false;
    };
    Utils.padZero = function (num) {
        return num < 10 ? "0".concat(num) : "".concat(num);
    };
    Utils.saveScreenshotToDisk = function (folderPath, saveReason) {
        var _this = this;
        saveReason = saveReason === undefined ? 'crash-img' : saveReason;
        var date = new Date(Utils.getTaiwanTime());
        var _a = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()].map(function (item) { return _this.padZero(item); }), YYYY = _a[0], MM = _a[1], dd = _a[2], hh = _a[3], mm = _a[4], ss = _a[5];
        var filename = "".concat(YYYY, "-").concat(MM, "-").concat(dd, "T").concat(hh, ".").concat(mm, ".").concat(ss, "_").concat(saveReason, ".png");
        var img = getScreenshot();
        saveImage(img, "".concat(folderPath, "/").concat(filename));
        Utils.log("Write to file: ".concat(folderPath, "/").concat(filename));
        releaseImage(img);
    };
    Utils.removeOldestFilesIfExceedsLimit = function (folderPath, maxFiles) {
        if (maxFiles === void 0) { maxFiles = 100; }
        var fileList = execute("ls -l ".concat(folderPath)).split('\n');
        // Some OS return first line total 8 (Mac, redroid), some not (Memu)
        if (fileList[0] && fileList[0].indexOf('total') === 0) {
            fileList.shift();
        }
        var filesWithDates = fileList.map(function (line) {
            var parts = line.trim().split(' ');
            var filename = parts[parts.length - 1]; // 2023-09-02T15.08.17_log.png
            var dateObj = new Date(parts[parts.length - 3].split('_')[0]);
            return {
                date: dateObj,
                filename: filename,
            };
        });
        filesWithDates.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        // If there are more than ${maxFiles} files, remove the oldest
        while (filesWithDates.length > maxFiles) {
            var oldestFile = filesWithDates.shift();
            if (oldestFile) {
                execute("rm ".concat(folderPath, "/").concat(oldestFile.filename));
                Utils.log("rm: ".concat(folderPath, "/").concat(oldestFile.filename));
            }
        }
    };
    Utils.joinPaths = function (path1, path2) {
        if (path2 === '') {
            return path1;
        }
        if (path1.charAt(path1.length - 1) === '/') {
            return path1 + path2;
        }
        else {
            return path1 + '/' + path2;
        }
    };
    Utils.savePointsMarkedImage = function (_a) {
        var image = _a.image, name = _a.name, points = _a.points, folderPath = _a.folderPath, rgba = _a.rgba;
        var filepath = "".concat(folderPath, "/").concat(name, ".png");
        // if file exists, skip
        var res = execute("test -e ".concat(filepath, " && echo 1"));
        if (res === '1') {
            return;
        }
        var clonedImg = clone(image);
        var _b = rgba || { r: 255, g: 0, b: 0, a: 255 }, r = _b.r, g = _b.g, b = _b.b, a = _b.a;
        var radius = 3;
        for (var i in points) {
            var _c = points[i], x = _c.x, y = _c.y;
            drawCircle(clonedImg, x, y, radius, r, g, b, a);
        }
        saveImage(clonedImg, filepath);
        releaseImage(clonedImg);
        console.log("[savePointsMarkedImage]: ".concat(name));
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/charenc/charenc.js":
/*!*****************************************!*\
  !*** ./node_modules/charenc/charenc.js ***!
  \*****************************************/
/***/ (function(module) {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ "./node_modules/crypt/crypt.js":
/*!*************************************!*\
  !*** ./node_modules/crypt/crypt.js ***!
  \*************************************/
/***/ (function(module) {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*\
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/***/ (function(module) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/md5/md5.js":
/*!*********************************!*\
  !*** ./node_modules/md5/md5.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

(function(){
  var crypt = __webpack_require__(/*! crypt */ "./node_modules/crypt/crypt.js"),
      utf8 = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").utf8),
      isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js"),
      bin = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").bin),

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


/***/ }),

/***/ "./config.ts":
/*!*******************!*\
  !*** ./config.ts ***!
  \*******************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isProduction = void 0;
exports.isProduction = true;


/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.leagueYearMin = exports.uploadSessionInterval = exports.sendWaitInputEventInterval = exports.sendRunningEventInterval = exports.switchWaitingLoginPagesInterval = exports.duringMaxAdRetry = exports.sleepForAd = exports.sleepWaitPageLong = exports.sleepLong = exports.sleepMedium = exports.sleepShort = exports.defaultMatchThres = exports.startAppDelay = exports.taskDelay = exports.taskConfigFindRouteDelay = exports.devWidth = exports.devHeight = exports.rotation = exports.saveImageRoot = exports.debugSlackUrl = exports.packageName = exports.dayInMs = exports.hourInMs = exports.minuteInMs = void 0;
// general constants
var secondInMs = 1000;
exports.minuteInMs = 60 * secondInMs;
exports.hourInMs = 60 * exports.minuteInMs;
exports.dayInMs = 24 * exports.hourInMs;
// rerouter settings
exports.packageName = 'com.com2us.ninepb3d.normal.freefull.google.global.android.common';
exports.debugSlackUrl = '';
try {
    if (typeof xDecodeHex !== 'undefined') {
        exports.debugSlackUrl =
            xDecodeHex('678bb3a8fefa40ad7c20b7d3a7991ed7cc1846429b18f8060c4e325517962220e3c68883bae5a77df61a00835626a11935d758fc7509ac4889388de4cff82b497fac923605f28cdccd928ea13cf9811792ea340e628c8e59d4292414e9346fdd') || '';
    }
}
catch (e) { }
exports.saveImageRoot = '/data/media/0/Downloads/';
exports.rotation = 'horizontal';
exports.devHeight = 360;
exports.devWidth = 640;
exports.taskConfigFindRouteDelay = 2 * secondInMs;
exports.taskDelay = 0.5 * secondInMs;
exports.startAppDelay = 10 * secondInMs;
exports.defaultMatchThres = 0.9;
// page related settings
exports.sleepShort = 1.5 * secondInMs;
exports.sleepMedium = 3 * secondInMs;
exports.sleepLong = 4 * secondInMs;
exports.sleepWaitPageLong = 24 * secondInMs;
exports.sleepForAd = 30 * secondInMs;
exports.duringMaxAdRetry = 3 * secondInMs;
// cloud state settings
exports.switchWaitingLoginPagesInterval = 30 * exports.minuteInMs;
exports.sendRunningEventInterval = 5 * exports.minuteInMs;
exports.sendWaitInputEventInterval = 5 * exports.minuteInMs;
exports.uploadSessionInterval = 1 * exports.hourInMs;
// user defined settings
exports.leagueYearMin = 2023;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MLB9I = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ./modules */ "./src/modules/index.ts");
var tasks_1 = __webpack_require__(/*! ./tasks */ "./src/tasks/index.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ./constants */ "./src/constants.ts"));
var VERSION = __importStar(__webpack_require__(/*! ./version */ "./src/version.ts"));
var VERSION_CODE = VERSION.PRODUCTION_VERSION_CODE;
var GIT_VERSION = VERSION.GIT_VERSION;
var MLB9I = /** @class */ (function () {
    function MLB9I(jsonConfig) {
        console.log('############ new MLB9I ############');
        console.log("script version ".concat(VERSION_CODE));
        console.log("git version ".concat(GIT_VERSION));
        modules_1.state.init(jsonConfig);
    }
    MLB9I.prototype.start = function () {
        if (modules_1.Config.config.isLocalPaid) {
            var plan = getUserPlan();
            if (plan != 'user_plan_mlb9i') {
                console.log('user plan id: ', JSON.stringify(plan));
                console.log('please subscribe premium plan');
                return;
            }
        }
        modules_1.state.resetBeforeAddRouteAndTask();
        this.addRoutesAndTasks();
        // const isMatch = rerouter.isPageMatchImage(onQuickPlay, getScreenshot());
        // console.log(isMatch);
        // isMatch &&
        //   Utils.savePointsMarkedImage({
        //     image: getScreenshot(),
        //     name: onQuickPlay.name,
        //     points: onQuickPlay.points,
        //     folderPath: '/data/media/0/Downloads/pageReference',
        //   });
        // adb pull /data/media/0/Downloads/pageReference/batterOfTheMonth.png ./src/batterOfTheMonth.png
        // console.log(rerouter.getCurrentMatchNames());
        // findUnchangedPoints({ x: 305, y: 296 }, { x: 359, y: 307 }, 5, CONSTANTS.sleepMedium, { r: 255, g: 255, b: 255 });
        // state.onRunning();
        // for (let i = 0; i < 5; i++) {
        //   state.onRunning();
        //   console.log('match');
        //   console.log(rerouter.getCurrentMatchNames());
        //   Utils.sleep(CONSTANTS.sleepShort);
        // }
        // console.log('end');
        modules_1.state.start();
    };
    MLB9I.prototype.stop = function () {
        modules_1.state.end();
    };
    MLB9I.prototype.addRoutesAndTasks = function () {
        this.addRoutes();
        this.handleUnknown();
        // rerouter.getCurrentMatchNames();
        if (modules_1.Config.config.isLocalPaid || modules_1.Config.config.isDev) {
            this.addPremiumTasks();
            return;
        }
        if (!modules_1.Config.config.isCloud) {
            this.addBasicTasks();
            return;
        }
        if (!modules_1.Config.config.licenseId) {
            console.log('no license id');
            tasks_1.stayInLogin.addTask();
            return;
        }
        this.addPremiumTasks();
    };
    MLB9I.prototype.addBasicTasks = function () {
        tasks_1.playLeagueGame.addTask();
    };
    MLB9I.prototype.addPremiumTasks = function () {
        tasks_1.setting.addTask();
        tasks_1.playLeagueGame.addTask();
        modules_1.Config.config.isRunPlayBattleGame && tasks_1.playBattleGame.addTask();
        modules_1.Config.config.isRunWeeklyMission && tasks_1.weeklyMission.addTask();
        modules_1.Config.config.isRunAdReward && tasks_1.adReward.addTask();
        modules_1.rerouter.addTask({
            name: tasks_1.TASKS.restartAppPerDay,
            // maxTaskRunTimes: 1,
            minRoundInterval: CONSTANTS.dayInMs,
            beforeRoute: function (task) {
                if (task.lastRunTime !== 0) {
                    console.log('restart app task');
                    modules_1.rerouter.restartApp();
                }
                return 'skipRouteLoop';
            },
            maxTaskDuring: 30 * CONSTANTS.minuteInMs,
            forceStop: true,
        });
    };
    MLB9I.prototype.addRoutes = function () {
        // ** login pages
        tasks_1.stayInLogin.addRoutes();
        // ** game setting
        tasks_1.setting.addRoutes();
        // ** ad reward
        tasks_1.adReward.addRoutes();
        // ** weekly mission
        tasks_1.weeklyMission.addRoutes();
        // ** playBattleGame
        tasks_1.playBattleGame.addRoutes();
        // ** playLeagueGame
        tasks_1.playLeagueGame.addRoutes();
        // ** common pages
        tasks_1.commons.addRoutes();
    };
    MLB9I.prototype.handleUnknown = function () {
        modules_1.rerouter.addUnknownAction(function (context, image, finishRound) {
            // rerouter.getCurrentMatchNames();
            var lastMatchedPath = context.lastMatchedPath.substring(1);
            Rerouter_1.Utils.log("unknown count ".concat(context.matchTimes, ", during ").concat(context.matchDuring, ", last matched: ").concat(lastMatchedPath));
            var isInApp = modules_1.rerouter.checkInApp();
            if (!isInApp) {
                console.log('not in app');
                if (modules_1.Config.config.hasCoolFeature) {
                    modules_1.rerouter.restartApp();
                }
                return;
            }
            if (modules_1.state.isWaitingLogin) {
                console.log('wait user input');
                return;
            }
            switch (context.task.name) {
                case tasks_1.TASKS.playBattleGame:
                case tasks_1.TASKS.playLeagueGame:
                    if (context.matchDuring < CONSTANTS.minuteInMs * 2) {
                        console.log('might be in playing animation');
                        modules_1.rerouter.screen.tap({ x: 0, y: 0 });
                        console.log('tap');
                        return;
                    }
                    break;
                default:
                    break;
            }
            modules_1.rerouter.screen.tap({ x: 0, y: 0 });
            console.log('tap');
            if (context.matchTimes % 11 === 0) {
                keycode('KEYCODE_BACK', 100);
                Rerouter_1.Utils.log('keycode back for unknown');
            }
            if (context.matchDuring > CONSTANTS.minuteInMs * 30) {
                console.log('stuck in unknown page more than 30 min');
                modules_1.Config.config.hasCoolFeature && modules_1.rerouter.restartApp();
            }
        });
    };
    MLB9I.prototype.handleCloseAd = function () {
        console.log('try close ad');
        keycode('BACK', 100);
        console.log('key code back');
        Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
        if (modules_1.rerouter.getCurrentMatchNames().length !== 0) {
            return;
        }
        // try tap close btn
        for (var _i = 0, _a = [
            // right
            { x: 622, y: 19 },
            // left
            { x: 8, y: 15 },
        ]; _i < _a.length; _i++) {
            var closeBtn = _a[_i];
            modules_1.rerouter.screen.tap(closeBtn);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
        }
    };
    MLB9I.prototype.handlePowerSavingPage = function () {
        console.log('handlePowerSavingPage');
        modules_1.rerouter.screen.tapDown({ x: 100, y: 180 });
        Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
        modules_1.rerouter.screen.moveTo({ x: 500, y: 180 });
        Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
        modules_1.rerouter.screen.tapUp({ x: 500, y: 180 });
        Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
    };
    MLB9I.prototype.wrapRouteAction = function (action) {
        if (!modules_1.Config.config.isCloud) {
            return action;
        }
        return function (context, image, matched, finishRound) {
            console.log('wrapRouteAction', context.task.name, matched[0].name);
            if (typeof action === 'function') {
                action(context, image, matched, finishRound);
            }
            if (action === 'goNext') {
                modules_1.rerouter.goNext(matched[0]);
            }
            if (action === 'goBack') {
                modules_1.rerouter.goBack(matched[0]);
            }
            // upload session if needed
            modules_1.state.checkUploadSession();
        };
    };
    MLB9I.packageName = 'com.com2us.ninepb3d.normal.freefull.google.global.android.common';
    return MLB9I;
}());
exports.MLB9I = MLB9I;


/***/ }),

/***/ "./src/modules/config.ts":
/*!*******************************!*\
  !*** ./src/modules/config.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.set = exports.config = void 0;
var constants_1 = __webpack_require__(/*! ../constants */ "./src/constants.ts");
var config_1 = __webpack_require__(/*! ../../config */ "./config.ts");
exports.config = {
    leagueSeasonMode: 'full',
    leagueYear: constants_1.leagueYearMin,
    isRunPlayBattleGame: true,
    isRunAdReward: false,
    isRunWeeklyMission: false,
    isProduction: config_1.isProduction,
};
function set(jsonConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (typeof jsonConfig !== 'string') {
        return;
    }
    var c = JSON.parse(jsonConfig);
    exports.config.leagueSeasonMode = (_a = c.leagueSeasonMode) !== null && _a !== void 0 ? _a : exports.config.leagueSeasonMode;
    exports.config.leagueYear = (_b = c.leagueYear) !== null && _b !== void 0 ? _b : exports.config.leagueYear;
    exports.config.xrobotmonS3Key = (_c = c.xrobotmonS3Key) !== null && _c !== void 0 ? _c : exports.config.xrobotmonS3Key;
    exports.config.xrobotmonS3Token = (_d = c.xrobotmonS3Token) !== null && _d !== void 0 ? _d : exports.config.xrobotmonS3Token;
    exports.config.amazonawsS3Key = (_e = c.amazonawsS3Key) !== null && _e !== void 0 ? _e : exports.config.amazonawsS3Key;
    exports.config.amazonawsS3Token = (_f = c.amazonawsS3Token) !== null && _f !== void 0 ? _f : exports.config.amazonawsS3Token;
    exports.config.licenseId = (_g = c.licenseId) !== null && _g !== void 0 ? _g : exports.config.licenseId;
    exports.config.deviceId = (_h = c.deviceId) !== null && _h !== void 0 ? _h : exports.config.deviceId;
    exports.config.isCloud = (_j = c.isCloud) !== null && _j !== void 0 ? _j : true;
    exports.config.isLocalPaid = (_k = c.isLocalPaid) !== null && _k !== void 0 ? _k : false;
    exports.config.isProduction;
    exports.config.isDev = (_l = c.isDev) !== null && _l !== void 0 ? _l : false;
    exports.config.hasCoolFeature = exports.config.isCloud || exports.config.isLocalPaid || c.isDev || false;
    exports.config.isRunWeeklyMission = exports.config.hasCoolFeature && ((_m = c.isRunWeeklyMission) !== null && _m !== void 0 ? _m : exports.config.isRunWeeklyMission);
    exports.config.isRunAdReward = exports.config.hasCoolFeature && ((_o = c.isRunAdReward) !== null && _o !== void 0 ? _o : exports.config.isRunAdReward);
    exports.config.isRunPlayBattleGame = exports.config.hasCoolFeature && ((_p = c.isRunPlayBattleGame) !== null && _p !== void 0 ? _p : exports.config.isRunPlayBattleGame);
}
exports.set = set;


/***/ }),

/***/ "./src/modules/eventSender.ts":
/*!************************************!*\
  !*** ./src/modules/eventSender.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.running = exports.playing = exports.launching = exports.loginSuccess = exports.loginInputing = exports.lastGameStatusEvent = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var lastRunningEvent = 0;
var lastSendGameStatusEventAt = 0;
var cnt = 0;
var EventName;
(function (EventName) {
    EventName["RUNNING"] = "running";
    EventName["GAME_STATUS"] = "gameStatus";
})(EventName || (EventName = {}));
var GameStatusContent;
(function (GameStatusContent) {
    GameStatusContent["WAIT_FOR_LOGIN_INPUT"] = "wait-for-input";
    GameStatusContent["LOGIN_SUCCEEDED"] = "login-succeeded";
    GameStatusContent["LAUNCHING"] = "launching";
    GameStatusContent["PLAYING"] = "playing";
})(GameStatusContent || (GameStatusContent = {}));
var prefix = '[Event]';
exports.lastGameStatusEvent = '';
function loginInputing() {
    cnt++;
    console.log("loginInputing: ".concat(cnt));
    var content = GameStatusContent.WAIT_FOR_LOGIN_INPUT;
    return handleSendGameStatusEvent(content);
}
exports.loginInputing = loginInputing;
function loginSuccess() {
    if (exports.lastGameStatusEvent !== GameStatusContent.WAIT_FOR_LOGIN_INPUT) {
        return false;
    }
    var content = GameStatusContent.LOGIN_SUCCEEDED;
    return handleSendGameStatusEvent(content);
}
exports.loginSuccess = loginSuccess;
function launching() {
    // set to default once app is launched (first and again)
    lastRunningEvent = 0;
    var content = GameStatusContent.LAUNCHING;
    return handleSendGameStatusEvent(content);
}
exports.launching = launching;
function playing() {
    var content = GameStatusContent.PLAYING;
    return handleSendGameStatusEvent(content);
}
exports.playing = playing;
function running(useInterval) {
    if (useInterval === void 0) { useInterval = false; }
    var now = Date.now();
    if (useInterval && now - lastRunningEvent < CONSTANTS.sendRunningEventInterval) {
        return;
    }
    lastRunningEvent = now;
    sendEvent(EventName.RUNNING, '');
    console.log("".concat(prefix, " running"));
}
exports.running = running;
function handleSendGameStatusEvent(content) {
    if (exports.lastGameStatusEvent === content) {
        return false;
    }
    // sleep for send 1+ events in a short time
    var diff = Date.now() - lastSendGameStatusEventAt;
    if (diff < CONSTANTS.sleepMedium) {
        Rerouter_1.Utils.sleep(diff);
    }
    exports.lastGameStatusEvent = content;
    sendEvent(EventName.GAME_STATUS, content);
    console.log("".concat(prefix, " ").concat(content));
    lastSendGameStatusEventAt = Date.now();
    return true;
}


/***/ }),

/***/ "./src/modules/index.ts":
/*!******************************!*\
  !*** ./src/modules/index.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.state = exports.Config = exports.rerouter = void 0;
var rerouter_1 = __webpack_require__(/*! ./rerouter */ "./src/modules/rerouter.ts");
Object.defineProperty(exports, "rerouter", ({ enumerable: true, get: function () { return rerouter_1.rerouter; } }));
exports.Config = __importStar(__webpack_require__(/*! ./config */ "./src/modules/config.ts"));
exports.state = __importStar(__webpack_require__(/*! ./state */ "./src/modules/state.ts"));


/***/ }),

/***/ "./src/modules/rerouter.ts":
/*!*********************************!*\
  !*** ./src/modules/rerouter.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rerouter = exports.resetRerouter = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
function resetRerouter() {
    Rerouter_1.rerouter.reset();
    Rerouter_1.rerouter.defaultConfig.TaskConfigAutoStop = true;
    Rerouter_1.rerouter.defaultConfig.RouteConfigDebug = false;
    Rerouter_1.rerouter.defaultConfig.TaskConfigFindRouteDelay = CONSTANTS.taskConfigFindRouteDelay;
    Rerouter_1.rerouter.defaultConfig.PageThres = CONSTANTS.defaultMatchThres;
    Rerouter_1.rerouter.defaultConfig.GroupPageThres = CONSTANTS.defaultMatchThres;
    // if not set packageName first, cannot handle start/ stop app
    Rerouter_1.rerouter.rerouterConfig.packageName = CONSTANTS.packageName;
    Rerouter_1.rerouter.rerouterConfig.debugSlackUrl = CONSTANTS.debugSlackUrl;
    Rerouter_1.rerouter.rerouterConfig.saveImageRoot = CONSTANTS.saveImageRoot;
    Rerouter_1.rerouter.rerouterConfig.startAppDelay = CONSTANTS.startAppDelay;
    Rerouter_1.rerouter.rerouterConfig.taskDelay = CONSTANTS.taskDelay;
    Rerouter_1.rerouter.screenConfig.rotation = CONSTANTS.rotation;
    Rerouter_1.rerouter.screenConfig.devHeight = CONSTANTS.devHeight;
    Rerouter_1.rerouter.screenConfig.devWidth = CONSTANTS.devWidth;
}
exports.resetRerouter = resetRerouter;
resetRerouter();
exports.rerouter = Rerouter_1.rerouter;


/***/ }),

/***/ "./src/modules/session.ts":
/*!********************************!*\
  !*** ./src/modules/session.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uploadSession = exports.endSession = exports.initSession = void 0;
var md5_1 = __importDefault(__webpack_require__(/*! md5 */ "./node_modules/md5/md5.js"));
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var rerouter_1 = __webpack_require__(/*! ./rerouter */ "./src/modules/rerouter.ts");
var config_1 = __webpack_require__(/*! ./config */ "./src/modules/config.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var IS_DEBUG = true;
// app origin info
var appSessionRoot = "data/data/".concat(CONSTANTS.packageName);
var appRecordRoot = "/sdcard/Android/data/".concat(CONSTANTS.packageName, "/files");
// cache info
var licenseFilePath = '/sdcard/Robotmon/license.txt';
var scriptCacheRoot = '/sdcard/Robotmon/loginCache';
var androidIdFilePath = "".concat(scriptCacheRoot, "/android_id.txt");
var gameRecordCacheRoot = "".concat(scriptCacheRoot, "/gameRecord");
// cloud info
var endpoint = 's3.robotmon.app:9000';
var bucket = 'mlb-record';
function initSession() {
    if (!config_1.config.isCloud) {
        return;
    }
    console.log("init session start");
    var licenseId = config_1.config.licenseId;
    licenseId = licenseId || '';
    var lastLicenseId = readFile(licenseFilePath) || '';
    console.log("lastLicenseId: ".concat(lastLicenseId, ", currentLicenseId: ").concat(licenseId));
    if (lastLicenseId === '' && licenseId === '') {
        console.log('initSession case 1');
        // case 1: clear session, set random android id, stop app
        logOut();
    }
    else if (lastLicenseId !== '' && licenseId === '') {
        console.log('initSession case 2');
        // case 2: clear session, set random android id, stop app
        logOut();
    }
    else if (lastLicenseId === '' && licenseId !== '') {
        console.log('initSession case 3');
        // case 3: check has session
        var hasCloudSession = fetchSession();
        if (hasCloudSession) {
            console.log('hasCloudSession doLogin');
            logIn();
            sleep(3000);
        }
    }
    else if (lastLicenseId !== '' && licenseId !== '' && lastLicenseId !== licenseId) {
        console.log('initSession case 4');
        // case 4: clear session, set random android id, stop app
        logOut();
        var hasCloudSession = fetchSession();
        if (hasCloudSession) {
            console.log('hasCloudSession doLogin');
            logIn();
            sleep(3000);
        }
    }
    else if (lastLicenseId !== '' && licenseId !== '' && lastLicenseId === licenseId) {
        console.log('initSession case 5');
        // case 5: check has session
        // TODO try to do nothing
        var hasCloudSession = fetchSession();
        if (hasCloudSession) {
            console.log('hasCloudSession doLogin');
            logIn();
            sleep(3000);
        }
    }
    else {
        console.log('Unknown case !!!');
    }
    // restart app if needed
    startApp();
    sleep(3000);
    // console.log(`init session done`);
}
exports.initSession = initSession;
function startApp() {
    var isInApp = rerouter_1.rerouter.checkInApp();
    while (!isInApp) {
        rerouter_1.rerouter.startApp();
        sleep(3000);
        isInApp = rerouter_1.rerouter.checkInApp();
    }
}
function stopApp() {
    var isInApp = rerouter_1.rerouter.checkInApp();
    while (isInApp) {
        rerouter_1.rerouter.stopApp();
        sleep(3000);
        isInApp = rerouter_1.rerouter.checkInApp();
    }
}
function endSession() {
    if (!config_1.config.isCloud) {
        return;
    }
    var licenseId = config_1.config.licenseId;
    licenseId = licenseId || '';
    if (licenseId) {
        logOut();
        sleep(3000);
        console.log('==== stop script: has licenseId; close app and clear session');
    }
    else {
        console.log('==== stop script: no licenseId; not to close app for let new user login');
    }
}
exports.endSession = endSession;
function uploadSession() {
    if (!config_1.config.isCloud) {
        return;
    }
    var xrobotmonS3Key = config_1.config.xrobotmonS3Key, xrobotmonS3Token = config_1.config.xrobotmonS3Token, licenseId = config_1.config.licenseId;
    licenseId = licenseId || '';
    if (!(xrobotmonS3Key && xrobotmonS3Token && licenseId)) {
        console.log('failed upload; required key is empty');
        return false;
    }
    console.log("upload session ".concat(licenseId, " start"));
    (0, utils_1.executeCommands)(
    // remove tmp file root
    "rm -rf ".concat(scriptCacheRoot), "rm -f ".concat(scriptCacheRoot, ".gz"), 
    // copy local session to tmp file root
    "mkdir -p ".concat(scriptCacheRoot, "/"), "cp -r ".concat(appSessionRoot, "/files ").concat(scriptCacheRoot, "/"), "cp -r ".concat(appSessionRoot, "/shared_prefs ").concat(scriptCacheRoot, "/"));
    copyGameRecordToCache();
    // copy current android id to tmp file root
    var androidId = execute('ANDROID_DATA=/data settings get secure android_id');
    console.log("upload androidId: ".concat(androidId));
    writeFile(androidIdFilePath, androidId);
    targz("".concat(scriptCacheRoot, ".gz"), "".concat(scriptCacheRoot));
    // upload session
    var now = Date.now();
    var sessionFileName = "loginCache/".concat(licenseId, ".gz");
    var sizeOrError = s3UploadFile("".concat(scriptCacheRoot, ".gz"), sessionFileName, 'application/octet-stream', endpoint, bucket, xrobotmonS3Key, xrobotmonS3Token, '', false);
    console.log("upload session to ".concat(endpoint, " finish. sizeOrError ").concat(sizeOrError, "; usedTime ").concat(Date.now() - now));
    // remove tmp file root
    (0, utils_1.executeCommands)("rm -rf ".concat(scriptCacheRoot), "rm -f ".concat(scriptCacheRoot, ".gz"));
}
exports.uploadSession = uploadSession;
function logOut() {
    console.log("script logout start");
    // stop app
    stopApp();
    console.log('app is stopped, clear session start');
    clearSession();
    writeFile(licenseFilePath, '');
    console.log('script logout done');
}
function logIn() {
    var licenseId = config_1.config.licenseId;
    licenseId = licenseId || '';
    console.log("script login start, startApp -> stopApp -> setSession");
    // start app, session or image data may be old
    startApp();
    sleep(10000);
    // stop app
    stopApp();
    console.log('app is stopped, set session start');
    setSession();
    writeFile(licenseFilePath, licenseId);
    console.log("script login done");
}
function fetchSession() {
    var xrobotmonS3Key = config_1.config.xrobotmonS3Key, xrobotmonS3Token = config_1.config.xrobotmonS3Token, licenseId = config_1.config.licenseId;
    licenseId = licenseId || '';
    if (!(xrobotmonS3Key && xrobotmonS3Token && licenseId)) {
        console.log('fetch failed: required key is empty');
        return false;
    }
    console.log("fetchSession start ".concat(licenseId));
    var now = Date.now();
    (0, utils_1.executeCommands)(
    // remove old files
    "rm -rf ".concat(scriptCacheRoot), "rm -f ".concat(scriptCacheRoot, ".gz"), 
    // create tmp file root
    "mkdir -p ".concat(scriptCacheRoot));
    var sessionFileName = "loginCache/".concat(licenseId, ".gz");
    var resultOrError = s3DownloadFile("".concat(scriptCacheRoot, ".gz"), sessionFileName, endpoint, bucket, xrobotmonS3Key, xrobotmonS3Token, '', false);
    if (resultOrError !== true) {
        console.log("fetchSession failed ".concat(resultOrError));
        return false;
    }
    console.log("Download session from ".concat(endpoint, " finish. usedTime"), Date.now() - now, licenseId, resultOrError);
    return true;
}
function setSession() {
    // clear app session to avoid cannot overwrite
    var gameRecordFileName = getGameRecordFileName() || 'NOT_EXIST_RECORD';
    console.log("rm app session files");
    (0, utils_1.executeCommands)(
    //
    "rm -rf ".concat(appSessionRoot, "/files"), "rm -rf ".concat(appSessionRoot, "/shared_prefs"), "rm -rf ".concat(appRecordRoot, "/").concat(gameRecordFileName));
    // untargz cloud session and overwrite app session
    console.log("set session start");
    untargz("".concat(scriptCacheRoot, ".gz"));
    (0, utils_1.executeCommands)("cp -r ".concat(scriptCacheRoot, "/files ").concat(appSessionRoot, "/"), "cp -r ".concat(scriptCacheRoot, "/shared_prefs ").concat(appSessionRoot, "/"), "cp -r ".concat(scriptCacheRoot, "/gameRecord/* ").concat(appRecordRoot, "/"), "chmod -R 777 ".concat(appSessionRoot, "/files"), "chmod -R 777 ".concat(appSessionRoot, "/shared_prefs"), "chmod -R 777 ".concat(appRecordRoot));
    console.log("copy cache session to app session done");
    setAndroidId('cloud');
    sleep(2000);
    console.log('set session done');
}
function clearSession() {
    console.log("clear session start");
    setAndroidId('random');
    var gameRecordFileName = getGameRecordFileName() || 'NOT_EXIST_RECORD';
    console.log("rm app session files & cache session files");
    (0, utils_1.executeCommands)("rm -rf ".concat(scriptCacheRoot, ".gz"), "rm -rf ".concat(scriptCacheRoot), "rm -rf ".concat(appSessionRoot, "/files"), "rm -rf ".concat(appSessionRoot, "/shared_prefs"), "rm -rf ".concat(appRecordRoot, "/").concat(gameRecordFileName));
    sleep(2000);
    console.log('clear session done');
}
function setAndroidId(source) {
    var oriAndroidId = (0, utils_1.executeCommands)('ANDROID_DATA=/data settings get secure android_id')[0];
    var androidId = (0, md5_1.default)("".concat(Date.now()).concat(oriAndroidId)).substring(0, 16);
    if (source === 'cloud') {
        androidId = readFile(androidIdFilePath) || androidId;
    }
    (0, utils_1.executeCommands)('ANDROID_DATA=/data settings put secure android_id ' + androidId);
    console.log("set androidId; ".concat(oriAndroidId, " set to-> ").concat(androidId));
}
function copyGameRecordToCache() {
    var fileName = getGameRecordFileName();
    if (!fileName) {
        console.log('cannot copy game record file bc no found');
        return;
    }
    (0, utils_1.executeCommands)("mkdir -p ".concat(gameRecordCacheRoot), "cp -r ".concat(appRecordRoot, "/").concat(fileName, " ").concat(gameRecordCacheRoot, "/").concat(fileName, "/"));
    console.log("copy game record file done: ".concat(gameRecordCacheRoot, "/").concat(fileName));
}
function getGameRecordFileName() {
    var files = (0, utils_1.executeCommands)("ls ".concat(appRecordRoot))[0].split('\n');
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var fileName = files_1[_i];
        if (fileName.length === 32) {
            fileName = fileName.trim();
            console.log("game record file founded: ".concat(fileName));
            return fileName;
        }
    }
    return '';
}
function compareFilesForLog(filesAfter, filesBefore) {
    if (!IS_DEBUG) {
        return;
    }
    var countMap = {};
    for (var _i = 0, filesAfter_1 = filesAfter; _i < filesAfter_1.length; _i++) {
        var file = filesAfter_1[_i];
        var count = countMap[file] || 0;
        countMap[file] = count + 1;
    }
    for (var _a = 0, filesBefore_1 = filesBefore; _a < filesBefore_1.length; _a++) {
        var file = filesBefore_1[_a];
        var count = countMap[file] || 0;
        countMap[file] = count - 1;
    }
    var commonFiles = [];
    var beforeNotHasFiles = [];
    var afterNotHasFiles = [];
    for (var _b = 0, _c = Object.keys(countMap); _b < _c.length; _b++) {
        var f = _c[_b];
        var count = countMap[f];
        switch (count) {
            case 0:
                commonFiles.push(f);
                break;
            case 1:
                beforeNotHasFiles.push(f);
                break;
            case -1:
                afterNotHasFiles.push(f);
                break;
            default:
                console.log('error count', count);
                break;
        }
    }
    console.log("commonFiles:\n".concat(commonFiles.join('\n')));
    console.log("beforeNotHasFiles:\n".concat(beforeNotHasFiles.join('\n')));
    console.log("afterNotHasFiles:\n".concat(afterNotHasFiles.join('\n')));
}


/***/ }),

/***/ "./src/modules/slackSender.ts":
/*!************************************!*\
  !*** ./src/modules/slackSender.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sendError = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var VERSION = __importStar(__webpack_require__(/*! ../version */ "./src/version.ts"));
var Config = __importStar(__webpack_require__(/*! ./config */ "./src/modules/config.ts"));
var sendSlackMessage = function (title, message) { return Rerouter_1.Utils.sendSlackMessage(CONSTANTS.debugSlackUrl, title, message); };
function sendError(message) {
    var userInfo = "\n    deviceId: ".concat(Config.config.deviceId, "\n\n    license: ").concat(Config.config.licenseId || 'DEBUG', "\n\n  ");
    sendSlackMessage("[ERROR MLB ".concat(VERSION.GIT_VERSION, "]"), userInfo + message);
}
exports.sendError = sendError;


/***/ }),

/***/ "./src/modules/state.ts":
/*!******************************!*\
  !*** ./src/modules/state.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkUploadSession = exports.onUnexpectedNetworkError = exports.onLaunching = exports.onLoginSuccess = exports.onLoginPage = exports.onRunning = exports.end = exports.start = exports.resetBeforeAddRouteAndTask = exports.init = exports.isWaitingLogin = exports.leagueGame = void 0;
var rerouter_1 = __webpack_require__(/*! ./rerouter */ "./src/modules/rerouter.ts");
var EventSender = __importStar(__webpack_require__(/*! ./eventSender */ "./src/modules/eventSender.ts"));
var slackSender = __importStar(__webpack_require__(/*! ./slackSender */ "./src/modules/slackSender.ts"));
var Session = __importStar(__webpack_require__(/*! ./session */ "./src/modules/session.ts"));
var Config = __importStar(__webpack_require__(/*! ./config */ "./src/modules/config.ts"));
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
exports.leagueGame = {
    tryEnterGameCnts: 0,
    needResetProgress: false,
    lastCheckPowerSaveAt: 0,
    powerSaveColorCount: {},
};
exports.isWaitingLogin = false;
var lastUploadSessionAt = 0;
var hasSession = false;
var unexpectedNetworkErrorTimestamps = [];
function init(jsonConfig) {
    Config.set(jsonConfig);
    if (Config.config.isCloud) {
        Session.initSession();
        (0, utils_1.executeCommands)('pm disable-user com.android.inputmethod.latin');
    }
}
exports.init = init;
function resetBeforeAddRouteAndTask() {
    var _a;
    (0, rerouter_1.resetRerouter)();
    rerouter_1.rerouter.debug = false; // Config.config.isCloud || Config.config.isDev || false;
    rerouter_1.rerouter.rerouterConfig.strictMode = !((_a = Config.config.isProduction) !== null && _a !== void 0 ? _a : false);
    rerouter_1.rerouter.rerouterConfig.autoLaunchApp = Config.config.hasCoolFeature || false;
    rerouter_1.rerouter.rerouterConfig.deviceId = Config.config.deviceId || '';
    exports.leagueGame.tryEnterGameCnts = 0;
    exports.leagueGame.needResetProgress = false;
    exports.leagueGame.lastCheckPowerSaveAt = 0;
    exports.leagueGame.powerSaveColorCount = {};
    exports.isWaitingLogin = false;
    lastUploadSessionAt = 0;
    hasSession = false;
}
exports.resetBeforeAddRouteAndTask = resetBeforeAddRouteAndTask;
function start() {
    if (Config.config.isDev) {
        console.log("init config: ".concat(JSON.stringify(Config.config)));
    }
    rerouter_1.rerouter.start(CONSTANTS.packageName);
}
exports.start = start;
function end() {
    if (Config.config.isCloud) {
        Session.endSession();
    }
    rerouter_1.rerouter.stop();
}
exports.end = end;
function onRunning(useInterval) {
    if (useInterval === void 0) { useInterval = false; }
    (Config.config.isCloud || Config.config.isDev) && EventSender.running(useInterval);
}
exports.onRunning = onRunning;
function onLoginPage(needUserInput) {
    if (needUserInput === void 0) { needUserInput = false; }
    hasSession = false;
    exports.isWaitingLogin = true;
    if (!(Config.config.isCloud || Config.config.isDev)) {
        return;
    }
    // use interval in running
    EventSender.running(true);
    if (needUserInput) {
        EventSender.loginInputing();
    }
}
exports.onLoginPage = onLoginPage;
function onLoginSuccess() {
    hasSession = true;
    exports.isWaitingLogin = false;
    if (!(Config.config.isCloud || Config.config.isDev)) {
        return;
    }
    EventSender.loginSuccess();
    EventSender.playing();
}
exports.onLoginSuccess = onLoginSuccess;
function onLaunching() {
    hasSession = false;
    exports.isWaitingLogin = false;
    lastUploadSessionAt = 0;
    exports.leagueGame.tryEnterGameCnts = exports.leagueGame.tryEnterGameCnts;
    exports.leagueGame.needResetProgress = false;
    exports.leagueGame.lastCheckPowerSaveAt = 0;
    exports.leagueGame.powerSaveColorCount = {};
    (Config.config.isCloud || Config.config.isDev) && EventSender.launching();
}
exports.onLaunching = onLaunching;
function onUnexpectedNetworkError() {
    var now = Date.now();
    // rm all old timestamp if last one happened 2 hours before
    var before2Hr = now - CONSTANTS.hourInMs * 2;
    var cnt = unexpectedNetworkErrorTimestamps.length;
    if (cnt > 0 && unexpectedNetworkErrorTimestamps[cnt - 1] < before2Hr) {
        unexpectedNetworkErrorTimestamps = [];
        cnt = 0;
    }
    // add new timestamp
    unexpectedNetworkErrorTimestamps.push(now);
    cnt++;
    // log
    var msg = "unstable network error happened, cnt ".concat(cnt);
    console.log(msg);
    // restart app if it happened 3x times accumulatively
    if (cnt % 3) {
        return;
    }
    console.log('send error to slack & restart app');
    slackSender.sendError(msg);
    rerouter_1.rerouter.restartApp();
}
exports.onUnexpectedNetworkError = onUnexpectedNetworkError;
function checkUploadSession() {
    // only upload session when is playing
    if (!Config.config.isCloud || !hasSession) {
        return;
    }
    var now = Date.now();
    if (now - lastUploadSessionAt < CONSTANTS.uploadSessionInterval) {
        return;
    }
    lastUploadSessionAt = now;
    console.log('upload session');
    Session.uploadSession();
}
exports.checkUploadSession = checkUploadSession;


/***/ }),

/***/ "./src/tasks/adReward.ts":
/*!*******************************!*\
  !*** ./src/tasks/adReward.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = exports.addTask = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
function addTask() {
    console.log('addTask adReward');
    // only run once
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.adReward,
        // maxTaskRunTimes: 1,
        minRoundInterval: CONSTANTS.minuteInMs * 30,
        findRouteDelay: CONSTANTS.sleepMedium,
        maxTaskDuring: CONSTANTS.sleepForAd + CONSTANTS.duringMaxAdRetry,
        forceStop: true,
    });
}
exports.addTask = addTask;
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(adReward.name),
        match: adReward,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.adReward) {
                modules_1.rerouter.goBack(adReward);
                return;
            }
            modules_1.rerouter.goNext(adReward);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            var screenshot = getScreenshot();
            var isEnterAd = !modules_1.rerouter.isPageMatchImage(adReward, screenshot);
            releaseImage(screenshot);
            if (!isEnterAd) {
                console.log('error: cannot play ad, try later');
                finishRound(true);
                return;
            }
            console.log('watch ad');
            Rerouter_1.Utils.sleep(CONSTANTS.sleepForAd - CONSTANTS.sleepMedium);
            // handle ad close
            console.log('try close ad');
            var isAdClosed = false;
            // try key code back 5 times
            for (var i = 0; i < 5 && !isAdClosed; i++) {
                keycode('BACK', 100);
                console.log("key code back to close ad ".concat(i + 1));
                Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
                var screenshot_1 = getScreenshot();
                isAdClosed = modules_1.rerouter.isPageMatchImage(adRewardRedeem, screenshot_1);
                releaseImage(screenshot_1);
            }
            if (isAdClosed) {
                console.log('ad closed');
                modules_1.state.onRunning();
                return;
            }
            // restart app if ad not closed
            console.log('ad not closed, restart app');
            modules_1.rerouter.stopApp();
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            modules_1.rerouter.startApp();
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(adRewardRedeem.name),
        match: adRewardRedeem,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('ad reward get');
            modules_1.rerouter.goNext(adRewardRedeem);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            if (context.task.name === taskNames_1.TASKS.adReward) {
                finishRound(true);
                modules_1.state.onRunning();
            }
        },
    });
}
exports.addRoutes = addRoutes;
// adReward pages
var adReward = new Rerouter_1.Page('adReward', [
    // bg
    { x: 28, y: 45, r: 222, g: 219, b: 222 },
    { x: 36, y: 267, r: 181, g: 186, b: 197 },
    { x: 32, y: 307, r: 238, g: 243, b: 238 },
    { x: 605, y: 52, r: 222, g: 219, b: 222 },
    { x: 611, y: 244, r: 181, g: 186, b: 197 },
    { x: 607, y: 319, r: 238, g: 243, b: 238 },
    // watch ad icon & btn bg
    { x: 344, y: 300, r: 49, g: 162, b: 90 },
    { x: 490, y: 318, r: 41, g: 142, b: 82 },
    { x: 361, y: 308, r: 0, g: 147, b: 141 },
    { x: 375, y: 316, r: 0, g: 110, b: 107 },
    // cancel
    { x: 190, y: 310, r: 8, g: 109, b: 247 },
    { x: 204, y: 310, r: 8, g: 109, b: 247 },
    { x: 219, y: 310, r: 242, g: 246, b: 253 },
    { x: 232, y: 310, r: 8, g: 109, b: 247 },
    { x: 247, y: 310, r: 8, g: 109, b: 247 },
    { x: 258, y: 310, r: 8, g: 109, b: 247 },
], { x: 404, y: 310 }, { x: 224, y: 310 });
var adRewardRedeem = new Rerouter_1.Page('adRewardRedeem', [
    // ad reward title
    { x: 274, y: 51, r: 222, g: 219, b: 222 },
    { x: 302, y: 49, r: 16, g: 24, b: 33 },
    { x: 334, y: 51, r: 16, g: 24, b: 33 },
    { x: 356, y: 52, r: 90, g: 94, b: 102 },
    // bg
    { x: 25, y: 46, r: 222, g: 219, b: 222 },
    { x: 36, y: 307, r: 238, g: 243, b: 238 },
    { x: 601, y: 42, r: 123, g: 118, b: 123 },
    { x: 591, y: 318, r: 238, g: 243, b: 238 },
    { x: 21, y: 273, r: 181, g: 186, b: 197 },
    { x: 18, y: 81, r: 181, g: 186, b: 197 },
    { x: 616, y: 85, r: 181, g: 186, b: 197 },
    { x: 608, y: 269, r: 181, g: 186, b: 197 },
    // ok
    { x: 301, y: 310, r: 8, g: 109, b: 247 },
    { x: 319, y: 307, r: 19, g: 117, b: 244 },
    { x: 349, y: 307, r: 8, g: 113, b: 255 },
], { x: 303, y: 304 }, { x: 303, y: 304 });


/***/ }),

/***/ "./src/tasks/commons/confirms.ts":
/*!***************************************!*\
  !*** ./src/tasks/commons/confirms.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.downloadData2 = exports.downloadData = exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../../constants */ "./src/constants.ts"));
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(confirmWithYSGroup.name),
        match: confirmWithYSGroup,
        action: function (context, image, matched, finishRound) {
            for (var _i = 0, _a = [exports.downloadData, exports.downloadData2, quitApp, quitApp1]; _i < _a.length; _i++) {
                var p = _a[_i];
                if (modules_1.rerouter.isPageMatchImage(p, image)) {
                    modules_1.rerouter.goNext(p);
                    if (p.name === exports.downloadData.name || p.name === exports.downloadData2.name) {
                        console.log('download data & wait');
                        Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
                    }
                    return;
                }
            }
            modules_1.rerouter.goNext(confirmWithYS);
        },
    });
    [okGroup].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
        });
    });
}
exports.addRoutes = addRoutes;
// page has ok button
var ok = new Rerouter_1.Page('ok', [
    { x: 279, y: 300, r: 0, g: 113, b: 247 },
    { x: 310, y: 301, r: 136, g: 188, b: 254 },
    { x: 326, y: 301, r: 255, g: 255, b: 255 },
    { x: 362, y: 300, r: 0, g: 113, b: 247 },
    { x: 369, y: 312, r: 8, g: 101, b: 255 },
], { x: 319, y: 303 }, { x: 319, y: 303 });
var ok2 = new Rerouter_1.Page('ok2', [
    // btn
    { x: 267, y: 301, r: 8, g: 113, b: 247 },
    { x: 318, y: 302, r: 206, g: 221, b: 243 },
    { x: 328, y: 305, r: 8, g: 102, b: 240 },
    { x: 375, y: 301, r: 8, g: 113, b: 247 },
    { x: 380, y: 313, r: 1, g: 89, b: 238 },
    // bg
    { x: 122, y: 304, r: 238, g: 243, b: 238 },
    { x: 520, y: 308, r: 238, g: 243, b: 238 },
    { x: 110, y: 42, r: 197, g: 198, b: 206 },
    { x: 534, y: 38, r: 197, g: 198, b: 206 },
    // x
    { x: 523, y: 53, r: 75, g: 78, b: 83 },
], { x: 319, y: 300 }, { x: 319, y: 300 });
var okGroup = new Rerouter_1.GroupPage('ok', [ok, ok2], ok.next, ok.next);
// non-specific confirm page with no and yes btn
var confirmWithYS = new Rerouter_1.Page('confirmWithYS', [
    // x on right top
    { x: 513, y: 46, r: 182, g: 186, b: 188 },
    { x: 520, y: 52, r: 70, g: 69, b: 70 },
    { x: 527, y: 45, r: 67, g: 68, b: 70 },
    { x: 531, y: 54, r: 174, g: 175, b: 176 },
    { x: 511, y: 51, r: 178, g: 180, b: 186 },
    // no btn
    { x: 212, y: 301, r: 49, g: 85, b: 123 },
    { x: 249, y: 300, r: 125, g: 152, b: 188 },
    { x: 278, y: 307, r: 49, g: 81, b: 123 },
    // yes btn
    { x: 363, y: 294, r: 8, g: 122, b: 255 },
    { x: 384, y: 297, r: 244, g: 248, b: 255 },
    { x: 419, y: 307, r: 0, g: 101, b: 247 },
    { x: 395, y: 294, r: 8, g: 122, b: 255 },
    // footer bg
    { x: 142, y: 304, r: 222, g: 219, b: 222 },
    { x: 530, y: 296, r: 222, g: 219, b: 222 },
], { x: 520, y: 56 }, // x btn
{ x: 520, y: 56 });
exports.downloadData = new Rerouter_1.Page('downloadData', [
    // title
    { x: 166, y: 58, r: 140, g: 146, b: 150 },
    { x: 183, y: 59, r: 16, g: 24, b: 33 },
    { x: 206, y: 61, r: 55, g: 63, b: 66 },
    { x: 244, y: 58, r: 87, g: 90, b: 96 },
    { x: 282, y: 58, r: 16, g: 24, b: 33 },
    { x: 336, y: 63, r: 16, g: 24, b: 33 },
    { x: 368, y: 63, r: 176, g: 179, b: 184 },
    { x: 404, y: 63, r: 132, g: 137, b: 140 },
    { x: 432, y: 63, r: 133, g: 138, b: 141 },
    { x: 459, y: 61, r: 49, g: 56, b: 64 },
    // content
    { x: 186, y: 156, r: 109, g: 156, b: 205 },
    { x: 207, y: 157, r: 17, g: 120, b: 226 },
    { x: 224, y: 160, r: 120, g: 160, b: 201 },
    { x: 412, y: 159, r: 74, g: 142, b: 214 },
    { x: 438, y: 159, r: 0, g: 113, b: 230 },
    { x: 450, y: 159, r: 81, g: 147, b: 213 },
    // no
    { x: 224, y: 297, r: 49, g: 85, b: 123 },
    { x: 255, y: 298, r: 180, g: 201, b: 229 },
    // yes
    { x: 387, y: 298, r: 253, g: 254, b: 255 },
    { x: 429, y: 302, r: 8, g: 110, b: 247 },
    { x: 478, y: 304, r: 214, g: 219, b: 222 },
], { x: 421, y: 293 }, { x: 421, y: 293 });
exports.downloadData2 = new Rerouter_1.Page('downloadData2', [
    // title, check for additional data download
    { x: 195, y: 61, r: 136, g: 140, b: 144 },
    { x: 271, y: 62, r: 16, g: 24, b: 33 },
    { x: 335, y: 62, r: 60, g: 65, b: 72 },
    { x: 417, y: 61, r: 66, g: 74, b: 80 },
    // content we recommend you using a Wi-Fi connection
    { x: 187, y: 157, r: 40, g: 128, b: 221 },
    { x: 213, y: 161, r: 82, g: 147, b: 209 },
    { x: 231, y: 165, r: 113, g: 160, b: 201 },
    { x: 254, y: 164, r: 112, g: 159, b: 202 },
    { x: 269, y: 163, r: 57, g: 137, b: 216 },
    { x: 295, y: 162, r: 0, g: 113, b: 230 },
    { x: 320, y: 163, r: 25, g: 123, b: 222 },
    { x: 392, y: 162, r: 103, g: 154, b: 207 },
    { x: 434, y: 165, r: 92, g: 150, b: 207 },
], { x: 387, y: 305 }, { x: 387, y: 305 });
// with more games button
var quitApp = new Rerouter_1.Page('quitApp', [
    { x: 279, y: 54, r: 170, g: 173, b: 178 },
    { x: 324, y: 60, r: 20, g: 27, b: 28 },
    { x: 514, y: 50, r: 181, g: 182, b: 182 },
    { x: 466, y: 295, r: 8, g: 121, b: 255 },
    { x: 414, y: 298, r: 94, g: 157, b: 233 },
    { x: 496, y: 312, r: 0, g: 90, b: 247 },
    { x: 523, y: 309, r: 222, g: 219, b: 222 },
    { x: 111, y: 297, r: 222, g: 219, b: 222 },
    { x: 307, y: 60, r: 133, g: 137, b: 141 },
    { x: 315, y: 61, r: 181, g: 186, b: 189 },
    { x: 324, y: 61, r: 52, g: 56, b: 61 },
], { x: 300, y: 303 }, // not to quit
{ x: 300, y: 303 });
var quitApp1 = new Rerouter_1.Page('quitApp1', [
    { x: 262, y: 56, r: 181, g: 186, b: 189 },
    { x: 300, y: 54, r: 16, g: 24, b: 24 },
    { x: 323, y: 55, r: 24, g: 30, b: 32 },
    { x: 511, y: 50, r: 178, g: 180, b: 186 },
    { x: 522, y: 54, r: 141, g: 139, b: 141 },
    { x: 522, y: 54, r: 141, g: 139, b: 141 },
    { x: 167, y: 299, r: 222, g: 219, b: 222 },
    { x: 243, y: 295, r: 49, g: 85, b: 123 },
    { x: 318, y: 298, r: 222, g: 219, b: 222 },
    { x: 382, y: 297, r: 83, g: 158, b: 255 },
    { x: 503, y: 301, r: 222, g: 219, b: 222 },
    { x: 433, y: 310, r: 0, g: 94, b: 247 },
    { x: 404, y: 301, r: 8, g: 113, b: 255 },
    { x: 213, y: 307, r: 49, g: 81, b: 123 },
], { x: 213, y: 307 }, // not to quit
{ x: 213, y: 307 });
var confirmWithYSGroup = new Rerouter_1.GroupPage('confirmWithYSGroup', [confirmWithYS, exports.downloadData, exports.downloadData2, quitApp, quitApp1], confirmWithYS.next, confirmWithYS.back);


/***/ }),

/***/ "./src/tasks/commons/enterApp.ts":
/*!***************************************!*\
  !*** ./src/tasks/commons/enterApp.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ../taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../../utils */ "./src/utils.ts");
function addRoutes() {
    // ** launching pages
    modules_1.rerouter.addRoute({
        path: "/".concat(logo.name),
        match: logo,
        action: function (context) {
            console.log('wait app loading ...');
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            if (!modules_1.Config.config.hasCoolFeature) {
                return;
            }
            modules_1.state.onLaunching();
            // reopen if stuck
            var now = Date.now();
            if (now - context.matchStartTS > 3 * CONSTANTS.minuteInMs) {
                console.log('stuck in launch page too long, restart app');
                modules_1.rerouter.restartApp();
                Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
                return;
            }
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(landingLoading.name),
        match: landingLoading,
        action: function () {
            console.log('landing loading...');
            modules_1.state.onLaunching();
        },
        afterActionDelay: CONSTANTS.sleepMedium,
    });
    [TOS, TOS90, TOS90v2].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
        });
    });
    // ** main
    modules_1.rerouter.addRoute({
        path: "/".concat(main.name),
        match: main,
        action: function (context, image, matched, finishRound) {
            var task = context.task.name;
            console.log(task);
            // every time in main need to check if chat is on
            var isChatOn = (0, utils_1.isSameColor)(image, { x: 596, y: 30, r: 246, g: 242, b: 246 });
            if (isChatOn) {
                handleTurnOffChat(image);
            }
            switch (task) {
                case taskNames_1.TASKS.stayInLogin:
                    // should be inaccessible unless clear session is failed
                    return;
                case taskNames_1.TASKS.settingDefault:
                case taskNames_1.TASKS.settingResetLeagueProgress:
                    modules_1.rerouter.screen.tap(mainBtns.settings);
                    break;
                case taskNames_1.TASKS.playLeagueGame:
                    modules_1.rerouter.screen.tap(mainBtns.leagueMode);
                    modules_1.state.leagueGame.tryEnterGameCnts++;
                    break;
                case taskNames_1.TASKS.playBattleGame:
                    modules_1.rerouter.screen.tap(mainBtns.battleMode);
                    break;
                case taskNames_1.TASKS.adReward:
                    // sometimes won't trigger anything if still on cd
                    if (context.matchTimes > 2) {
                        console.log('ad is still on cd');
                        finishRound(true);
                    }
                    else {
                        modules_1.rerouter.screen.tap(mainBtns.adTab);
                    }
                    break;
                case taskNames_1.TASKS.weeklyMission:
                    modules_1.rerouter.screen.tap(mainBtns.achievement);
                    break;
                default:
                    break;
            }
            modules_1.state.onLoginSuccess();
        },
    });
}
exports.addRoutes = addRoutes;
function handleTurnOffChat(image) {
    var chatOnBtn = { x: 595, y: 30, r: 245, g: 242, b: 245 };
    var isChatOn = (0, utils_1.isSameColor)(image, chatOnBtn);
    if (!isChatOn) {
        console.log('chat is off');
        return;
    }
    console.log('turn off chat, open dialog');
    modules_1.rerouter.screen.tap(chatOnBtn);
    Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
    // in dialog
    var isEnableChat = true;
    for (var remainClick = 10; remainClick > 0 && isEnableChat; remainClick--) {
        modules_1.rerouter.goNext(chatDialogChatOnBtn);
        Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
        var screenshot = getScreenshot();
        isEnableChat = modules_1.rerouter.isPageMatchImage(chatDialogChatOnBtn, screenshot);
        releaseImage(screenshot);
    }
    if (!isEnableChat) {
        console.log('turn off chat ok');
        modules_1.rerouter.goBack(chatDialogChatOnBtn);
        Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
        modules_1.state.onRunning();
        return;
    }
}
var logo = new Rerouter_1.Page('logo', [
    { x: 227, y: 184, r: 228, g: 4, b: 33 },
    { x: 258, y: 187, r: 228, g: 4, b: 33 },
    { x: 278, y: 190, r: 232, g: 48, b: 72 },
    { x: 285, y: 183, r: 254, g: 254, b: 254 },
    { x: 301, y: 172, r: 229, g: 19, b: 46 },
    { x: 316, y: 187, r: 254, g: 254, b: 254 },
    { x: 335, y: 188, r: 228, g: 4, b: 33 },
    { x: 372, y: 188, r: 252, g: 233, b: 235 },
    { x: 375, y: 169, r: 228, g: 4, b: 33 },
    { x: 395, y: 184, r: 254, g: 254, b: 254 },
    { x: 398, y: 170, r: 228, g: 4, b: 33 },
    { x: 403, y: 186, r: 254, g: 254, b: 254 },
    { x: 117, y: 114, r: 254, g: 254, b: 254 },
    // loading on left top if stuck
    // { x: 2, y: 5, r: 142, g: 208, b: 202 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
// term of service
var TOS = new Rerouter_1.Page('TOS', [
    // logo
    { x: 289, y: 40, r: 232, g: 52, b: 74 },
    { x: 293, y: 34, r: 229, g: 21, b: 46 },
    { x: 299, y: 38, r: 227, g: 6, b: 33 },
    { x: 308, y: 37, r: 248, g: 192, b: 199 },
    { x: 313, y: 39, r: 248, g: 192, b: 199 },
    { x: 321, y: 37, r: 255, g: 255, b: 255 },
    { x: 325, y: 42, r: 255, g: 255, b: 255 },
    { x: 333, y: 33, r: 252, g: 223, b: 227 },
    { x: 338, y: 38, r: 255, g: 255, b: 255 },
    { x: 342, y: 38, r: 246, g: 176, b: 185 },
    { x: 344, y: 37, r: 246, g: 177, b: 185 },
    { x: 346, y: 36, r: 234, g: 68, b: 89 },
    { x: 335, y: 34, r: 234, g: 67, b: 87 },
    { x: 335, y: 37, r: 255, g: 255, b: 255 },
    { x: 344, y: 35, r: 227, g: 6, b: 33 },
    // copyright
    { x: 289, y: 335, r: 255, g: 255, b: 255 },
    { x: 300, y: 336, r: 194, g: 197, b: 195 },
    { x: 301, y: 336, r: 187, g: 192, b: 189 },
    { x: 307, y: 336, r: 255, g: 255, b: 255 },
    { x: 310, y: 336, r: 255, g: 255, b: 255 },
    { x: 320, y: 335, r: 255, g: 255, b: 255 },
    { x: 323, y: 336, r: 255, g: 255, b: 255 },
    { x: 332, y: 336, r: 181, g: 186, b: 183 },
    { x: 340, y: 336, r: 255, g: 255, b: 255 },
    // agree btn bg
    { x: 17, y: 293, r: 232, g: 232, b: 232 },
    { x: 54, y: 305, r: 255, g: 255, b: 255 },
    { x: 62, y: 317, r: 255, g: 255, b: 255 },
    { x: 111, y: 316, r: 255, g: 255, b: 255 },
    { x: 243, y: 297, r: 232, g: 232, b: 232 },
    { x: 255, y: 291, r: 232, g: 232, b: 232 },
    { x: 599, y: 304, r: 255, g: 255, b: 255 },
    { x: 613, y: 295, r: 232, g: 232, b: 232 },
    { x: 603, y: 316, r: 255, g: 255, b: 255 },
    { x: 421, y: 322, r: 232, g: 232, b: 232 },
    // bg corner outside
    { x: 72, y: 32, r: 255, g: 255, b: 255 },
    { x: 511, y: 40, r: 255, g: 255, b: 255 },
    { x: 586, y: 39, r: 255, g: 255, b: 255 },
    { x: 14, y: 340, r: 255, g: 255, b: 255 },
    { x: 619, y: 340, r: 255, g: 255, b: 255 },
    // bg corner inside
    { x: 22, y: 77, r: 232, g: 232, b: 232 },
    { x: 100, y: 77, r: 197, g: 197, b: 197 },
    { x: 18, y: 253, r: 232, g: 232, b: 232 },
    { x: 613, y: 286, r: 216, g: 216, b: 216 },
    { x: 613, y: 80, r: 215, g: 215, b: 215 },
    { x: 609, y: 73, r: 232, g: 232, b: 232 },
    { x: 305, y: 76, r: 183, g: 183, b: 183 },
    { x: 304, y: 291, r: 232, g: 232, b: 232 },
], { x: 320, y: 306 }, { x: 320, y: 306 });
// term of service, suit dgi90
var TOS90 = new Rerouter_1.Page('TOS90', [
    // bg
    { x: 32, y: 28, r: 255, g: 255, b: 255 },
    { x: 10, y: 342, r: 255, g: 255, b: 255 },
    { x: 622, y: 343, r: 255, g: 255, b: 255 },
    { x: 621, y: 32, r: 255, g: 255, b: 255 },
    // logo
    { x: 288, y: 27, r: 255, g: 255, b: 255 },
    { x: 301, y: 27, r: 246, g: 177, b: 185 },
    { x: 321, y: 24, r: 255, g: 255, b: 255 },
    { x: 320, y: 28, r: 245, g: 161, b: 171 },
    { x: 330, y: 28, r: 230, g: 36, b: 60 },
    { x: 344, y: 28, r: 255, g: 255, b: 255 },
], { x: 321, y: 321 }, { x: 321, y: 321 });
// for dgi90 and navi bar is smaller
var TOS90v2 = new Rerouter_1.Page('TOS90v2', [
    // bg
    { x: 2, y: 23, r: 255, g: 255, b: 255 },
    { x: 1, y: 42, r: 232, g: 232, b: 232 },
    { x: 1, y: 325, r: 232, g: 232, b: 232 },
    { x: 7, y: 348, r: 255, g: 255, b: 255 },
    { x: 631, y: 350, r: 255, g: 255, b: 255 },
    { x: 628, y: 321, r: 255, g: 255, b: 255 },
    { x: 633, y: 292, r: 213, g: 213, b: 213 },
    { x: 630, y: 40, r: 232, g: 232, b: 232 },
    { x: 628, y: 21, r: 255, g: 255, b: 255 },
    // logo
    { x: 296, y: 21, r: 248, g: 192, b: 199 },
    { x: 316, y: 24, r: 227, g: 6, b: 33 },
    { x: 340, y: 22, r: 239, g: 115, b: 130 },
], { x: 321, y: 321 }, { x: 321, y: 321 });
// like landing but has progress bar
var landingLoading = new Rerouter_1.Page('landingLoading', [
    // logo in center
    // 9innings
    { x: 215, y: 243, r: 209, g: 196, b: 199 },
    { x: 261, y: 254, r: 16, g: 36, b: 66 },
    { x: 306, y: 248, r: 25, g: 45, b: 74 },
    { x: 345, y: 250, r: 255, g: 255, b: 255 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
var main = new Rerouter_1.Page('main', [
    // navi bar right
    { x: 622, y: 9, r: 214, g: 210, b: 214 },
    { x: 598, y: 11, r: 214, g: 226, b: 238 },
    { x: 592, y: 14, r: 74, g: 93, b: 123 },
    { x: 494, y: 15, r: 239, g: 179, b: 28 },
    { x: 503, y: 17, r: 74, g: 84, b: 90 },
    { x: 389, y: 12, r: 197, g: 202, b: 197 },
    { x: 313, y: 11, r: 174, g: 178, b: 179 },
    { x: 297, y: 15, r: 214, g: 214, b: 214 },
    // btn left, with settings
    { x: 31, y: 326, r: 255, g: 255, b: 255 },
    { x: 87, y: 326, r: 255, g: 255, b: 255 },
    { x: 137, y: 326, r: 108, g: 114, b: 100 },
    { x: 189, y: 325, r: 255, g: 255, b: 255 },
    { x: 243, y: 328, r: 126, g: 129, b: 126 },
    { x: 299, y: 328, r: 103, g: 107, b: 99 },
    // btn right
    { x: 514, y: 324, r: 33, g: 98, b: 164 },
    { x: 570, y: 327, r: 133, g: 27, b: 35 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
var mainBtns = {
    leagueMode: { x: 204, y: 154 },
    battleMode: { x: 350, y: 145 },
    specialMode: { x: 438, y: 145 },
    clubMode: { x: 556, y: 145 },
    settings: { x: 298, y: 327 },
    adTab: { x: 590, y: 77 },
    achievement: { x: 139, y: 320 },
};
var chatDialogChatOnBtn = new Rerouter_1.Page('chatDialogChatOnBtn', [
    { x: 526, y: 276, r: 199, g: 207, b: 214 },
    { x: 541, y: 286, r: 2, g: 86, b: 238 },
    { x: 566, y: 273, r: 188, g: 218, b: 255 },
    { x: 584, y: 284, r: 8, g: 90, b: 238 },
    { x: 594, y: 279, r: 33, g: 102, b: 201 },
], { x: 567, y: 280 }, // turn off
{ x: 40, y: 313 } // back
);


/***/ }),

/***/ "./src/tasks/commons/errors.ts":
/*!*************************************!*\
  !*** ./src/tasks/commons/errors.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ../taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../../constants */ "./src/constants.ts"));
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(unexpectedError.name),
        customMatch: function (context, image) {
            return modules_1.rerouter.isPageMatchImage(unexpectedError, image) &&
                !modules_1.rerouter.isPageMatchImage(leagueModeUnexpectedError, image) &&
                !modules_1.rerouter.isPageMatchImage(adRewardOnCD, image);
        },
        action: function (context, image, matched, finishRound) {
            if (modules_1.rerouter.isPageMatchImage(networkErrorMoveToLobby, image)) {
                modules_1.rerouter.goNext(networkErrorMoveToLobby);
                Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
                modules_1.state.onUnexpectedNetworkError();
                return;
            }
            modules_1.rerouter.goNext(unexpectedError);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(networkNoticeMoveToLobby.name),
        match: networkNoticeMoveToLobby,
        action: function (context, image, matched, finishRound) {
            modules_1.rerouter.goNext(networkNoticeMoveToLobby);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            modules_1.state.onUnexpectedNetworkError();
        },
        debug: true,
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueModeUnexpectedError.name),
        match: leagueModeUnexpectedError,
        action: function (context, image, matched, finishRound) {
            switch (context.task.name) {
                case taskNames_1.TASKS.playLeagueGame:
                    if (!modules_1.Config.config.hasCoolFeature) {
                        break;
                    }
                    // sometimes some unknown reason cannot enter game
                    var tryEnterGameCnts = modules_1.state.leagueGame.tryEnterGameCnts;
                    console.log('try enter game cnts', tryEnterGameCnts);
                    if (tryEnterGameCnts === 3) {
                        modules_1.rerouter.restartApp();
                    }
                    if (tryEnterGameCnts > 3) {
                        // can only resolved by resetting league mode progress
                        console.log('handleResetLeagueModeProgress');
                        modules_1.state.leagueGame.needResetProgress = true;
                        finishRound(true);
                    }
                    break;
                default:
                    break;
            }
            modules_1.rerouter.goNext(leagueModeUnexpectedError);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(adRewardOnCD.name),
        match: adRewardOnCD,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('ad is still cd');
            modules_1.rerouter.goBack(adRewardOnCD);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            if (context.task.name === taskNames_1.TASKS.adReward) {
                finishRound(true);
                modules_1.state.onRunning();
            }
        },
    });
    [errorNewUpdateAvailable, appIsNotResponding].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
            afterActionDelay: CONSTANTS.sleepWaitPageLong,
        });
    });
}
exports.addRoutes = addRoutes;
// for some situation, unexpectedError happens
// this also includes network error
var unexpectedError = new Rerouter_1.Page('unexpectedError', [
    { x: 323, y: 39, r: 181, g: 186, b: 189 },
    // x might be covered by other elements
    // { x: 514, y: 44, r: 80, g: 81, b: 81 },
    // { x: 524, y: 48, r: 64, g: 70, b: 71 },
    // { x: 518, y: 54, r: 65, g: 71, b: 71 },
    { x: 315, y: 269, r: 181, g: 186, b: 189 },
    { x: 315, y: 293, r: 8, g: 125, b: 255 },
    { x: 316, y: 299, r: 241, g: 247, b: 255 },
    { x: 317, y: 310, r: 0, g: 92, b: 245 },
    { x: 317, y: 313, r: 0, g: 85, b: 240 },
    { x: 317, y: 323, r: 222, g: 219, b: 222 },
], { x: 314, y: 299 }, { x: 314, y: 299 });
// happen in league master mode when unstable network error
// only move to lobby, should restart app for entering game
var networkErrorMoveToLobby = new Rerouter_1.Page('networkErrorMoveToLobby', [
    // title
    { x: 252, y: 53, r: 181, g: 186, b: 189 },
    { x: 269, y: 57, r: 36, g: 43, b: 49 },
    { x: 281, y: 57, r: 181, g: 186, b: 189 },
    { x: 278, y: 63, r: 16, g: 24, b: 33 },
    { x: 290, y: 61, r: 16, g: 24, b: 33 },
    { x: 301, y: 62, r: 38, g: 43, b: 50 },
    { x: 309, y: 60, r: 38, g: 40, b: 47 },
    { x: 316, y: 61, r: 144, g: 148, b: 152 },
    { x: 328, y: 59, r: 181, g: 186, b: 189 },
    { x: 337, y: 64, r: 160, g: 165, b: 169 },
    { x: 351, y: 64, r: 24, g: 30, b: 37 },
    { x: 356, y: 60, r: 16, g: 24, b: 33 },
    { x: 366, y: 64, r: 100, g: 104, b: 109 },
    { x: 370, y: 59, r: 132, g: 138, b: 144 },
    { x: 380, y: 65, r: 98, g: 103, b: 110 },
    // content
    // { x: 147, y: 166, r: 41, g: 49, b: 58 },
    // { x: 160, y: 171, r: 41, g: 49, b: 58 },
    // { x: 200, y: 166, r: 129, g: 136, b: 141 },
    // { x: 228, y: 171, r: 181, g: 186, b: 189 },
    // { x: 260, y: 162, r: 181, g: 186, b: 189 },
    // { x: 273, y: 169, r: 78, g: 83, b: 91 },
    // { x: 404, y: 167, r: 104, g: 111, b: 118 },
    // { x: 417, y: 172, r: 60, g: 69, b: 77 },
    // { x: 434, y: 166, r: 130, g: 138, b: 142 },
    // { x: 452, y: 174, r: 151, g: 157, b: 164 },
    // { x: 468, y: 165, r: 41, g: 50, b: 60 },
    // { x: 482, y: 174, r: 156, g: 160, b: 167 },
    // { x: 489, y: 172, r: 79, g: 83, b: 95 },
    // { x: 504, y: 175, r: 181, g: 186, b: 189 },
], { x: 314, y: 299 }, { x: 314, y: 299 });
// same as error, diff layout
var networkNoticeMoveToLobby = new Rerouter_1.Page('networkNoticeMoveToLobby', [
    // content
    { x: 232, y: 148, r: 182, g: 185, b: 194 },
    { x: 213, y: 174, r: 75, g: 80, b: 90 },
    { x: 202, y: 191, r: 197, g: 198, b: 206 },
    { x: 224, y: 191, r: 91, g: 99, b: 107 },
    { x: 382, y: 146, r: 191, g: 192, b: 200 },
    { x: 398, y: 150, r: 118, g: 123, b: 129 },
    { x: 393, y: 172, r: 137, g: 141, b: 150 },
    { x: 420, y: 172, r: 93, g: 100, b: 110 },
    { x: 422, y: 190, r: 67, g: 74, b: 83 },
    { x: 448, y: 199, r: 197, g: 198, b: 206 },
    { x: 448, y: 199, r: 197, g: 198, b: 206 },
    // yes
    { x: 362, y: 300, r: 8, g: 117, b: 255 },
    { x: 403, y: 303, r: 247, g: 250, b: 253 },
    { x: 427, y: 309, r: 8, g: 93, b: 240 },
    // no
    { x: 206, y: 300, r: 41, g: 77, b: 123 },
    { x: 241, y: 301, r: 176, g: 195, b: 225 },
    { x: 279, y: 310, r: 34, g: 69, b: 115 },
], { x: 362, y: 300 }, // yes, don't move to lobby
{ x: 362, y: 300 });
// cannot go to league mode due to unexpected error
var leagueModeUnexpectedError = new Rerouter_1.Page('leagueModeUnexpectedError', [
    // title notice
    { x: 292, y: 54, r: 197, g: 198, b: 206 },
    { x: 297, y: 56, r: 60, g: 67, b: 77 },
    { x: 312, y: 56, r: 96, g: 99, b: 109 },
    // content
    { x: 159, y: 142, r: 52, g: 59, b: 69 },
    { x: 141, y: 169, r: 197, g: 198, b: 206 },
    { x: 172, y: 162, r: 97, g: 101, b: 111 },
    { x: 193, y: 167, r: 197, g: 198, b: 206 },
    { x: 164, y: 182, r: 81, g: 87, b: 96 },
    { x: 200, y: 184, r: 194, g: 195, b: 203 },
    { x: 273, y: 202, r: 141, g: 147, b: 155 },
    { x: 296, y: 202, r: 103, g: 107, b: 115 },
    { x: 329, y: 209, r: 197, g: 198, b: 206 },
    { x: 381, y: 208, r: 136, g: 139, b: 147 },
    { x: 435, y: 140, r: 83, g: 89, b: 97 },
    { x: 456, y: 141, r: 124, g: 127, b: 134 },
    { x: 480, y: 159, r: 79, g: 86, b: 97 },
    { x: 486, y: 183, r: 41, g: 49, b: 58 },
    // ok & bg
    { x: 319, y: 301, r: 24, g: 117, b: 238 },
    { x: 164, y: 304, r: 239, g: 242, b: 239 },
    { x: 487, y: 303, r: 241, g: 240, b: 241 },
], { x: 320, y: 300 }, { x: 320, y: 300 });
var appIsNotResponding = new Rerouter_1.Page('appIsNotResponding', [
    { x: 164, y: 154, r: 255, g: 255, b: 255 },
    { x: 189, y: 157, r: 203, g: 203, b: 203 },
    { x: 223, y: 158, r: 171, g: 171, b: 171 },
    { x: 254, y: 158, r: 48, g: 48, b: 48 },
    { x: 273, y: 157, r: 96, g: 96, b: 96 },
    { x: 302, y: 157, r: 54, g: 54, b: 54 },
    { x: 168, y: 185, r: 255, g: 255, b: 255 },
    { x: 205, y: 190, r: 119, g: 119, b: 119 },
    { x: 218, y: 184, r: 255, g: 255, b: 255 },
    { x: 230, y: 186, r: 85, g: 85, b: 85 },
    { x: 170, y: 211, r: 127, g: 202, b: 195 },
    { x: 210, y: 213, r: 255, g: 255, b: 255 },
    { x: 199, y: 213, r: 111, g: 111, b: 111 },
    { x: 466, y: 166, r: 255, g: 255, b: 255 },
    { x: 469, y: 218, r: 255, g: 255, b: 255 },
], { x: 220, y: 186 }, // close app
{ x: 220, y: 186 });
// need to update apk ver
var errorNewUpdateAvailable = new Rerouter_1.Page('errorNewUpdateAvailable', [
    // title
    { x: 208, y: 45, r: 181, g: 186, b: 189 },
    { x: 236, y: 58, r: 16, g: 24, b: 24 },
    { x: 260, y: 58, r: 125, g: 129, b: 133 },
    { x: 272, y: 57, r: 128, g: 136, b: 140 },
    { x: 313, y: 56, r: 181, g: 186, b: 189 },
    { x: 335, y: 56, r: 16, g: 24, b: 24 },
    { x: 363, y: 60, r: 181, g: 186, b: 189 },
    { x: 381, y: 61, r: 16, g: 24, b: 24 },
    { x: 388, y: 63, r: 126, g: 131, b: 134 },
    { x: 397, y: 63, r: 57, g: 64, b: 70 },
    { x: 407, y: 54, r: 181, g: 186, b: 189 },
    { x: 419, y: 59, r: 181, g: 186, b: 189 },
    // new update in content (104)
    { x: 227, y: 139, r: 176, g: 178, b: 184 },
    { x: 289, y: 144, r: 117, g: 121, b: 121 },
    { x: 260, y: 144, r: 108, g: 110, b: 108 },
    { x: 309, y: 144, r: 181, g: 186, b: 189 },
    { x: 326, y: 142, r: 87, g: 91, b: 90 },
    { x: 343, y: 143, r: 83, g: 88, b: 88 },
    { x: 376, y: 144, r: 69, g: 71, b: 69 },
    { x: 395, y: 144, r: 68, g: 72, b: 71 },
    { x: 409, y: 144, r: 122, g: 123, b: 125 },
    { x: 421, y: 144, r: 181, g: 186, b: 189 },
    // ok
    { x: 285, y: 297, r: 8, g: 118, b: 255 },
    { x: 312, y: 294, r: 8, g: 125, b: 255 },
    { x: 320, y: 299, r: 135, g: 188, b: 255 },
    { x: 364, y: 307, r: 0, g: 102, b: 247 },
    // popup bg and x
    { x: 117, y: 46, r: 181, g: 186, b: 189 },
    { x: 512, y: 46, r: 188, g: 186, b: 189 },
    { x: 524, y: 57, r: 189, g: 189, b: 189 },
    { x: 157, y: 232, r: 181, g: 186, b: 189 },
    { x: 209, y: 296, r: 222, g: 219, b: 222 },
    { x: 423, y: 304, r: 222, g: 219, b: 222 },
    { x: 443, y: 227, r: 181, g: 186, b: 189 },
], 
// TODO: check whether need to press ok
{ x: 314, y: 299 }, { x: 314, y: 299 });
var adRewardOnCD = new Rerouter_1.Page('adRewardOnCD', [
    // title coming soon
    { x: 266, y: 60, r: 197, g: 198, b: 206 },
    { x: 299, y: 59, r: 154, g: 157, b: 162 },
    { x: 328, y: 61, r: 197, g: 198, b: 206 },
    { x: 340, y: 57, r: 141, g: 145, b: 149 },
    { x: 365, y: 56, r: 57, g: 63, b: 70 },
    // ok
    { x: 288, y: 301, r: 8, g: 114, b: 248 },
    { x: 313, y: 304, r: 159, g: 190, b: 235 },
    { x: 362, y: 307, r: 8, g: 98, b: 247 },
], { x: 516, y: 48 }, // close
{ x: 516, y: 48 });


/***/ }),

/***/ "./src/tasks/commons/index.ts":
/*!************************************!*\
  !*** ./src/tasks/commons/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = void 0;
var confirmRoutes = __importStar(__webpack_require__(/*! ./confirms */ "./src/tasks/commons/confirms.ts"));
var enterAppRoutes = __importStar(__webpack_require__(/*! ./enterApp */ "./src/tasks/commons/enterApp.ts"));
var errorsRoutes = __importStar(__webpack_require__(/*! ./errors */ "./src/tasks/commons/errors.ts"));
var nextsRoutes = __importStar(__webpack_require__(/*! ./nexts */ "./src/tasks/commons/nexts.ts"));
var playRelatedRoutes = __importStar(__webpack_require__(/*! ./playRelated */ "./src/tasks/commons/playRelated.ts"));
var powerSavingsRoutes = __importStar(__webpack_require__(/*! ./powerSavings */ "./src/tasks/commons/powerSavings.ts"));
var promotionsRoutes = __importStar(__webpack_require__(/*! ./promotions */ "./src/tasks/commons/promotions.ts"));
function addRoutes() {
    [confirmRoutes, enterAppRoutes, errorsRoutes, nextsRoutes, playRelatedRoutes, powerSavingsRoutes, promotionsRoutes].forEach(function (route) {
        route.addRoutes();
    });
}
exports.addRoutes = addRoutes;


/***/ }),

/***/ "./src/tasks/commons/nexts.ts":
/*!************************************!*\
  !*** ./src/tasks/commons/nexts.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ../taskNames */ "./src/tasks/taskNames.ts");
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(nextGroup.name),
        match: nextGroup,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (!modules_1.rerouter.isPageMatchImage(rechargeBallGroup, image)) {
                modules_1.rerouter.goNext(nextGroup);
                return;
            }
            console.log("match rechargeBallGroup");
            switch (context.task.name) {
                case taskNames_1.TASKS.playLeagueGame:
                case taskNames_1.TASKS.playBattleGame:
                    console.log('cannot continue: recharge ball needed');
                    finishRound(true);
                default:
                    break;
            }
            modules_1.rerouter.goBack(rechargeBallLeagueMode);
        },
    });
}
exports.addRoutes = addRoutes;
// page has next button
var next = new Rerouter_1.Page('next', [
    { x: 273, y: 304, r: 8, g: 117, b: 255 },
    { x: 305, y: 307, r: 255, g: 255, b: 255 },
    { x: 314, y: 314, r: 255, g: 255, b: 255 },
    { x: 321, y: 305, r: 224, g: 236, b: 255 },
    { x: 328, y: 310, r: 1, g: 106, b: 255 },
    { x: 333, y: 299, r: 8, g: 125, b: 255 },
    { x: 374, y: 305, r: 8, g: 117, b: 255 },
    { x: 380, y: 319, r: 0, g: 89, b: 247 },
    { x: 265, y: 318, r: 0, g: 89, b: 247 },
], { x: 346, y: 307 }, { x: 346, y: 307 });
var next2 = new Rerouter_1.Page('next', [
    { x: 226, y: 296, r: 222, g: 219, b: 222 },
    { x: 275, y: 296, r: 8, g: 121, b: 255 },
    { x: 306, y: 299, r: 254, g: 254, b: 255 },
    { x: 314, y: 303, r: 255, g: 255, b: 255 },
    { x: 321, y: 299, r: 201, g: 223, b: 255 },
    { x: 331, y: 299, r: 255, g: 255, b: 255 },
    { x: 364, y: 310, r: 0, g: 94, b: 247 },
], { x: 346, y: 307 }, { x: 346, y: 307 });
var nextGroup = new Rerouter_1.GroupPage('next', [next, next2], next.next, next.back);
var rechargeBallLeagueMode = new Rerouter_1.Page('rechargeBallLeagueMode', [
    // title
    { x: 224, y: 55, r: 197, g: 198, b: 206 },
    { x: 268, y: 60, r: 24, g: 32, b: 37 },
    { x: 316, y: 62, r: 197, g: 198, b: 206 },
    { x: 368, y: 61, r: 23, g: 31, b: 40 },
    { x: 401, y: 56, r: 197, g: 198, b: 206 },
    { x: 440, y: 60, r: 197, g: 198, b: 206 },
    // bg
    { x: 110, y: 53, r: 197, g: 198, b: 206 },
    { x: 114, y: 298, r: 238, g: 243, b: 238 },
    { x: 315, y: 307, r: 234, g: 241, b: 234 },
    { x: 521, y: 306, r: 238, g: 243, b: 238 },
    { x: 518, y: 51, r: 197, g: 198, b: 198 },
], { x: 518, y: 49 }, // cancel
{ x: 518, y: 49 });
var rechargeBallRankMode = new Rerouter_1.Page('rechargeBallRankMode', [
    // title
    { x: 192, y: 49, r: 197, g: 198, b: 206 },
    { x: 241, y: 49, r: 182, g: 182, b: 191 },
    { x: 302, y: 58, r: 160, g: 161, b: 168 },
    { x: 345, y: 59, r: 197, g: 198, b: 206 },
    { x: 362, y: 59, r: 32, g: 38, b: 46 },
    { x: 415, y: 60, r: 67, g: 72, b: 80 },
    { x: 438, y: 58, r: 197, g: 198, b: 206 },
    // bg
    { x: 115, y: 46, r: 181, g: 186, b: 189 },
    { x: 109, y: 306, r: 214, g: 219, b: 222 },
    { x: 521, y: 305, r: 214, g: 219, b: 222 },
    { x: 515, y: 44, r: 71, g: 70, b: 71 },
], { x: 518, y: 49 }, // cancel
{ x: 518, y: 49 });
var rechargeBallGroup = new Rerouter_1.GroupPage('rechargeBallGroup', [rechargeBallLeagueMode, rechargeBallRankMode], rechargeBallLeagueMode.next, rechargeBallLeagueMode.back);


/***/ }),

/***/ "./src/tasks/commons/playRelated.ts":
/*!******************************************!*\
  !*** ./src/tasks/commons/playRelated.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ../taskNames */ "./src/tasks/taskNames.ts");
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(gameResult.name),
        match: gameResult,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            switch (context.task.name) {
                case taskNames_1.TASKS.playBattleGame:
                case taskNames_1.TASKS.playLeagueGame:
                    console.log('complete a game');
                    finishRound();
                    modules_1.state.onRunning();
                    break;
                default:
                    break;
            }
            modules_1.rerouter.goNext(gameResult);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(onQuickPlay.name),
        match: onQuickPlay,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('on quick playing');
            if (context.task.name === taskNames_1.TASKS.playLeagueGame) {
                // success enter game
                modules_1.state.leagueGame.tryEnterGameCnts = 0;
            }
            modules_1.state.onRunning(true);
            if (modules_1.rerouter.isPageMatchImage(onQuickPlayPause, image)) {
                console.log('game paused, resume it');
                modules_1.rerouter.goNext(onQuickPlayPause);
                return;
            }
            modules_1.rerouter.goNext(onQuickPlay);
        },
    });
    [gameResultOther, gameResultAquired].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
        });
    });
}
exports.addRoutes = addRoutes;
var gameResult = new Rerouter_1.Page('gameResult', [
    // title bg
    { x: 97, y: 22, r: 41, g: 45, b: 58 },
    { x: 131, y: 27, r: 41, g: 45, b: 58 },
    { x: 180, y: 24, r: 41, g: 45, b: 58 },
    { x: 423, y: 23, r: 41, g: 45, b: 58 },
    { x: 473, y: 23, r: 41, g: 45, b: 58 },
    { x: 513, y: 23, r: 41, g: 45, b: 58 },
    { x: 19, y: 23, r: 41, g: 49, b: 58 },
    { x: 615, y: 26, r: 41, g: 45, b: 58 },
    // view all btn
    { x: 115, y: 325, r: 49, g: 85, b: 123 },
    { x: 104, y: 332, r: 76, g: 103, b: 134 },
    { x: 124, y: 337, r: 41, g: 77, b: 115 },
    // box score btn
    { x: 223, y: 328, r: 144, g: 166, b: 193 },
    { x: 240, y: 324, r: 49, g: 85, b: 123 },
    { x: 242, y: 332, r: 49, g: 81, b: 116 },
    // next btn
    { x: 510, y: 326, r: 8, g: 117, b: 247 },
    { x: 540, y: 326, r: 255, g: 255, b: 255 },
    { x: 560, y: 329, r: 8, g: 114, b: 254 },
    { x: 586, y: 329, r: 8, g: 121, b: 255 },
    // bg between btns
    { x: 315, y: 331, r: 238, g: 247, b: 247 },
    { x: 369, y: 331, r: 238, g: 247, b: 247 },
    { x: 417, y: 329, r: 238, g: 247, b: 247 },
], { x: 609, y: 335 }, { x: 609, y: 335 });
var gameResultAquired = new Rerouter_1.Page('gameResultAquired', [
    { x: 449, y: 23, r: 41, g: 44, b: 49 },
    { x: 39, y: 329, r: 213, g: 218, b: 213 },
    { x: 158, y: 287, r: 247, g: 126, b: 51 },
    { x: 612, y: 328, r: 8, g: 109, b: 247 }, // ok btn
], { x: 612, y: 328 }, { x: 612, y: 328 });
var gameResultOther = new Rerouter_1.Page('gameResultOther', [
    { x: 71, y: 29, r: 0, g: 85, b: 156 },
    { x: 556, y: 15, r: 212, g: 228, b: 241 },
    { x: 595, y: 13, r: 0, g: 93, b: 181 },
    { x: 610, y: 13, r: 0, g: 28, b: 57 },
    { x: 618, y: 13, r: 17, g: 26, b: 58 },
    { x: 624, y: 8, r: 243, g: 244, b: 245 },
    { x: 627, y: 24, r: 165, g: 186, b: 202 },
    { x: 578, y: 23, r: 70, g: 132, b: 182 },
    { x: 249, y: 56, r: 84, g: 121, b: 161 },
    { x: 267, y: 56, r: 255, g: 255, b: 255 },
    { x: 319, y: 60, r: 168, g: 191, b: 208 },
    { x: 377, y: 58, r: 255, g: 255, b: 255 },
    { x: 29, y: 93, r: 0, g: 36, b: 66 },
    { x: 617, y: 314, r: 16, g: 24, b: 17 },
    { x: 108, y: 322, r: 8, g: 20, b: 16 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
var onQuickPlay = new Rerouter_1.Page('onQuickPlay', [
    // away
    { x: 4, y: 224, r: 238, g: 226, b: 222 },
    { x: 14, y: 224, r: 182, g: 63, b: 9 },
    { x: 26, y: 224, r: 185, g: 64, b: 8 },
    { x: 34, y: 224, r: 238, g: 227, b: 222 },
    // home
    { x: 605, y: 226, r: 238, g: 231, b: 222 },
    { x: 613, y: 226, r: 141, g: 165, b: 211 },
    { x: 619, y: 226, r: 204, g: 201, b: 222 },
    { x: 631, y: 227, r: 9, g: 81, b: 206 },
    // play-by-play
    { x: 249, y: 273, r: 230, g: 227, b: 222 },
    { x: 281, y: 272, r: 229, g: 235, b: 222 },
    { x: 309, y: 273, r: 205, g: 201, b: 200 },
    { x: 333, y: 274, r: 90, g: 89, b: 88 },
    { x: 346, y: 275, r: 62, g: 61, b: 62 },
    { x: 373, y: 275, r: 230, g: 227, b: 222 },
    // play manually
    // in ranked battle mode, there's no this btn
    // { x: 555, y: 186, r: 236, g: 244, b: 255 },
    // { x: 571, y: 186, r: 92, g: 151, b: 222 },
    // { x: 588, y: 187, r: 50, g: 144, b: 252 },
    // { x: 604, y: 187, r: 238, g: 246, b: 251 },
    // { x: 615, y: 187, r: 8, g: 121, b: 255 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
// FIXME: below should update
// sometimes the quick play will be paused
var onQuickPlayPause = new Rerouter_1.Page('onQuickPlayPause', [
    { x: 456, y: 11, r: 49, g: 73, b: 123 },
    { x: 472, y: 22, r: 201, g: 207, b: 218 },
    { x: 532, y: 22, r: 81, g: 100, b: 128 },
    { x: 453, y: 347, r: 24, g: 36, b: 57 },
    { x: 306, y: 276, r: 8, g: 118, b: 255 },
    { x: 421, y: 283, r: 2, g: 105, b: 247 },
    { x: 325, y: 337, r: 0, g: 97, b: 247 },
    { x: 430, y: 336, r: 0, g: 97, b: 247 },
], { x: 376, y: 329 }, // play ball // TODO: might need to set inning
{ x: 376, y: 329 });


/***/ }),

/***/ "./src/tasks/commons/powerSavings.ts":
/*!*******************************************!*\
  !*** ./src/tasks/commons/powerSavings.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.powerSaving = exports.handlePowerSavingPage = exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ../taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../../utils */ "./src/utils.ts");
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueOnPlayPowerSaveOn.name),
        match: leagueOnPlayPowerSaveOn,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            var isOnPlayTask = context.task.name === taskNames_1.TASKS.playLeagueGame;
            if (!modules_1.Config.config.hasCoolFeature || !isOnPlayTask || modules_1.rerouter.isPageMatchImage(exports.powerSaving, image)) {
                handlePowerSavingPage();
                return;
            }
            var now = Date.now();
            var _a = modules_1.state.leagueGame, lastCheckTimeAt = _a.lastCheckPowerSaveAt, colorCount = _a.powerSaveColorCount;
            if (now - lastCheckTimeAt < CONSTANTS.sendRunningEventInterval) {
                Rerouter_1.Utils.sleep(10000);
                return;
            }
            // use time to check whether game is still playing
            var colorCntNow = (0, utils_1.getColorCountInRange)(image, { x: 331, y: 310 }, { x: 403, y: 311 });
            var isSame = (0, utils_1.isSameColorCount)(colorCntNow, colorCount);
            modules_1.state.leagueGame.lastCheckPowerSaveAt = now;
            modules_1.state.leagueGame.powerSaveColorCount = colorCntNow;
            if (!isSame) {
                console.log('game is still playing with power save on');
                modules_1.state.onRunning();
                Rerouter_1.Utils.sleep(10000);
                return;
            }
            console.log('game is stuck');
        },
    });
}
exports.addRoutes = addRoutes;
function handlePowerSavingPage() {
    console.log('handlePowerSavingPage');
    modules_1.rerouter.screen.tapDown({ x: 100, y: 180 });
    Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
    modules_1.rerouter.screen.moveTo({ x: 500, y: 180 });
    Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
    modules_1.rerouter.screen.tapUp({ x: 500, y: 180 });
}
exports.handlePowerSavingPage = handlePowerSavingPage;
exports.powerSaving = new Rerouter_1.Page('powerSaving', [
    { x: 304, y: 136, r: 156, g: 160, b: 165 },
    { x: 305, y: 136, r: 156, g: 160, b: 165 },
    { x: 306, y: 136, r: 156, g: 160, b: 165 },
    { x: 307, y: 136, r: 156, g: 160, b: 165 },
    { x: 308, y: 136, r: 156, g: 160, b: 165 },
    { x: 301, y: 133, r: 165, g: 162, b: 165 },
    { x: 302, y: 133, r: 165, g: 162, b: 165 },
    { x: 303, y: 133, r: 165, g: 162, b: 165 },
    { x: 304, y: 133, r: 165, g: 162, b: 165 },
    { x: 305, y: 133, r: 165, g: 162, b: 165 },
    { x: 137, y: 155, r: 0, g: 0, b: 0 },
    { x: 521, y: 160, r: 0, g: 0, b: 0 },
    { x: 298, y: 50, r: 0, g: 0, b: 0 },
    { x: 618, y: 10, r: 0, g: 0, b: 0 },
    // to diff from power saving during playing
    { x: 497, y: 300, r: 0, g: 0, b: 0 },
    { x: 498, y: 300, r: 0, g: 0, b: 0 },
    { x: 499, y: 300, r: 0, g: 0, b: 0 },
    { x: 500, y: 300, r: 0, g: 0, b: 0 },
    { x: 501, y: 300, r: 0, g: 0, b: 0 },
    { x: 502, y: 300, r: 0, g: 0, b: 0 },
    { x: 503, y: 300, r: 0, g: 0, b: 0 },
    { x: 555, y: 282, r: 0, g: 0, b: 0 },
    { x: 555, y: 292, r: 0, g: 0, b: 0 },
    { x: 545, y: 291, r: 0, g: 0, b: 0 },
    // score
    { x: 520, y: 280, r: 0, g: 0, b: 0 },
    { x: 525, y: 280, r: 0, g: 0, b: 0 },
    { x: 530, y: 280, r: 0, g: 0, b: 0 },
    { x: 535, y: 280, r: 0, g: 0, b: 0 },
    { x: 540, y: 280, r: 0, g: 0, b: 0 },
    { x: 545, y: 280, r: 0, g: 0, b: 0 },
    { x: 550, y: 280, r: 0, g: 0, b: 0 },
    { x: 520, y: 295, r: 0, g: 0, b: 0 },
    { x: 525, y: 295, r: 0, g: 0, b: 0 },
    { x: 530, y: 295, r: 0, g: 0, b: 0 },
    { x: 535, y: 295, r: 0, g: 0, b: 0 },
    { x: 540, y: 295, r: 0, g: 0, b: 0 },
    { x: 545, y: 295, r: 0, g: 0, b: 0 },
    { x: 550, y: 295, r: 0, g: 0, b: 0 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
var leagueOnPlayPowerSaveOn = new Rerouter_1.Page('leagueOnPlayPowerSaveOn', [
    { x: 304, y: 136, r: 156, g: 160, b: 165 },
    { x: 305, y: 136, r: 156, g: 160, b: 165 },
    { x: 306, y: 136, r: 156, g: 160, b: 165 },
    { x: 307, y: 136, r: 156, g: 160, b: 165 },
    { x: 308, y: 136, r: 156, g: 160, b: 165 },
    { x: 301, y: 133, r: 165, g: 162, b: 165 },
    { x: 302, y: 133, r: 165, g: 162, b: 165 },
    { x: 303, y: 133, r: 165, g: 162, b: 165 },
    { x: 304, y: 133, r: 165, g: 162, b: 165 },
    { x: 305, y: 133, r: 165, g: 162, b: 165 },
    { x: 36, y: 26, r: 0, g: 0, b: 0 },
    { x: 36, y: 326, r: 0, g: 0, b: 0 },
    { x: 613, y: 330, r: 0, g: 0, b: 0 },
    { x: 618, y: 10, r: 0, g: 0, b: 0 },
    { x: 602, y: 27, r: 0, g: 0, b: 0 },
    { x: 174, y: 162, r: 0, g: 0, b: 0 },
    { x: 476, y: 158, r: 0, g: 0, b: 0 },
    // score bg
    { x: 497, y: 300, r: 16, g: 20, b: 16 },
    { x: 498, y: 300, r: 16, g: 20, b: 16 },
    { x: 499, y: 300, r: 16, g: 20, b: 16 },
    { x: 500, y: 300, r: 16, g: 20, b: 16 },
    { x: 501, y: 300, r: 16, g: 20, b: 16 },
    { x: 502, y: 300, r: 16, g: 20, b: 16 },
    { x: 503, y: 300, r: 16, g: 20, b: 16 },
], { x: 0, y: 0 }, { x: 0, y: 0 });


/***/ }),

/***/ "./src/tasks/commons/promotions.ts":
/*!*****************************************!*\
  !*** ./src/tasks/commons/promotions.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../../modules */ "./src/modules/index.ts");
function addRoutes() {
    [reviewApp, dailyPromotion, promotion1, promotion2, promotion3, rechargePromotion, teamSupportPackagePromotion, enterGamePromotion, event].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
        });
    });
}
exports.addRoutes = addRoutes;
var dailyPromotion = new Rerouter_1.Page('dailyPromotion', [
    // black bg
    { x: 45, y: 148, r: 10, g: 2, b: 3 },
    { x: 600, y: 145, r: 10, g: 9, b: 10 },
    { x: 328, y: 336, r: 3, g: 3, b: 3 },
    // don't show this again today (unselcted)
    { x: 176, y: 279, r: 111, g: 122, b: 146 },
    { x: 205, y: 280, r: 2, g: 2, b: 2 },
    { x: 241, y: 280, r: 10, g: 6, b: 7 },
    { x: 272, y: 282, r: 9, g: 8, b: 8 },
    // x
    { x: 480, y: 275, r: 115, g: 115, b: 115 },
    { x: 484, y: 278, r: 129, g: 129, b: 129 },
    { x: 479, y: 280, r: 204, g: 204, b: 205 },
    { x: 486, y: 281, r: 148, g: 148, b: 148 },
], { x: 483, y: 280 }, // x
{ x: 483, y: 280 });
var promotion1 = new Rerouter_1.Page('promotion1', [
    // x
    { x: 603, y: 27, r: 124, g: 130, b: 132 },
    { x: 612, y: 33, r: 60, g: 60, b: 60 },
    { x: 605, y: 40, r: 174, g: 178, b: 181 },
    { x: 605, y: 35, r: 181, g: 178, b: 181 },
    { x: 612, y: 39, r: 181, g: 178, b: 181 },
    { x: 616, y: 39, r: 181, g: 178, b: 181 },
    { x: 615, y: 29, r: 142, g: 144, b: 142 },
    // title bg right
    { x: 577, y: 38, r: 132, g: 133, b: 140 },
    { x: 582, y: 29, r: 132, g: 133, b: 140 },
    { x: 583, y: 41, r: 132, g: 133, b: 140 },
    { x: 590, y: 27, r: 132, g: 133, b: 140 },
    { x: 591, y: 38, r: 132, g: 133, b: 140 },
    { x: 592, y: 28, r: 132, g: 133, b: 140 },
    { x: 592, y: 41, r: 132, g: 133, b: 140 },
    // title bg left
    { x: 14, y: 29, r: 132, g: 133, b: 140 },
    { x: 14, y: 38, r: 132, g: 133, b: 140 },
], { x: 611, y: 36 }, { x: 611, y: 36 });
var promotion2 = new Rerouter_1.Page('promotion2', [
    { x: 43, y: 31, r: 206, g: 211, b: 222 },
    { x: 306, y: 29, r: 206, g: 211, b: 222 },
    { x: 546, y: 32, r: 206, g: 211, b: 222 },
    { x: 576, y: 36, r: 173, g: 174, b: 180 },
    { x: 580, y: 40, r: 174, g: 172, b: 175 },
    { x: 587, y: 36, r: 206, g: 207, b: 213 },
    { x: 576, y: 46, r: 213, g: 211, b: 215 },
    { x: 584, y: 45, r: 212, g: 210, b: 213 },
    { x: 595, y: 55, r: 206, g: 211, b: 222 },
], { x: 578, y: 39 }, { x: 578, y: 39 });
var promotion3 = new Rerouter_1.Page('promotion3', [
    { x: 598, y: 37, r: 101, g: 103, b: 102 },
    { x: 604, y: 45, r: 71, g: 73, b: 71 },
    { x: 612, y: 53, r: 174, g: 175, b: 176 },
    { x: 617, y: 33, r: 181, g: 186, b: 189 },
], { x: 601, y: 43 }, { x: 601, y: 43 });
var rechargePromotion = new Rerouter_1.Page('rechargePromotion', [
    { x: 114, y: 45, r: 181, g: 186, b: 189 },
    { x: 229, y: 59, r: 16, g: 24, b: 24 },
    { x: 280, y: 60, r: 35, g: 43, b: 48 },
    { x: 340, y: 58, r: 176, g: 181, b: 185 },
    { x: 407, y: 66, r: 38, g: 45, b: 47 },
    { x: 456, y: 89, r: 181, g: 186, b: 189 },
    { x: 520, y: 50, r: 67, g: 68, b: 68 },
    { x: 524, y: 58, r: 181, g: 186, b: 189 },
    { x: 529, y: 43, r: 151, g: 155, b: 156 },
    { x: 180, y: 302, r: 75, g: 149, b: 255 },
    { x: 144, y: 289, r: 41, g: 142, b: 255 },
    { x: 110, y: 300, r: 222, g: 223, b: 222 },
    { x: 337, y: 288, r: 41, g: 142, b: 255 },
    { x: 366, y: 302, r: 252, g: 253, b: 254 },
    { x: 438, y: 302, r: 255, g: 226, b: 125 },
    { x: 522, y: 311, r: 222, g: 223, b: 222 },
], { x: 518, y: 53 }, { x: 518, y: 53 });
var teamSupportPackagePromotion = new Rerouter_1.Page('teamSupportPackagePromotion', [
    // header bg and x
    { x: 558, y: 37, r: 90, g: 190, b: 148 },
    { x: 576, y: 42, r: 148, g: 203, b: 173 },
    { x: 590, y: 45, r: 145, g: 203, b: 171 },
    // purchase button
    { x: 576, y: 277, r: 255, g: 223, b: 0 },
    { x: 480, y: 278, r: 255, g: 210, b: 0 },
    { x: 506, y: 278, r: 120, g: 76, b: 8 },
    { x: 522, y: 274, r: 249, g: 245, b: 0 },
    { x: 538, y: 277, r: 128, g: 81, b: 7 },
], { x: 583, y: 45 }, { x: 583, y: 45 });
var enterGamePromotion = new Rerouter_1.Page('enterGamePromotion', [
    // x
    { x: 277, y: 280, r: 113, g: 124, b: 147 },
    // dont show this again today
    { x: 240, y: 280, r: 10, g: 7, b: 3 },
    { x: 207, y: 281, r: 36, g: 39, b: 47 },
    // bg
    { x: 279, y: 36, r: 3, g: 3, b: 3 },
    { x: 76, y: 169, r: 0, g: 2, b: 5 },
    { x: 326, y: 337, r: 3, g: 3, b: 2 },
    { x: 571, y: 211, r: 2, g: 2, b: 5 },
], { x: 485, y: 281 }, { x: 485, y: 281 });
// a page with a close btn but taller than promotion page
var event = new Rerouter_1.Page('event', [
    { x: 20, y: 21, r: 253, g: 254, b: 254 },
    { x: 47, y: 32, r: 132, g: 134, b: 140 },
    { x: 48, y: 23, r: 246, g: 247, b: 247 },
    { x: 603, y: 19, r: 124, g: 130, b: 132 },
    { x: 612, y: 22, r: 49, g: 52, b: 49 },
    { x: 622, y: 26, r: 181, g: 178, b: 181 },
], { x: 611, y: 23 }, { x: 611, y: 23 });
var reviewApp = new Rerouter_1.Page('reviewApp', [
    { x: 106, y: 42, r: 181, g: 186, b: 189 },
    { x: 316, y: 58, r: 84, g: 90, b: 93 },
    { x: 510, y: 43, r: 168, g: 176, b: 176 },
    { x: 525, y: 57, r: 143, g: 144, b: 144 },
    { x: 305, y: 61, r: 16, g: 24, b: 24 },
    { x: 338, y: 61, r: 16, g: 24, b: 24 },
    { x: 114, y: 301, r: 222, g: 219, b: 222 },
    { x: 153, y: 297, r: 49, g: 85, b: 123 },
    { x: 178, y: 299, r: 168, g: 190, b: 224 },
    { x: 241, y: 298, r: 222, g: 219, b: 222 },
    { x: 285, y: 305, r: 49, g: 85, b: 123 },
    { x: 308, y: 302, r: 79, g: 108, b: 145 },
    { x: 365, y: 302, r: 222, g: 219, b: 222 },
    { x: 421, y: 299, r: 8, g: 114, b: 255 },
    { x: 438, y: 299, r: 47, g: 138, b: 254 },
    { x: 489, y: 301, r: 8, g: 113, b: 255 },
    { x: 528, y: 305, r: 222, g: 219, b: 222 },
], { x: 161, y: 292 }, { x: 161, y: 292 });


/***/ }),

/***/ "./src/tasks/customPage.ts":
/*!*********************************!*\
  !*** ./src/tasks/customPage.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomPage = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var CustomPage = /** @class */ (function (_super) {
    __extends(CustomPage, _super);
    function CustomPage(name, customMatch, next, back, thres) {
        var _this = _super.call(this, name, [], next, back, thres) || this;
        _this.customMatch = customMatch;
        return _this;
    }
    return CustomPage;
}(Rerouter_1.Page));
exports.CustomPage = CustomPage;


/***/ }),

/***/ "./src/tasks/index.ts":
/*!****************************!*\
  !*** ./src/tasks/index.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.playBattleGame = exports.playLeagueGame = exports.adReward = exports.setting = exports.weeklyMission = exports.stayInLogin = exports.commons = void 0;
__exportStar(__webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts"), exports);
exports.commons = __importStar(__webpack_require__(/*! ./commons */ "./src/tasks/commons/index.ts"));
exports.stayInLogin = __importStar(__webpack_require__(/*! ./stayInLogin */ "./src/tasks/stayInLogin.ts"));
exports.weeklyMission = __importStar(__webpack_require__(/*! ./weeklyMission */ "./src/tasks/weeklyMission.ts"));
exports.setting = __importStar(__webpack_require__(/*! ./setting */ "./src/tasks/setting.ts"));
exports.adReward = __importStar(__webpack_require__(/*! ./adReward */ "./src/tasks/adReward.ts"));
exports.playLeagueGame = __importStar(__webpack_require__(/*! ./playLeagueGame */ "./src/tasks/playLeagueGame.ts"));
exports.playBattleGame = __importStar(__webpack_require__(/*! ./playBattleGame */ "./src/tasks/playBattleGame.ts"));


/***/ }),

/***/ "./src/tasks/playBattleGame.ts":
/*!*************************************!*\
  !*** ./src/tasks/playBattleGame.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = exports.addTask = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
function addTask() {
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.playBattleGame,
        minRoundInterval: CONSTANTS.hourInMs,
        maxTaskDuring: 10 * CONSTANTS.hourInMs,
        forceStop: true,
    });
}
exports.addTask = addTask;
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(battleModePanel.name),
        match: battleModePanel,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playBattleGame) {
                modules_1.rerouter.goBack(battleModePanel);
                return;
            }
            // TODO: check if play other mode too
            modules_1.rerouter.screen.tap(battleModePanelBtns.rankedBattle);
            console.log('play ranked battle');
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(rankedBattlePanel.name),
        match: rankedBattlePanel,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playBattleGame) {
                modules_1.rerouter.goBack(rankedBattlePanel);
                return;
            }
            // cannot play
            if (context.matchTimes > 5) {
                finishRound(true);
                modules_1.state.onRunning();
                return;
            }
            // check if play is available
            var isPlayDisabled = (0, utils_1.isSameColor)(image, rankedBattlePanelBtns.disabledPlayBtn);
            if (isPlayDisabled) {
                finishRound(true);
                modules_1.state.onRunning();
                console.log('ranked battle play disabled');
                return;
            }
            modules_1.rerouter.goNext(rankedBattlePanel);
            console.log('play ranked battle (single)');
            Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(rankedBattleWaitToRefresh.name),
        match: rankedBattleWaitToRefresh,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name === taskNames_1.TASKS.playBattleGame) {
                console.log('play rank game disabled');
                finishRound(true);
                modules_1.state.onRunning();
            }
            modules_1.rerouter.goBack(rankedBattleWaitToRefresh);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(rankedBattleGameInfo.name),
        match: rankedBattleGameInfo,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playBattleGame) {
                modules_1.rerouter.goBack(rankedBattleGameInfo);
                return;
            }
            modules_1.rerouter.goNext(rankedBattleGameInfo);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(autoGameConfirm.name),
        match: autoGameConfirm,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playBattleGame) {
                modules_1.rerouter.goBack(autoGameConfirm);
                return;
            }
            modules_1.rerouter.goNext(autoGameConfirm);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(autoGameConfirmEnd.name),
        match: autoGameConfirmEnd,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playBattleGame) {
                modules_1.rerouter.goBack(autoGameConfirmEnd);
                return;
            }
            modules_1.rerouter.goNext(autoGameConfirmEnd);
        },
    });
    [rankedBattleResult, rankedBattleWeeklyRankking].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: function (context, image, matched, finishRound) {
                modules_1.state.checkUploadSession();
                modules_1.rerouter.goNext(p);
            },
        });
    });
}
exports.addRoutes = addRoutes;
var battleModePanel = new Rerouter_1.Page('battleModePanel', [
    // nav bar right
    { x: 301, y: 5, r: 206, g: 214, b: 222 },
    { x: 313, y: 10, r: 229, g: 225, b: 229 },
    { x: 324, y: 7, r: 58, g: 97, b: 132 },
    { x: 388, y: 10, r: 238, g: 234, b: 238 },
    { x: 396, y: 6, r: 242, g: 240, b: 242 },
    { x: 492, y: 10, r: 246, g: 208, b: 45 },
    { x: 486, y: 4, r: 206, g: 214, b: 222 },
    { x: 598, y: 13, r: 104, g: 126, b: 153 },
    { x: 616, y: 12, r: 206, g: 214, b: 222 },
    // bg in right part
    { x: 595, y: 107, r: 39, g: 19, b: 22 },
    { x: 629, y: 176, r: 16, g: 12, b: 16 },
    { x: 629, y: 227, r: 36, g: 22, b: 19 },
    { x: 625, y: 317, r: 26, g: 12, b: 16 },
    // player angels 27
    { x: 110, y: 89, r: 196, g: 58, b: 59 },
    { x: 13, y: 183, r: 4, g: 6, b: 4 },
    // back
    { x: 25, y: 313, r: 206, g: 210, b: 214 },
    { x: 42, y: 320, r: 206, g: 210, b: 214 },
    { x: 31, y: 333, r: 206, g: 210, b: 214 },
], { x: 41, y: 320 }, // back
{ x: 41, y: 320 });
var battleModePanelBtns = {
    rankedBattle: { x: 287, y: 160 },
    friendBattle: { x: 287, y: 245 },
    powerRanking: { x: 526, y: 160 },
    pvp: { x: 525, y: 245 },
};
var rankedBattlePanel = new Rerouter_1.Page('rankedBattlePanel', [
    // nav bar right part icon
    // sometimes nav bar will disappear
    // { x: 312, y: 9, r: 238, g: 234, b: 238 },
    // { x: 390, y: 12, r: 127, g: 128, b: 127 },
    // { x: 493, y: 13, r: 208, g: 189, b: 51 },
    // { x: 597, y: 13, r: 74, g: 93, b: 123 },
    // bg in left
    // { x: 22, y: 66, r: 189, g: 190, b: 189 },
    // { x: 16, y: 194, r: 230, g: 227, b: 230 },
    // { x: 18, y: 260, r: 247, g: 243, b: 247 },
    // team support bg
    { x: 487, y: 86, r: 247, g: 243, b: 247 },
    { x: 614, y: 95, r: 247, g: 243, b: 247 },
    // bg of win/lose ratio in bottom left
    { x: 144, y: 286, r: 66, g: 61, b: 66 },
    { x: 354, y: 286, r: 66, g: 69, b: 66 },
    // bg of equipment in right
    { x: 488, y: 249, r: 33, g: 85, b: 156 },
    { x: 562, y: 250, r: 33, g: 85, b: 156 },
    // // energy (ball) in bottom
    // { x: 424, y: 325, r: 51, g: 58, b: 51 },
    // { x: 428, y: 326, r: 253, g: 251, b: 253 },
    // line up , power ranking, stats btn bg
    { x: 82, y: 328, r: 25, g: 69, b: 116 },
    { x: 146, y: 330, r: 25, g: 65, b: 115 },
    { x: 248, y: 330, r: 25, g: 65, b: 115 },
    // back
    { x: 42, y: 323, r: 214, g: 219, b: 214 },
], { x: 557, y: 332 }, // play ball
{ x: 41, y: 320 });
var rankedBattlePanelBtns = {
    awayGame: { x: 185, y: 65 },
    homeGame: { x: 293, y: 65 },
    disabledPlayBtn: { x: 502, y: 317, r: 90, g: 73, b: 49 },
};
// click refresh btn in rankedBattlePanel
var rankedBattleWaitToRefresh = new Rerouter_1.Page('rankedBattleWaitToRefresh', [
    // title and x
    { x: 207, y: 52, r: 181, g: 186, b: 189 },
    { x: 286, y: 53, r: 127, g: 131, b: 135 },
    { x: 362, y: 57, r: 181, g: 186, b: 189 },
    { x: 396, y: 51, r: 36, g: 44, b: 52 },
    { x: 518, y: 50, r: 145, g: 146, b: 145 },
    // count down bg
    { x: 114, y: 151, r: 25, g: 85, b: 82 },
    { x: 520, y: 155, r: 25, g: 53, b: 49 },
    // other bg
    { x: 106, y: 91, r: 181, g: 186, b: 189 },
    { x: 106, y: 311, r: 214, g: 219, b: 222 },
    { x: 527, y: 300, r: 214, g: 219, b: 222 },
    { x: 528, y: 255, r: 181, g: 186, b: 189 },
    { x: 523, y: 99, r: 181, g: 186, b: 189 },
], { x: 520, y: 50 }, // x
{ x: 520, y: 50 });
// same type as screen
var rankedBattleWeeklyRankking = new Rerouter_1.Page('rankedBattleWeeklyRankking', [
    // weekly rankking
    { x: 309, y: 44, r: 24, g: 30, b: 37 },
    { x: 344, y: 54, r: 16, g: 24, b: 33 },
    { x: 374, y: 54, r: 16, g: 24, b: 33 },
    // bg
    { x: 51, y: 48, r: 222, g: 219, b: 222 },
    { x: 51, y: 313, r: 238, g: 243, b: 238 },
    { x: 606, y: 304, r: 238, g: 243, b: 238 },
    // x
    { x: 603, y: 42, r: 74, g: 77, b: 74 },
    // ok
    { x: 296, y: 307, r: 8, g: 114, b: 255 },
    { x: 315, y: 310, r: 176, g: 208, b: 251 },
    { x: 364, y: 308, r: 8, g: 113, b: 248 },
], { x: 316, y: 301 }, // ok
{ x: 316, y: 301 });
var rankedBattleResult = new Rerouter_1.Page('rankedBattleResult', [
    // bg in mid
    { x: 10, y: 94, r: 58, g: 93, b: 140 },
    { x: 8, y: 248, r: 140, g: 158, b: 181 },
    { x: 624, y: 95, r: 58, g: 94, b: 140 },
    { x: 621, y: 246, r: 140, g: 158, b: 181 },
    { x: 336, y: 98, r: 58, g: 97, b: 140 },
    { x: 345, y: 255, r: 148, g: 162, b: 181 },
    // tier/ score / rank
    { x: 49, y: 127, r: 198, g: 203, b: 214 },
    { x: 59, y: 130, r: 196, g: 205, b: 212 },
    { x: 74, y: 133, r: 216, g: 221, b: 228 },
    { x: 101, y: 130, r: 85, g: 117, b: 153 },
    { x: 126, y: 126, r: 207, g: 216, b: 227 },
    { x: 168, y: 129, r: 233, g: 235, b: 238 },
    { x: 188, y: 132, r: 222, g: 229, b: 230 },
    // ok
    { x: 284, y: 296, r: 8, g: 118, b: 255 },
    { x: 330, y: 297, r: 8, g: 117, b: 255 },
    { x: 364, y: 306, r: 8, g: 101, b: 247 },
    { x: 317, y: 297, r: 229, g: 237, b: 250 },
], { x: 316, y: 310 }, // ok
{ x: 316, y: 310 });
var rankedBattleGameInfo = new Rerouter_1.Page('rankedBattleGameInfo', [
    // right part of nav bar
    { x: 616, y: 10, r: 214, g: 210, b: 214 },
    { x: 595, y: 13, r: 74, g: 93, b: 123 },
    { x: 589, y: 15, r: 75, g: 94, b: 123 },
    { x: 567, y: 14, r: 74, g: 85, b: 90 },
    { x: 573, y: 15, r: 74, g: 85, b: 90 },
    { x: 478, y: 20, r: 214, g: 210, b: 214 },
    { x: 471, y: 11, r: 205, g: 218, b: 230 },
    { x: 473, y: 10, r: 206, g: 219, b: 230 },
    { x: 393, y: 8, r: 129, g: 127, b: 129 },
    { x: 319, y: 14, r: 197, g: 198, b: 197 },
    // game info title
    { x: 284, y: 58, r: 41, g: 45, b: 58 },
    { x: 298, y: 62, r: 110, g: 111, b: 121 },
    { x: 307, y: 63, r: 163, g: 166, b: 171 },
    { x: 320, y: 62, r: 41, g: 45, b: 58 },
    { x: 332, y: 63, r: 221, g: 221, b: 225 },
    { x: 348, y: 60, r: 41, g: 45, b: 58 },
    { x: 205, y: 62, r: 41, g: 45, b: 58 },
    { x: 473, y: 66, r: 41, g: 45, b: 58 },
    { x: 148, y: 61, r: 41, g: 45, b: 58 },
    // playball/ playing btn
    { x: 487, y: 328, r: 212, g: 188, b: 32 },
    { x: 610, y: 325, r: 214, g: 179, b: 0 },
    { x: 552, y: 339, r: 181, g: 142, b: 0 },
    // back
    { x: 26, y: 316, r: 214, g: 218, b: 214 },
    { x: 40, y: 316, r: 214, g: 219, b: 214 },
    { x: 33, y: 329, r: 211, g: 215, b: 210 },
    // bg between back and play
    { x: 138, y: 325, r: 58, g: 69, b: 49 },
    { x: 200, y: 329, r: 49, g: 61, b: 41 },
    { x: 265, y: 330, r: 52, g: 62, b: 44 },
    { x: 345, y: 333, r: 66, g: 75, b: 58 },
    { x: 402, y: 334, r: 49, g: 53, b: 33 },
], { x: 518, y: 329 }, { x: 26, y: 316 });
// a page to start auto game
var autoGameConfirm = new Rerouter_1.Page('autoGameConfirm', [
    // title
    { x: 277, y: 60, r: 180, g: 186, b: 189 },
    { x: 295, y: 58, r: 16, g: 24, b: 33 },
    { x: 308, y: 61, r: 16, g: 24, b: 33 },
    { x: 328, y: 58, r: 177, g: 183, b: 185 },
    { x: 353, y: 61, r: 177, g: 182, b: 185 },
    // bg
    { x: 108, y: 49, r: 181, g: 186, b: 189 },
    { x: 107, y: 314, r: 214, g: 219, b: 222 },
    { x: 516, y: 302, r: 214, g: 219, b: 222 },
    { x: 491, y: 171, r: 181, g: 186, b: 189 },
    // x
    { x: 510, y: 48, r: 168, g: 173, b: 176 },
    { x: 516, y: 55, r: 103, g: 105, b: 109 },
    { x: 524, y: 48, r: 71, g: 70, b: 71 },
    // no and yes
    { x: 223, y: 298, r: 41, g: 77, b: 123 },
    { x: 248, y: 298, r: 158, g: 183, b: 214 },
    { x: 388, y: 299, r: 196, g: 223, b: 255 },
    { x: 430, y: 302, r: 8, g: 113, b: 247 },
    // content to diff with confirm end (you selected)
    { x: 286, y: 180, r: 82, g: 86, b: 94 },
    { x: 304, y: 178, r: 120, g: 128, b: 136 },
    { x: 324, y: 178, r: 95, g: 103, b: 112 },
], { x: 390, y: 304 }, // yes, start auto play
{ x: 237, y: 304 } // no, not start auto play
);
// a page to end auto game
var autoGameConfirmEnd = new Rerouter_1.Page('autoGameConfirmEnd', [
    // title
    { x: 277, y: 60, r: 180, g: 186, b: 189 },
    { x: 295, y: 58, r: 16, g: 24, b: 33 },
    { x: 308, y: 61, r: 16, g: 24, b: 33 },
    { x: 328, y: 58, r: 177, g: 183, b: 185 },
    { x: 353, y: 61, r: 177, g: 182, b: 185 },
    // bg
    { x: 108, y: 49, r: 181, g: 186, b: 189 },
    { x: 107, y: 314, r: 214, g: 219, b: 222 },
    { x: 516, y: 302, r: 214, g: 219, b: 222 },
    { x: 491, y: 171, r: 181, g: 186, b: 189 },
    // x
    { x: 510, y: 48, r: 168, g: 173, b: 176 },
    { x: 516, y: 55, r: 103, g: 105, b: 109 },
    { x: 524, y: 48, r: 71, g: 70, b: 71 },
    // no and yes
    { x: 223, y: 298, r: 41, g: 77, b: 123 },
    { x: 248, y: 298, r: 158, g: 183, b: 214 },
    { x: 388, y: 299, r: 196, g: 223, b: 255 },
    { x: 430, y: 302, r: 8, g: 113, b: 247 },
    // TODO: use end game content
], { x: 237, y: 304 }, // no, continue auto play
{ x: 390, y: 304 } // yes, end auto play
);


/***/ }),

/***/ "./src/tasks/playLeagueGame.ts":
/*!*************************************!*\
  !*** ./src/tasks/playLeagueGame.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = exports.addTask = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../modules */ "./src/modules/index.ts");
var customPage_1 = __webpack_require__(/*! ./customPage */ "./src/tasks/customPage.ts");
var taskNames_1 = __webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
function addTask() {
    console.log('addTask playLeagueGame');
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.playLeagueGame,
        // maxTaskRunTimes: 2,
        maxTaskDuring: 10 * CONSTANTS.hourInMs,
        forceStop: true,
    });
}
exports.addTask = addTask;
function addRoutes() {
    // enter game info
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueModePanel.name),
        match: leagueModePanel,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playLeagueGame) {
                modules_1.rerouter.goBack(leagueModePanel);
                return;
            }
            // can play league mode
            modules_1.state.leagueGame.tryEnterGameCnts++;
            // avoid to click btn too many time for trigger next page immediately
            if (context.matchTimes < 2) {
                modules_1.rerouter.goNext(leagueModePanel);
            }
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueModeGameInfo.name),
        match: leagueModeGameInfo,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playLeagueGame) {
                modules_1.rerouter.goBack(leagueModeGameInfo);
                return;
            }
            console.log('check energy');
            var emptyEnergy = { x: 551, y: 281, r: 3, g: 124, b: 213 };
            var hasEnergy0 = (0, utils_1.isSameColor)(image, emptyEnergy, 0.9);
            if (hasEnergy0) {
                console.log('no energy');
                finishRound(true);
                modules_1.state.onRunning();
                return;
            }
            var digit1 = { x: 561, y: 278, r: 169, g: 172, b: 179 };
            var hasEnergy10 = (0, utils_1.isSameColor)(image, digit1);
            console.log('has10Energy:', hasEnergy10);
            // use quick play when has 10+ energy,
            // and slow play when has 10- energy
            var quickPlayOnBtn = { x: 37, y: 284, r: 33, g: 255, b: 140 };
            var isQuickPlayOn = (0, utils_1.isSameColor)(image, quickPlayOnBtn);
            if (hasEnergy10 && !isQuickPlayOn) {
                modules_1.rerouter.screen.tap(quickPlayOnBtn); // select quick play
                console.log('turn on quick play');
                Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
            }
            if (!hasEnergy10 && isQuickPlayOn) {
                modules_1.rerouter.screen.tap(quickPlayOnBtn); // cancel quick play
                console.log('turn off quick play');
                Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
            }
            modules_1.rerouter.goNext(leagueModeGameInfo); // play ball
            console.log("play league mode game ".concat(hasEnergy10 ? '(quick mode)' : ''));
            Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
        },
    });
    // select things
    modules_1.rerouter.addRoute({
        path: "/".concat(selectPlayRoleGroups.name),
        match: selectPlayRoleGroups,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle select play role');
            modules_1.rerouter.goNext(selectPlayRoleGroups);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(selectYear.name),
        match: selectYear,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle select year page');
            handleSelectYear(__assign(__assign({}, selectYearBtns), { activeBtnColor: { r: 49, g: 85, b: 123 } }));
            if (context.task.name === taskNames_1.TASKS.settingResetLeagueProgress && modules_1.rerouter.isPageMatchImage(leagueResetDialog, image)) {
                modules_1.state.leagueGame.needResetProgress = false;
                finishRound(true);
                console.log('reset league mode done');
            }
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(selectSeasonMode.name),
        match: selectSeasonMode,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle select season page');
            modules_1.rerouter.goNext(selectSeasonMode);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            modules_1.rerouter.screen.tap({ x: 568, y: 333 }); // normal mode
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            // TODO split page
            modules_1.rerouter.screen.tap({ x: 332, y: 301 }); // next season
            Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(selectLeagueGameAmount.name),
        match: selectLeagueGameAmount,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle select league game amount page');
            // use config user setted to select which they want to play
            // TODO: handle the half, quarter, full has 2 next page
            switch (modules_1.Config.config.leagueSeasonMode) {
                case 'full':
                    console.log('select full league');
                    modules_1.rerouter.screen.tap(selectLeagueGameAmountBtns.full);
                    Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
                    modules_1.rerouter.screen.tap({ x: 564, y: 328 }); // go next
                    break;
                case 'half':
                    console.log('select 1/2 league');
                    modules_1.rerouter.screen.tap(selectLeagueGameAmountBtns.half);
                    Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
                    modules_1.rerouter.screen.tap({ x: 564, y: 328 }); // go next
                    // ? will go to ok / next pages
                    break;
                case 'quarter':
                    console.log('select 1/4 league');
                    modules_1.rerouter.screen.tap(selectLeagueGameAmountBtns.quarter);
                    Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
                    modules_1.rerouter.screen.tap({ x: 564, y: 328 }); // go next
                    // ? will go to ok / next pages
                    break;
                case 'postSeason':
                    console.log('select postSeason');
                    modules_1.rerouter.screen.tap(selectLeagueGameAmountBtns.post);
                    // ? will go to ok / next pages
                    break;
            }
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            modules_1.rerouter.screen.tap({ x: 564, y: 328 }); // go next
            Rerouter_1.Utils.sleep(CONSTANTS.sleepLong);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(selectNormalMasterLeagueMode.name),
        match: selectNormalMasterLeagueMode,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle select normal / master mode');
            // if cannot select master mode, at least select normal mode
            modules_1.rerouter.screen.tap(selectNormalMasterLeagueModeBtns.normal);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            modules_1.rerouter.screen.tap(selectNormalMasterLeagueModeBtns.master);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            // whether choose any mode, will jump to proceed page
            modules_1.rerouter.goNext(selectNormalMasterLeagueMode);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueResetDialogYN.name),
        match: leagueResetDialogYN,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle reset league dialog with yes/no');
            // TODO: let user choose in config
            if (context.lastMatchedPath === "/".concat(selectNormalMasterLeagueModeProceed.name)) {
                console.log('reset league mode');
                modules_1.rerouter.goNext(leagueResetDialogYN);
                return;
            }
            // not reset
            modules_1.rerouter.goBack(leagueResetDialogYN);
            return;
        },
    });
    // on play (quick play is in general)
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueOnPlayAutoOff.name),
        customMatch: leagueOnPlayAutoOff.customMatch,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.playLeagueGame) {
                // open pause panel
                keycode('KEYCODE_BACK', 100);
                // rerouter.goBack(leagueOnPlayAutoOff);
                return;
            }
            // success enter game
            modules_1.state.leagueGame.tryEnterGameCnts = 0;
            console.log('start turn on auto play');
            var isAutoOn = false;
            for (var remainClick = 3; remainClick > 0 && !isAutoOn; remainClick--) {
                modules_1.rerouter.goNext(leagueOnPlayAutoOff);
                Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
                var screenshot = getScreenshot();
                isAutoOn = modules_1.rerouter.isPageMatchImage(leagueOnPlayAutoOn, screenshot);
                releaseImage(screenshot);
            }
            if (isAutoOn) {
                console.log('turn on auto play done');
                if (modules_1.Config.config.hasCoolFeature) {
                    console.log('turn on power save play');
                    modules_1.rerouter.goNext(leagueOnPlayAutoOn);
                    return;
                }
                return;
            }
            else {
                console.log('turn on auto play failed; retry in next match');
            }
        },
        debug: true,
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueOnPlayAutoOn.name),
        customMatch: leagueOnPlayAutoOn.customMatch,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            // page will be stopped here in any tasks
            // need to handle immediately if match
            if (modules_1.rerouter.isPageMatchImage(leagueOnPlayPowerSaveOffStopped, image)) {
                console.log('handle auto on but stopped page');
                modules_1.rerouter.goNext(leagueOnPlayPowerSaveOffStopped);
            }
            if (context.task.name !== taskNames_1.TASKS.playLeagueGame) {
                // turn off autoplay to return
                keycode('KEYCODE_BACK', 100);
                return;
            }
            // success enter game
            modules_1.state.leagueGame.tryEnterGameCnts = 0;
            // TODO: handle quick switch to auto play off if was stopped
            if (modules_1.Config.config.hasCoolFeature) {
                console.log('turn on power save play');
                modules_1.rerouter.goNext(leagueOnPlayAutoOn);
                return;
            }
            modules_1.rerouter.screen.tap({ x: 0, y: 0 });
            console.log('tap');
        },
        debug: true,
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(leagueOnPlayPause.name),
        match: leagueOnPlayPause,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle on play pause panel');
            if (context.task.name !== taskNames_1.TASKS.playLeagueGame) {
                // open pause panel
                modules_1.rerouter.goBack(leagueOnPlayPause);
                return;
            }
            // continue play
            keycode('KEYCODE_BACK', 100);
            console.log('tap back to stay in game');
        },
    });
    // game reward pages
    modules_1.rerouter.addRoute({
        path: "/".concat(selectRewardPlayer.name),
        match: selectRewardPlayer,
        action: function (context, image, matched, finishRound) {
            var _a;
            modules_1.state.checkUploadSession();
            console.log('handleSelectRewardPlayer');
            var bestCardRank = -1;
            var bestCardPos = selectRewardPlayerBtns[0];
            for (var _i = 0, selectRewardPlayerBtns_1 = selectRewardPlayerBtns; _i < selectRewardPlayerBtns_1.length; _i++) {
                var pos = selectRewardPlayerBtns_1[_i];
                var rgb = getImageColor(image, pos.x, pos.y);
                var k = rgb.r + '-' + rgb.g + '-' + rgb.b;
                console.log(pos.x, pos.y, k);
                // select if not in basic type
                var rank = (_a = playerCardColorToRank[k]) !== null && _a !== void 0 ? _a : 5;
                if (rank > bestCardRank) {
                    bestCardRank = rank;
                    bestCardPos = pos;
                }
            }
            modules_1.rerouter.screen.tap(bestCardPos);
            console.log('select', bestCardPos.x, bestCardPos.y);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
            modules_1.rerouter.goNext(selectRewardPlayer);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
        },
    });
    // other
    modules_1.rerouter.addRoute({
        path: "/".concat(endSeasonProceed.name),
        match: endSeasonProceed,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handle end season proceed');
            if (modules_1.Config.config.isDev) {
                console.log('dev not do thing for debug');
                return;
            }
            modules_1.rerouter.screen.tap({ x: 182, y: 178 }); // tap new season of left
            // will go to endSeasonProceedSelected
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(mvp.name),
        match: mvp,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            console.log('handleMvpPage');
            var okBtn = { x: 568, y: 320, r: 52, g: 120, b: 210 };
            var isOkBtnOnScreen = modules_1.rerouter.screen.isSameColor(okBtn);
            // ok button still on the screen
            for (var maxOkButtonRemain = 10; isOkBtnOnScreen && maxOkButtonRemain > 0; maxOkButtonRemain--) {
                modules_1.rerouter.goNext(mvp); // ok
                Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
                isOkBtnOnScreen = modules_1.rerouter.screen.isSameColor(okBtn);
            }
            // reward bonus player popup
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            modules_1.rerouter.screen.tap({ x: 322, y: 309 }); // click next
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
        },
    });
    [
        playerRecommendation,
        newSeason,
        endSeasonProceedSelected,
        selectNormalMasterLeagueModeProceed,
        gameLineUp,
        playerGrowthComplete,
        pitcherOfTheMonth,
        gameResultWorldChampion,
        gameReward,
        leagueRewardAchievementGrade,
        leagueRewardAchievementGradeBonusPlayer,
        bestPositionAwardBonusGroup,
        bonusGrantedByTeamRecordOld,
        postSeasonAwardBonus,
        leagueOnPlayNextBatter,
        mvpDisplay,
        bonusGrantedByTeamRecord,
    ].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
        });
    });
}
exports.addRoutes = addRoutes;
function handleSelectYear(_a) {
    var prevYear = _a.prevYear, nextYear = _a.nextYear, activeBtnColor = _a.activeBtnColor, submit = _a.submit;
    // TODO: add select master/ normal if needed
    // go to the min year
    var activeButton = __assign(__assign({}, prevYear), activeBtnColor);
    var isNotMinYear = modules_1.rerouter.screen.isSameColor(activeButton);
    for (var remainClick = 12; remainClick > 0 && isNotMinYear; remainClick--) {
        modules_1.rerouter.screen.tap(prevYear);
        Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
        isNotMinYear = modules_1.rerouter.screen.isSameColor(activeButton);
    }
    // check the diff, return to prev year
    for (var yearDiff = modules_1.Config.config.leagueYear - CONSTANTS.leagueYearMin; yearDiff > 0; yearDiff--) {
        modules_1.rerouter.screen.tap(nextYear);
        Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
    }
    // submit changes
    modules_1.rerouter.screen.tap(submit);
    Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
    console.log("set league year to ".concat(modules_1.Config.config.leagueYear, " done"));
}
// * LeagueModes
var leagueModePanel = new Rerouter_1.Page('leagueModePanel', [
    // navi bar
    { x: 300, y: 12, r: 214, g: 214, b: 214 },
    { x: 316, y: 9, r: 238, g: 234, b: 238 },
    { x: 320, y: 15, r: 144, g: 148, b: 149 },
    { x: 388, y: 10, r: 238, g: 234, b: 238 },
    { x: 385, y: 9, r: 64, g: 67, b: 71 },
    { x: 493, y: 11, r: 244, g: 204, b: 39 },
    // some people is + some is 🔍
    // { x: 571, y: 14, r: 147, g: 161, b: 171 },
    { x: 606, y: 14, r: 74, g: 93, b: 123 },
    { x: 631, y: 15, r: 214, g: 219, b: 214 },
    // btn in bottom
    // { x: 85, y: 326, r: 234, g: 238, b: 238 },
    // { x: 112, y: 327, r: 214, g: 231, b: 238 },
    // { x: 163, y: 326, r: 222, g: 225, b: 227 },
    // { x: 198, y: 327, r: 80, g: 117, b: 159 },
    { x: 251, y: 324, r: 255, g: 255, b: 255 },
    { x: 278, y: 330, r: 189, g: 206, b: 219 },
], { x: 616, y: 336 }, { x: 41, y: 320 });
var leagueModeGameInfo = new Rerouter_1.Page('leagueModeGameInfo', [
    { x: 292, y: 9, r: 214, g: 213, b: 214 },
    { x: 314, y: 7, r: 255, g: 251, b: 255 },
    { x: 379, y: 3, r: 214, g: 215, b: 214 },
    { x: 389, y: 10, r: 239, g: 236, b: 239 },
    { x: 482, y: 3, r: 214, g: 218, b: 220 },
    { x: 493, y: 9, r: 255, g: 246, b: 192 },
    { x: 589, y: 11, r: 74, g: 93, b: 123 },
    { x: 596, y: 11, r: 81, g: 104, b: 131 },
    { x: 624, y: 12, r: 214, g: 211, b: 214 },
    { x: 26, y: 312, r: 209, g: 214, b: 209 },
    { x: 631, y: 56, r: 206, g: 207, b: 214 },
    { x: 631, y: 70, r: 168, g: 177, b: 193 },
    { x: 623, y: 64, r: 33, g: 125, b: 255 },
    { x: 270, y: 179, r: 206, g: 211, b: 222 },
    { x: 256, y: 214, r: 206, g: 211, b: 222 },
    { x: 242, y: 242, r: 206, g: 211, b: 222 },
    { x: 612, y: 281, r: 24, g: 36, b: 49 },
], { x: 546, y: 325 }, // playBall
{ x: 41, y: 320 });
var playerRecommendation = new Rerouter_1.Page('playerRecommendation', [
    { x: 80, y: 21, r: 8, g: 89, b: 164 },
    { x: 311, y: 53, r: 94, g: 135, b: 173 },
    { x: 382, y: 52, r: 152, g: 177, b: 200 },
    { x: 555, y: 12, r: 135, g: 179, b: 220 },
    { x: 609, y: 13, r: 0, g: 28, b: 66 },
    { x: 616, y: 15, r: 247, g: 248, b: 249 },
    { x: 629, y: 9, r: 189, g: 12, b: 58 },
    { x: 395, y: 52, r: 180, g: 200, b: 219 },
    { x: 350, y: 51, r: 155, g: 182, b: 201 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
// normal game play start
var selectPlayRoleBtns = {
    playOffenseOnly: { x: 128, y: 279 },
    playAll: { x: 317, y: 282 },
    playDeffenseOnly: { x: 506, y: 281 },
};
var selectPlayRoleCommon = [
    // play all 's play
    { x: 309, y: 299, r: 255, g: 255, b: 255 },
    { x: 309, y: 300, r: 255, g: 255, b: 255 },
    { x: 309, y: 301, r: 255, g: 255, b: 255 },
    { x: 309, y: 302, r: 255, g: 255, b: 255 },
    { x: 309, y: 303, r: 255, g: 255, b: 255 },
    { x: 309, y: 304, r: 255, g: 255, b: 255 },
    { x: 309, y: 305, r: 255, g: 255, b: 255 },
    { x: 309, y: 306, r: 255, g: 255, b: 255 },
    { x: 309, y: 307, r: 255, g: 255, b: 255 },
    { x: 324, y: 305, r: 255, g: 255, b: 255 },
    { x: 326, y: 298, r: 255, g: 255, b: 255 },
    { x: 326, y: 299, r: 255, g: 255, b: 255 },
    { x: 333, y: 302, r: 255, g: 255, b: 255 },
    { x: 343, y: 305, r: 255, g: 255, b: 255 },
    { x: 345, y: 298, r: 255, g: 255, b: 255 },
    { x: 345, y: 299, r: 255, g: 255, b: 255 },
    { x: 351, y: 298, r: 255, g: 255, b: 255 },
    { x: 351, y: 299, r: 255, g: 255, b: 255 },
    { x: 351, y: 300, r: 255, g: 255, b: 255 },
    { x: 351, y: 301, r: 255, g: 255, b: 255 },
    { x: 351, y: 302, r: 255, g: 255, b: 255 },
    { x: 351, y: 303, r: 255, g: 255, b: 255 },
    { x: 351, y: 304, r: 255, g: 255, b: 255 },
    { x: 351, y: 305, r: 255, g: 255, b: 255 },
    { x: 351, y: 306, r: 255, g: 255, b: 255 },
    { x: 351, y: 307, r: 255, g: 255, b: 255 },
    { x: 357, y: 298, r: 255, g: 255, b: 255 },
    { x: 357, y: 299, r: 255, g: 255, b: 255 },
    { x: 357, y: 300, r: 255, g: 255, b: 255 },
    { x: 357, y: 301, r: 255, g: 255, b: 255 },
    { x: 357, y: 302, r: 255, g: 255, b: 255 },
    { x: 357, y: 303, r: 255, g: 255, b: 255 },
    { x: 357, y: 304, r: 255, g: 255, b: 255 },
    { x: 357, y: 305, r: 255, g: 255, b: 255 },
    { x: 357, y: 306, r: 255, g: 255, b: 255 },
    { x: 357, y: 307, r: 255, g: 255, b: 255 },
    // play defense only icon
    { x: 424, y: 300, r: 255, g: 255, b: 255 },
    { x: 424, y: 301, r: 255, g: 255, b: 255 },
    { x: 424, y: 302, r: 255, g: 255, b: 255 },
    { x: 425, y: 301, r: 255, g: 255, b: 255 },
    { x: 425, y: 302, r: 255, g: 255, b: 255 },
    { x: 425, y: 303, r: 255, g: 255, b: 255 },
    { x: 425, y: 304, r: 255, g: 255, b: 255 },
    { x: 426, y: 303, r: 255, g: 255, b: 255 },
    { x: 426, y: 304, r: 255, g: 255, b: 255 },
    { x: 426, y: 305, r: 255, g: 255, b: 255 },
    { x: 427, y: 307, r: 255, g: 255, b: 255 },
    { x: 429, y: 309, r: 255, g: 255, b: 255 },
    { x: 429, y: 310, r: 255, g: 255, b: 255 },
    { x: 430, y: 310, r: 255, g: 255, b: 255 },
    { x: 431, y: 310, r: 255, g: 255, b: 255 },
    { x: 431, y: 311, r: 255, g: 255, b: 255 },
    { x: 432, y: 306, r: 255, g: 255, b: 255 },
    { x: 432, y: 310, r: 255, g: 255, b: 255 },
    { x: 432, y: 311, r: 255, g: 255, b: 255 },
    { x: 432, y: 312, r: 255, g: 255, b: 255 },
    { x: 433, y: 296, r: 255, g: 255, b: 255 },
    { x: 433, y: 300, r: 255, g: 255, b: 255 },
    { x: 433, y: 301, r: 255, g: 255, b: 255 },
    { x: 433, y: 305, r: 255, g: 255, b: 255 },
    { x: 433, y: 306, r: 255, g: 255, b: 255 },
    { x: 433, y: 310, r: 255, g: 255, b: 255 },
    { x: 433, y: 311, r: 255, g: 255, b: 255 },
    { x: 433, y: 312, r: 255, g: 255, b: 255 },
    { x: 434, y: 310, r: 255, g: 255, b: 255 },
    { x: 434, y: 311, r: 255, g: 255, b: 255 },
    { x: 434, y: 312, r: 255, g: 255, b: 255 },
    { x: 435, y: 310, r: 255, g: 255, b: 255 },
    { x: 435, y: 311, r: 255, g: 255, b: 255 },
    { x: 435, y: 312, r: 255, g: 255, b: 255 },
    { x: 436, y: 303, r: 255, g: 255, b: 255 },
    { x: 436, y: 310, r: 255, g: 255, b: 255 },
    { x: 436, y: 311, r: 255, g: 255, b: 255 },
    { x: 437, y: 309, r: 255, g: 255, b: 255 },
    { x: 437, y: 310, r: 255, g: 255, b: 255 },
    { x: 437, y: 311, r: 255, g: 255, b: 255 },
    { x: 438, y: 308, r: 255, g: 255, b: 255 },
    { x: 438, y: 309, r: 255, g: 255, b: 255 },
    { x: 438, y: 310, r: 255, g: 255, b: 255 },
    { x: 439, y: 307, r: 255, g: 255, b: 255 },
    { x: 439, y: 308, r: 255, g: 255, b: 255 },
    { x: 439, y: 309, r: 255, g: 255, b: 255 },
    { x: 440, y: 301, r: 255, g: 255, b: 255 },
    { x: 440, y: 302, r: 255, g: 255, b: 255 },
    { x: 440, y: 303, r: 255, g: 255, b: 255 },
    { x: 440, y: 304, r: 255, g: 255, b: 255 },
    { x: 440, y: 305, r: 255, g: 255, b: 255 },
    { x: 440, y: 306, r: 255, g: 255, b: 255 },
    { x: 440, y: 307, r: 255, g: 255, b: 255 },
    { x: 441, y: 300, r: 255, g: 255, b: 255 },
    { x: 441, y: 301, r: 255, g: 255, b: 255 },
    { x: 441, y: 302, r: 255, g: 255, b: 255 },
    { x: 441, y: 303, r: 255, g: 255, b: 255 },
    { x: 441, y: 304, r: 255, g: 255, b: 255 },
];
var selectPlayRoleSands = new Rerouter_1.Page('selectPlayRoleSands', __spreadArray(__spreadArray([], selectPlayRoleCommon, true), [
    // sands in left
    { x: 28, y: 334, r: 165, g: 118, b: 91 },
    // sands in right
    { x: 618, y: 299, r: 165, g: 118, b: 91 },
], false));
var selectPlayRoleGrass = new Rerouter_1.Page('selectPlayRoleGrass', __spreadArray(__spreadArray([], selectPlayRoleCommon, true), [
    // grass in left
    { x: 25, y: 321, r: 109, g: 132, b: 83 },
    // grass in right
    { x: 611, y: 311, r: 109, g: 132, b: 83 },
], false));
var selectPlayRoleGroups = new Rerouter_1.GroupPage('selectPlayRoleGroups', [selectPlayRoleSands, selectPlayRoleGrass], selectPlayRoleBtns.playAll, selectPlayRoleBtns.playAll);
// sometimes happened when restarting a continued game
// or cancel auto play during playing
var leagueOnPlayNextBatter = new Rerouter_1.Page('leagueOnPlayNextBatter', [
    // next batter bg
    { x: 1, y: 304, r: 247, g: 246, b: 247 },
    { x: 1, y: 349, r: 247, g: 247, b: 247 },
    { x: 100, y: 346, r: 247, g: 247, b: 247 },
    { x: 98, y: 304, r: 247, g: 247, b: 247 },
    // fast processing btn
    { x: 515, y: 308, r: 15, g: 121, b: 248 },
    { x: 539, y: 310, r: 254, g: 254, b: 255 },
    { x: 562, y: 310, r: 185, g: 208, b: 242 },
    { x: 580, y: 313, r: 26, g: 111, b: 229 },
    { x: 597, y: 313, r: 11, g: 110, b: 244 },
    { x: 611, y: 314, r: 255, g: 255, b: 255 },
    { x: 621, y: 314, r: 8, g: 109, b: 247 },
    // continue playing btn
    { x: 513, y: 341, r: 8, g: 109, b: 247 },
    { x: 527, y: 343, r: 158, g: 194, b: 254 },
    { x: 565, y: 335, r: 8, g: 125, b: 255 },
    { x: 584, y: 339, r: 8, g: 117, b: 255 },
    { x: 603, y: 337, r: 20, g: 127, b: 255 },
    { x: 620, y: 340, r: 8, g: 114, b: 247 },
], { x: 620, y: 338 }, // continue playing
{ x: 620, y: 338 });
// auto play on, power save off
var leagueOnPlayPowerSaveOff = new Rerouter_1.Page('leagueOnPlayPowerSaveOff', [
    // battery
    { x: 486, y: 13, r: 255, g: 255, b: 255 },
    { x: 492, y: 16, r: 101, g: 103, b: 101 },
    { x: 488, y: 22, r: 210, g: 208, b: 210 },
    { x: 481, y: 27, r: 102, g: 101, b: 101 },
    { x: 489, y: 29, r: 197, g: 197, b: 197 },
], { x: 485, y: 21 }, // turn on power save
{ x: 552, y: 21 } // turn off auto play
);
// same as gLeagueOnPlayPowerSaveOff, but is stopped
// need to turn on autoplay
var leagueOnPlayPowerSaveOffStopped = new Rerouter_1.Page('leagueOnPlayPowerSaveOff', [
    // battery
    { x: 486, y: 13, r: 255, g: 255, b: 255 },
    { x: 492, y: 16, r: 101, g: 103, b: 101 },
    { x: 488, y: 22, r: 210, g: 208, b: 210 },
    { x: 481, y: 27, r: 102, g: 101, b: 101 },
    { x: 489, y: 29, r: 197, g: 197, b: 197 },
    // disabled autoplay text
    { x: 524, y: 23, r: 91, g: 110, b: 158 },
    { x: 530, y: 20, r: 140, g: 146, b: 152 },
    { x: 533, y: 24, r: 93, g: 106, b: 143 },
    { x: 550, y: 25, r: 85, g: 105, b: 153 },
    { x: 552, y: 21, r: 147, g: 153, b: 156 },
    { x: 557, y: 20, r: 148, g: 154, b: 156 },
    { x: 566, y: 24, r: 99, g: 121, b: 173 },
    { x: 575, y: 18, r: 107, g: 121, b: 173 },
    { x: 584, y: 19, r: 97, g: 122, b: 169 },
    { x: 589, y: 22, r: 118, g: 127, b: 149 },
    { x: 595, y: 18, r: 141, g: 150, b: 156 },
    { x: 606, y: 23, r: 74, g: 93, b: 132 },
], { x: 0, y: 0 }, // turn on auto play
{ x: 0, y: 0 } // turn on auto play
);
// don't do any thing, just avoid to enter unknown
var leagueOnPlayPowerSaveOffMid = new Rerouter_1.Page('leagueOnPlayPowerSaveOff', [
    // battery
    { x: 486, y: 13, r: 255, g: 255, b: 255 },
    // dialog on
    { x: 604, y: 47, r: 170, g: 171, b: 170 },
    { x: 607, y: 49, r: 246, g: 246, b: 246 },
    { x: 611, y: 54, r: 213, g: 210, b: 213 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
var leagueOnPlayPowerSaveOffMid1 = new Rerouter_1.Page('leagueOnPlayPowerSaveOff', [
    // battery
    { x: 486, y: 13, r: 255, g: 255, b: 255 },
    // dialog off
    { x: 605, y: 50, r: 95, g: 99, b: 97 },
    { x: 602, y: 51, r: 109, g: 114, b: 116 },
    { x: 603, y: 49, r: 131, g: 133, b: 131 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
var leagueOnPlayPowerSaveOffGroups = new Rerouter_1.GroupPage('leagueOnPlayPowerSaveOffGroup', [
    leagueOnPlayPowerSaveOff,
    leagueOnPlayPowerSaveOffStopped,
    leagueOnPlayPowerSaveOffMid,
    leagueOnPlayPowerSaveOffMid1,
]);
// when playing, press back
// TODO: update photo in chart
var leagueOnPlayPause = new Rerouter_1.Page('leagueOnPlayPause', [
    // continue button
    { x: 85, y: 146, r: 255, g: 255, b: 255 },
    { x: 100, y: 164, r: 255, g: 255, b: 255 },
    { x: 96, y: 138, r: 82, g: 97, b: 107 },
    // mlb logo
    { x: 569, y: 287, r: 166, g: 29, b: 69 },
    { x: 563, y: 292, r: 255, g: 255, b: 255 },
    { x: 553, y: 291, r: 35, g: 59, b: 92 },
    // p bg
    { x: 563, y: 336, r: 25, g: 45, b: 58 },
], { x: 92, y: 155 }, // continue game
{ x: 531, y: 155 } // leave
);
var gameResultWorldChampion = new Rerouter_1.Page('gameResultWorldChampion', [
    { x: 252, y: 22, r: 57, g: 67, b: 74 },
    { x: 323, y: 42, r: 116, g: 109, b: 83 },
    { x: 350, y: 73, r: 66, g: 91, b: 96 },
    { x: 49, y: 331, r: 16, g: 32, b: 41 },
    { x: 209, y: 322, r: 8, g: 20, b: 24 },
    { x: 294, y: 326, r: 208, g: 208, b: 212 },
    { x: 400, y: 323, r: 192, g: 190, b: 192 },
    { x: 439, y: 323, r: 85, g: 98, b: 100 },
    { x: 578, y: 195, r: 16, g: 36, b: 41 },
    { x: 316, y: 167, r: 212, g: 210, b: 212 },
    { x: 338, y: 173, r: 65, g: 71, b: 71 },
], { x: 0, y: 0 }, { x: 0, y: 0 });
// TODO update photo
var gameReward = new Rerouter_1.Page('gameReward', [
    { x: 24, y: 336, r: 16, g: 32, b: 41 },
    { x: 577, y: 26, r: 0, g: 4, b: 0 },
    { x: 601, y: 335, r: 16, g: 32, b: 41 },
    { x: 411, y: 268, r: 8, g: 114, b: 255 },
    { x: 434, y: 270, r: 66, g: 144, b: 252 },
    { x: 487, y: 274, r: 0, g: 102, b: 247 },
    { x: 497, y: 122, r: 255, g: 255, b: 255 },
    { x: 461, y: 193, r: 42, g: 58, b: 58 },
], { x: 412, y: 271 }, { x: 412, y: 271 });
var bestPositionAwardBonus = new Rerouter_1.Page('bestPositionAwardBonus', [
    // bg
    { x: 141, y: 21, r: 0, g: 81, b: 148 },
    { x: 609, y: 26, r: 0, g: 81, b: 148 },
    { x: 26, y: 335, r: 16, g: 24, b: 24 },
    { x: 626, y: 339, r: 16, g: 24, b: 24 },
    { x: 4, y: 148, r: 8, g: 24, b: 33 },
    { x: 628, y: 140, r: 16, g: 32, b: 49 },
    // team 1 being selected
    { x: 173, y: 18, r: 0, g: 117, b: 255 },
    { x: 176, y: 30, r: 158, g: 173, b: 199 },
    { x: 184, y: 36, r: 8, g: 105, b: 255 },
    // team 2 not being selected
    { x: 328, y: 27, r: 49, g: 85, b: 123 },
    { x: 337, y: 31, r: 16, g: 48, b: 82 },
    { x: 343, y: 37, r: 41, g: 77, b: 115 },
    // ok
    { x: 547, y: 320, r: 0, g: 113, b: 248 },
    { x: 566, y: 321, r: 255, g: 255, b: 255 },
    { x: 577, y: 324, r: 228, g: 239, b: 248 },
    { x: 605, y: 325, r: 8, g: 109, b: 247 },
    { x: 611, y: 316, r: 0, g: 117, b: 255 },
], { x: 570, y: 325 }, { x: 570, y: 325 });
var bestPositionAwardBonus2 = new Rerouter_1.Page('bestPositionAwardBonus', [
    // bg
    { x: 141, y: 21, r: 0, g: 81, b: 148 },
    { x: 609, y: 26, r: 0, g: 81, b: 148 },
    { x: 26, y: 335, r: 16, g: 24, b: 24 },
    { x: 626, y: 339, r: 16, g: 24, b: 24 },
    { x: 4, y: 148, r: 8, g: 24, b: 33 },
    { x: 628, y: 140, r: 16, g: 32, b: 49 },
    // team 1 not being selected
    { x: 189, y: 22, r: 49, g: 85, b: 123 },
    { x: 178, y: 34, r: 8, g: 48, b: 82 },
    { x: 169, y: 39, r: 41, g: 77, b: 115 },
    // team 2 being selected
    { x: 343, y: 21, r: 2, g: 117, b: 255 },
    { x: 337, y: 31, r: 163, g: 170, b: 197 },
    { x: 331, y: 40, r: 8, g: 97, b: 255 },
    // ok
    { x: 547, y: 320, r: 0, g: 113, b: 248 },
    { x: 566, y: 321, r: 255, g: 255, b: 255 },
    { x: 577, y: 324, r: 228, g: 239, b: 248 },
    { x: 605, y: 325, r: 8, g: 109, b: 247 },
    { x: 611, y: 316, r: 0, g: 117, b: 255 },
], { x: 570, y: 325 }, { x: 570, y: 325 });
// seems not used anymore
var bestPositionAwardBonusGroup = new Rerouter_1.GroupPage('bestPositionAwardBonus', [bestPositionAwardBonus, bestPositionAwardBonus2], bestPositionAwardBonus.next /* next */);
// seems not used anymore
// next page of gBestPositionAwardBonus
var bonusGrantedByTeamRecordOld = new Rerouter_1.Page('bonusGrantedByTeamRecordOld', [
    // table bg
    { x: 38, y: 75, r: 49, g: 69, b: 107 },
    { x: 600, y: 73, r: 49, g: 69, b: 107 },
    { x: 601, y: 289, r: 0, g: 8, b: 16 },
    { x: 28, y: 285, r: 8, g: 12, b: 16 },
    // title
    { x: 176, y: 76, r: 49, g: 68, b: 107 },
    { x: 217, y: 77, r: 128, g: 136, b: 159 },
    { x: 255, y: 76, r: 131, g: 137, b: 157 },
    { x: 278, y: 76, r: 78, g: 95, b: 128 },
    { x: 324, y: 77, r: 113, g: 122, b: 150 },
    { x: 362, y: 75, r: 46, g: 66, b: 104 },
    { x: 405, y: 77, r: 178, g: 185, b: 206 },
    { x: 425, y: 72, r: 184, g: 187, b: 206 },
    { x: 439, y: 77, r: 53, g: 70, b: 110 },
    // ok
    { x: 547, y: 320, r: 0, g: 113, b: 248 },
    { x: 566, y: 321, r: 255, g: 255, b: 255 },
    { x: 577, y: 324, r: 228, g: 239, b: 248 },
    { x: 605, y: 325, r: 8, g: 109, b: 247 },
    { x: 611, y: 316, r: 0, g: 117, b: 255 },
], { x: 570, y: 325 }, { x: 570, y: 325 });
var postSeasonAwardBonus = new Rerouter_1.Page('postSeasonAwardBonus', [
    // bg
    { x: 39, y: 24, r: 0, g: 81, b: 148 },
    { x: 320, y: 15, r: 0, g: 85, b: 165 },
    { x: 615, y: 23, r: 0, g: 81, b: 148 },
    { x: 11, y: 268, r: 16, g: 28, b: 33 },
    { x: 621, y: 258, r: 16, g: 28, b: 33 },
    { x: 624, y: 351, r: 16, g: 24, b: 24 },
    { x: 17, y: 338, r: 16, g: 24, b: 24 },
    { x: 316, y: 342, r: 16, g: 24, b: 24 },
    // ok
    { x: 531, y: 318, r: 0, g: 117, b: 255 },
    { x: 564, y: 323, r: 218, g: 234, b: 254 },
    { x: 577, y: 323, r: 255, g: 255, b: 255 },
    { x: 608, y: 318, r: 0, g: 117, b: 255 },
    { x: 606, y: 331, r: 8, g: 105, b: 255 },
], { x: 570, y: 325 }, { x: 570, y: 325 });
var gameLineUp = new Rerouter_1.Page('gameLineUp', [
    // content top bg
    { x: 591, y: 59, r: 49, g: 73, b: 107 },
    // progress bg
    { x: 19, y: 211, r: 24, g: 32, b: 49 },
    // battle lineup button in bottom
    { x: 536, y: 322, r: 41, g: 81, b: 137 },
    { x: 553, y: 322, r: 188, g: 209, b: 224 },
    { x: 568, y: 322, r: 204, g: 220, b: 234 },
    { x: 585, y: 324, r: 107, g: 139, b: 177 },
    { x: 604, y: 324, r: 25, g: 73, b: 132 },
    // back
    { x: 26, y: 314, r: 214, g: 219, b: 214 },
    { x: 43, y: 321, r: 214, g: 219, b: 214 },
    { x: 36, y: 329, r: 211, g: 216, b: 210 },
], { x: 40, y: 324 }, { x: 40, y: 324 });
var playerGrowthComplete = new Rerouter_1.Page('playerGrowthComplete', [
    // bg
    { x: 115, y: 47, r: 181, g: 186, b: 189 },
    { x: 114, y: 300, r: 214, g: 219, b: 222 },
    { x: 514, y: 301, r: 214, g: 219, b: 222 },
    { x: 522, y: 74, r: 181, g: 186, b: 189 },
    { x: 110, y: 169, r: 206, g: 210, b: 214 },
    { x: 110, y: 230, r: 181, g: 186, b: 189 },
    { x: 522, y: 156, r: 206, g: 210, b: 214 },
    { x: 513, y: 230, r: 181, g: 186, b: 189 },
    // continue
    { x: 240, y: 300, r: 8, g: 114, b: 248 },
    { x: 312, y: 301, r: 223, g: 233, b: 247 },
    { x: 337, y: 306, r: 255, g: 255, b: 255 },
    { x: 399, y: 302, r: 8, g: 110, b: 247 },
], { x: 325, y: 304 }, { x: 325, y: 304 });
var leagueRewardAchievementGrade = new Rerouter_1.Page('leagueRewardAchievementGrade', [
    // title bg & x
    { x: 20, y: 34, r: 222, g: 219, b: 222 },
    { x: 20, y: 63, r: 222, g: 219, b: 222 },
    { x: 600, y: 36, r: 212, g: 209, b: 212 },
    { x: 611, y: 56, r: 222, g: 218, b: 222 },
    { x: 442, y: 67, r: 222, g: 219, b: 222 },
    // progress bar bg
    { x: 16, y: 79, r: 0, g: 49, b: 90 },
    { x: 18, y: 193, r: 0, g: 49, b: 90 },
    { x: 616, y: 199, r: 16, g: 65, b: 115 },
    // bg in bottom
    { x: 618, y: 215, r: 33, g: 32, b: 41 },
    { x: 613, y: 326, r: 41, g: 45, b: 49 },
], { x: 600, y: 45 }, { x: 600, y: 45 });
// r
var leagueRewardAchievementGradeBonusPlayer = new Rerouter_1.Page('leagueRewardAchievementGradeBonusPlayer', [
    // title and x
    { x: 173, y: 58, r: 147, g: 153, b: 156 },
    { x: 229, y: 58, r: 79, g: 82, b: 82 },
    { x: 320, y: 60, r: 160, g: 163, b: 164 },
    { x: 373, y: 55, r: 177, g: 184, b: 185 },
    { x: 443, y: 60, r: 101, g: 105, b: 110 },
    { x: 521, y: 51, r: 66, g: 69, b: 66 },
    // logo on center
    { x: 290, y: 132, r: 8, g: 28, b: 66 },
    { x: 325, y: 150, r: 255, g: 255, b: 255 },
    { x: 357, y: 133, r: 189, g: 0, b: 33 },
    // next
    { x: 281, y: 298, r: 8, g: 117, b: 255 },
    { x: 323, y: 299, r: 220, g: 234, b: 250 },
    { x: 365, y: 307, r: 8, g: 101, b: 247 },
    { x: 307, y: 301, r: 250, g: 252, b: 254 },
    { x: 329, y: 297, r: 252, g: 253, b: 255 },
], { x: 320, y: 300 }, { x: 320, y: 300 });
var pitcherOfTheMonth = new Rerouter_1.Page('pitcherOfTheMonth', [
    { x: 27, y: 38, r: 181, g: 186, b: 198 },
    { x: 602, y: 46, r: 154, g: 152, b: 155 },
    { x: 535, y: 309, r: 139, g: 188, b: 255 },
    { x: 605, y: 316, r: 0, g: 97, b: 247 },
    { x: 391, y: 309, r: 222, g: 219, b: 222 },
], { x: 545, y: 310 }, { x: 545, y: 310 });
// like mvp, but no need to do anything
var mvpDisplay1 = new Rerouter_1.Page('mvpDisplay1', [
    // bg
    { x: 541, y: 24, r: 2, g: 89, b: 164 },
    { x: 610, y: 22, r: 8, g: 89, b: 164 },
    { x: 43, y: 311, r: 16, g: 20, b: 16 },
    { x: 262, y: 331, r: 16, g: 16, b: 8 },
    // ok
    { x: 544, y: 319, r: 0, g: 117, b: 247 },
    { x: 572, y: 326, r: 10, g: 109, b: 243 },
    { x: 580, y: 324, r: 25, g: 119, b: 239 },
    { x: 600, y: 329, r: 8, g: 105, b: 247 },
    // blue btn left,
    { x: 171, y: 23, r: 0, g: 117, b: 247 },
    { x: 178, y: 29, r: 172, g: 182, b: 205 },
    // grey btn right
    { x: 329, y: 23, r: 49, g: 85, b: 123 },
    { x: 339, y: 31, r: 16, g: 49, b: 90 },
], { x: 571, y: 323 }, // ok
{ x: 571, y: 323 });
var mvpDisplay2 = new Rerouter_1.Page('mvpDisplay2', [
    // bg
    { x: 541, y: 24, r: 2, g: 89, b: 164 },
    { x: 610, y: 22, r: 8, g: 89, b: 164 },
    { x: 43, y: 311, r: 16, g: 20, b: 16 },
    { x: 262, y: 331, r: 16, g: 16, b: 8 },
    // ok
    { x: 544, y: 319, r: 0, g: 117, b: 247 },
    { x: 572, y: 326, r: 10, g: 109, b: 243 },
    { x: 580, y: 324, r: 25, g: 119, b: 239 },
    { x: 600, y: 329, r: 8, g: 105, b: 247 },
    // blue btn right
    { x: 338, y: 18, r: 0, g: 117, b: 247 },
    { x: 338, y: 33, r: 78, g: 97, b: 144 },
    // grey btn left,
    { x: 174, y: 20, r: 49, g: 89, b: 123 },
    { x: 182, y: 29, r: 16, g: 53, b: 90 },
], { x: 571, y: 323 }, // ok
{ x: 571, y: 323 });
var mvpDisplay = new Rerouter_1.GroupPage('mvpDisplay', [mvpDisplay1, mvpDisplay2], mvpDisplay1.next);
var bonusGrantedByTeamRecord = new Rerouter_1.Page('bonusGrantedByTeamRecord', [
    // table bg
    { x: 34, y: 71, r: 49, g: 69, b: 107 },
    { x: 33, y: 288, r: 8, g: 12, b: 16 },
    { x: 602, y: 290, r: 8, g: 12, b: 16 },
    { x: 601, y: 66, r: 49, g: 69, b: 107 },
    // title
    { x: 202, y: 72, r: 189, g: 195, b: 209 },
    { x: 256, y: 71, r: 188, g: 193, b: 211 },
    { x: 315, y: 71, r: 49, g: 69, b: 107 },
    { x: 420, y: 72, r: 168, g: 178, b: 193 },
    { x: 441, y: 72, r: 168, g: 174, b: 192 },
    // ok
    { x: 541, y: 320, r: 0, g: 114, b: 247 },
    { x: 569, y: 322, r: 255, g: 255, b: 255 },
    { x: 581, y: 322, r: 8, g: 113, b: 247 },
], { x: 566, y: 319 }, // ok
{ x: 566, y: 319 });
var mvp = new Rerouter_1.Page('mvp', [
    { x: 273, y: 23, r: 0, g: 89, b: 165 },
    { x: 297, y: 25, r: 90, g: 145, b: 200 },
    { x: 320, y: 25, r: 255, g: 255, b: 255 },
    { x: 332, y: 29, r: 126, g: 169, b: 204 },
    { x: 380, y: 53, r: 0, g: 65, b: 122 },
    { x: 493, y: 322, r: 16, g: 20, b: 8 },
    { x: 568, y: 320, r: 38, g: 120, b: 218 },
    { x: 635, y: 341, r: 8, g: 16, b: 8 },
    { x: 620, y: 164, r: 0, g: 8, b: 8 },
    { x: 9, y: 176, r: 12, g: 24, b: 24 },
], { x: 568, y: 320 }, { x: 568, y: 320 });
var selectRewardPlayer = new Rerouter_1.Page('selectRewardPlayer', [
    // bg
    { x: 4, y: 6, r: 0, g: 97, b: 189 },
    { x: 11, y: 346, r: 16, g: 16, b: 8 },
    { x: 7, y: 350, r: 16, g: 20, b: 16 },
    // form bg in bottom
    { x: 65, y: 301, r: 66, g: 77, b: 66 },
    { x: 65, y: 326, r: 40, g: 45, b: 33 },
    { x: 175, y: 303, r: 66, g: 77, b: 58 },
    { x: 174, y: 328, r: 41, g: 45, b: 33 },
    { x: 275, y: 304, r: 66, g: 73, b: 58 },
    { x: 275, y: 324, r: 41, g: 48, b: 33 },
    { x: 384, y: 301, r: 66, g: 73, b: 58 },
    { x: 384, y: 321, r: 41, g: 45, b: 33 },
], { x: 568, y: 320 }, { x: 568, y: 320 });
var selectSeasonMode = new Rerouter_1.Page('selectSeasonMode', [
    { x: 104, y: 16, r: 0, g: 93, b: 173 },
    { x: 235, y: 37, r: 143, g: 181, b: 207 },
    { x: 309, y: 36, r: 145, g: 182, b: 209 },
    { x: 337, y: 38, r: 103, g: 149, b: 191 },
    { x: 376, y: 32, r: 245, g: 247, b: 253 },
    { x: 422, y: 36, r: 145, g: 177, b: 209 },
    { x: 40, y: 75, r: 181, g: 186, b: 189 },
    { x: 314, y: 183, r: 33, g: 36, b: 33 },
    { x: 341, y: 93, r: 41, g: 48, b: 49 },
    { x: 539, y: 323, r: 0, g: 69, b: 149 },
    { x: 553, y: 328, r: 0, g: 65, b: 148 },
], { x: 178, y: 183 }, { x: 178, y: 183 });
var selectLeagueGameAmount = new Rerouter_1.Page('selectLeagueGameAmount', [
    // title
    { x: 179, y: 60, r: 8, g: 65, b: 115 },
    { x: 195, y: 59, r: 52, g: 99, b: 141 },
    { x: 245, y: 56, r: 177, g: 198, b: 212 },
    { x: 361, y: 57, r: 5, g: 66, b: 115 },
    { x: 439, y: 56, r: 194, g: 208, b: 221 },
    { x: 483, y: 56, r: 0, g: 65, b: 115 },
    // amount title bg
    { x: 30, y: 104, r: 230, g: 227, b: 230 },
    { x: 70, y: 100, r: 228, g: 228, b: 228 },
    { x: 116, y: 100, r: 197, g: 198, b: 197 },
    { x: 209, y: 102, r: 41, g: 49, b: 58 },
    { x: 244, y: 102, r: 114, g: 121, b: 128 },
    { x: 276, y: 102, r: 44, g: 54, b: 66 },
    { x: 361, y: 98, r: 54, g: 60, b: 70 },
    { x: 409, y: 102, r: 74, g: 79, b: 87 },
    { x: 456, y: 99, r: 230, g: 231, b: 230 },
    { x: 496, y: 97, r: 230, g: 231, b: 230 },
    { x: 537, y: 101, r: 92, g: 98, b: 106 },
    { x: 582, y: 99, r: 200, g: 204, b: 207 },
    { x: 598, y: 99, r: 230, g: 231, b: 230 },
], { x: 39, y: 314 }, { x: 39, y: 314 });
var selectLeagueGameAmountBtns = {
    full: { x: 25, y: 285 },
    half: { x: 245, y: 285 },
    quarter: { x: 400, y: 112 },
    post: { x: 600, y: 112 },
};
var selectYear = new Rerouter_1.Page('selectYear', [
    // bg
    { x: 121, y: 25, r: 191, g: 199, b: 206 },
    { x: 116, y: 288, r: 239, g: 242, b: 239 },
    { x: 518, y: 35, r: 72, g: 75, b: 80 },
    { x: 517, y: 292, r: 239, g: 242, b: 239 },
    // cancel btn bg
    { x: 185, y: 282, r: 41, g: 75, b: 118 },
    // reset to year XX btn bg
    { x: 327, y: 297, r: 3, g: 79, b: 235 },
], { x: 371, y: 300 }, // reset to year XX
{ x: 193, y: 300 } // cancel
);
var selectYearBtns = {
    normal: { x: 247, y: 90 },
    master: { x: 402, y: 90 },
    prevYear: { x: 212, y: 145 },
    nextYear: { x: 425, y: 145 },
    submit: { x: 392, y: 289 },
};
// tell user the season start
var newSeason = new Rerouter_1.Page('newSeason', [
    // bg bottom
    { x: 53, y: 334, r: 16, g: 16, b: 8 },
    { x: 613, y: 334, r: 16, g: 20, b: 16 },
    // next or ok btn bg
    { x: 254, y: 292, r: 0, g: 117, b: 247 },
    { x: 255, y: 311, r: 8, g: 102, b: 247 },
    { x: 376, y: 292, r: 0, g: 117, b: 247 },
    { x: 376, y: 313, r: 16, g: 101, b: 254 },
    // logo in center right
    { x: 354, y: 147, r: 0, g: 28, b: 66 },
    { x: 374, y: 158, r: 255, g: 255, b: 255 },
    { x: 386, y: 149, r: 192, g: 20, b: 65 },
], { x: 324, y: 305 }, { x: 324, y: 305 });
// after endSeason, xx season is over
var endSeasonProceed = new Rerouter_1.Page('endSeasonProceed', [
    // how would you like to proceed with next season ?
    { x: 452, y: 38, r: 195, g: 213, b: 229 },
    { x: 508, y: 36, r: 8, g: 85, b: 148 },
    { x: 545, y: 34, r: 253, g: 253, b: 254 },
    { x: 566, y: 34, r: 43, g: 107, b: 167 },
    { x: 277, y: 34, r: 255, g: 255, b: 255 },
    { x: 568, y: 31, r: 219, g: 232, b: 237 },
    { x: 568, y: 38, r: 45, g: 107, b: 165 },
    { x: 553, y: 38, r: 30, g: 98, b: 160 },
    // bg corner
    { x: 8, y: 13, r: 0, g: 97, b: 181 },
    { x: 8, y: 343, r: 16, g: 16, b: 8 },
    { x: 625, y: 22, r: 0, g: 89, b: 164 },
    { x: 628, y: 350, r: 16, g: 20, b: 16 },
    // ok
    { x: 539, y: 325, r: 8, g: 113, b: 247 },
    { x: 558, y: 325, r: 255, g: 255, b: 255 },
    { x: 571, y: 325, r: 255, g: 255, b: 255 },
    { x: 606, y: 325, r: 8, g: 113, b: 247 },
], { x: 570, y: 325 }, { x: 570, y: 325 });
var endSeasonProceedSelected = new Rerouter_1.Page('endSeasonProceedSelected', [
    // bg corner
    { x: 8, y: 13, r: 0, g: 97, b: 181 },
    { x: 8, y: 343, r: 16, g: 16, b: 8 },
    { x: 625, y: 22, r: 0, g: 89, b: 164 },
    { x: 628, y: 350, r: 16, g: 20, b: 16 },
    // ok
    { x: 539, y: 325, r: 8, g: 113, b: 247 },
    { x: 558, y: 325, r: 255, g: 255, b: 255 },
    { x: 571, y: 325, r: 255, g: 255, b: 255 },
    { x: 606, y: 325, r: 8, g: 113, b: 247 },
], { x: 570, y: 325 }, { x: 570, y: 325 });
var selectNormalMasterLeagueMode = new Rerouter_1.Page('selectNormalMasterLeagueMode', [
    // bg
    { x: 14, y: 20, r: 8, g: 93, b: 173 },
    { x: 17, y: 328, r: 16, g: 20, b: 16 },
    { x: 622, y: 20, r: 8, g: 93, b: 172 },
    { x: 625, y: 272, r: 16, g: 20, b: 16 },
    // NORMAL LEAGUE in middle
    { x: 125, y: 168, r: 158, g: 183, b: 159 },
    { x: 248, y: 166, r: 41, g: 105, b: 25 },
    // left bg
    { x: 57, y: 90, r: 230, g: 231, b: 238 },
    { x: 55, y: 283, r: 230, g: 231, b: 230 },
    { x: 298, y: 283, r: 230, g: 231, b: 238 },
    { x: 294, y: 81, r: 230, g: 231, b: 238 },
    // left reward info bg
    { x: 128, y: 265, r: 8, g: 125, b: 255 },
    { x: 227, y: 281, r: 0, g: 89, b: 247 },
], { x: 565, y: 328 }, { x: 565, y: 328 });
var selectNormalMasterLeagueModeBtns = {
    normal: {
        x: 170,
        y: 160,
    },
    master: {
        x: 470,
        y: 160,
    },
};
var selectNormalMasterLeagueModeProceed = new Rerouter_1.Page('selectNormalMasterLeagueModeProceed', [
    // bg
    { x: 16, y: 19, r: 0, g: 93, b: 173 },
    { x: 19, y: 337, r: 16, g: 20, b: 16 },
    { x: 623, y: 22, r: 0, g: 89, b: 164 },
    { x: 619, y: 232, r: 16, g: 24, b: 16 },
    // ok
    { x: 535, y: 326, r: 8, g: 113, b: 247 },
    { x: 570, y: 330, r: 255, g: 255, b: 255 },
    { x: 605, y: 328, r: 8, g: 113, b: 247 },
], { x: 565, y: 328 }, { x: 565, y: 328 });
// a dialog to confirm league reset
var leagueResetDialogYN = new Rerouter_1.Page('leagueResetDialogYN', [
    { x: 115, y: 54, r: 181, g: 186, b: 189 },
    { x: 108, y: 305, r: 214, g: 219, b: 222 },
    { x: 508, y: 308, r: 214, g: 219, b: 222 },
    { x: 514, y: 50, r: 181, g: 182, b: 181 },
    { x: 531, y: 48, r: 167, g: 172, b: 174 },
    { x: 262, y: 57, r: 181, g: 186, b: 189 },
    { x: 286, y: 58, r: 16, g: 24, b: 33 },
    { x: 319, y: 61, r: 181, g: 186, b: 189 },
    { x: 347, y: 62, r: 127, g: 133, b: 137 },
    { x: 374, y: 62, r: 181, g: 186, b: 189 },
    { x: 220, y: 302, r: 41, g: 73, b: 123 },
    { x: 399, y: 306, r: 155, g: 195, b: 251 },
    { x: 443, y: 305, r: 8, g: 105, b: 247 },
], { x: 193, y: 300 }, // no, cancel
{ x: 371, y: 300 } // yes, reset
);
// a dialog to select year, normal or master league
// subpage of selectYearV2
// TODO: let user can select specific mode and year to play
var leagueResetDialog = new Rerouter_1.Page('leagueResetDialog', [
    // title
    { x: 270, y: 40, r: 40, g: 44, b: 49 },
    { x: 293, y: 44, r: 146, g: 148, b: 155 },
    { x: 326, y: 45, r: 193, g: 197, b: 206 },
    { x: 351, y: 42, r: 21, g: 26, b: 30 },
    { x: 364, y: 42, r: 188, g: 192, b: 198 },
    // // bg
    // { x: 121, y: 25, r: 191, g: 199, b: 206 },
    // { x: 116, y: 288, r: 239, g: 242, b: 239 },
    // { x: 518, y: 35, r: 72, g: 75, b: 80 },
    // { x: 517, y: 292, r: 239, g: 242, b: 239 },
    // // cancel btn bg
    // { x: 185, y: 282, r: 41, g: 75, b: 118 },
    // // reset to year XX btn bg
    // { x: 327, y: 297, r: 3, g: 79, b: 235 },
], { x: 371, y: 300 }, // reset to year XX
{ x: 193, y: 300 } // cancel
);
// TODO: check the position, must be bg of 'diamond', 'old' ...
// bg of the word
// ref: https://www.facebook.com/mlb9innings/photos/1366596103748570
// left, mid and right respectively
var selectRewardPlayerBtns = [
    { x: 66, y: 217 },
    { x: 221, y: 217 },
    { x: 377, y: 217 },
];
// only include basic types
// {r}-{g}-{b}: priority
// try x 23, y 260 in player info
var playerCardColorToRank = {
    '66-74-74': 1,
    '99-65-41': 2,
    '99-65-49': 2,
    '132-129-148': 3,
    '189-166-49': 4,
    '189-166-58': 4,
    '198-170-57': 4,
    '148-101-25': 4,
    '165-166-90': 4,
    '41-69-107': 5, // diamond TODO: unknown color
};
var leagueOnPlayAutoOff = new customPage_1.CustomPage('leagueOnPlayAutoOff', function (taskName, image) {
    // match scorePanelBg && (any arrow) && (autoCameraPause or swingBtn)
    var isMatchScorePanelBg = modules_1.rerouter.isPageMatchImage(scorePanelBg, image);
    if (!isMatchScorePanelBg) {
        return false;
    }
    var isMatchRedArrowTop = modules_1.rerouter.isPageMatchImage(redAndGreyArrow1, image);
    var isMatchGreyArrowTop = modules_1.rerouter.isPageMatchImage(redAndGreyArrow2, image);
    if (!isMatchGreyArrowTop && !isMatchRedArrowTop) {
        return false;
    }
    var isMatchAutoCameraPause = modules_1.rerouter.isPageMatchImage(autoCameraPause, image);
    if (isMatchAutoCameraPause) {
        return true;
    }
    var isMatchSwingBtn = modules_1.rerouter.isPageMatchImage(swingBtn, image);
    return isMatchSwingBtn;
}, { x: 511, y: 20 }, // switch to auto mode
{ x: 611, y: 20 } // pause button
);
var leagueOnPlayAutoOn = new customPage_1.CustomPage('leagueOnPlayAutoOn', function (taskName, image) {
    // match (any arrow) && battery & scroePanelBg
    var isMatchScorePanelBg = modules_1.rerouter.isPageMatchImage(scorePanelBg, image);
    if (!isMatchScorePanelBg) {
        return false;
    }
    var isMatchBattery = modules_1.rerouter.isPageMatchImage(battery, image);
    if (!isMatchBattery) {
        return false;
    }
    var isMatchRedArrowTop = modules_1.rerouter.isPageMatchImage(redAndGreyArrow1, image);
    if (isMatchRedArrowTop) {
        return true;
    }
    var isMatchGreyArrowTop = modules_1.rerouter.isPageMatchImage(redAndGreyArrow2, image);
    return isMatchGreyArrowTop;
}, { x: 485, y: 21 }, // turn on power save
{ x: 552, y: 21 } // turn off auto play
);
var scorePanelBg = new Rerouter_1.Page('scorePanelBg', [
    { x: 261, y: 338, r: 247, g: 247, b: 247 },
    { x: 259, y: 349, r: 247, g: 247, b: 247 },
    { x: 373, y: 338, r: 247, g: 247, b: 247 },
    { x: 373, y: 348, r: 247, g: 247, b: 247 },
]);
// red arrow on top
var redAndGreyArrow1 = new Rerouter_1.Page('redAndGreyArrow1', [
    { x: 329, y: 342, r: 238, g: 21, b: 19 },
    { x: 329, y: 340, r: 239, g: 162, b: 162 },
    { x: 329, y: 349, r: 181, g: 186, b: 181 },
    { x: 329, y: 357, r: 247, g: 247, b: 247 },
]);
// grey arrow on top
var redAndGreyArrow2 = new Rerouter_1.Page('redAndGreyArrow2', [
    { x: 329, y: 342, r: 186, g: 187, b: 186 },
    { x: 328, y: 339, r: 247, g: 247, b: 247 },
    { x: 327, y: 341, r: 247, g: 247, b: 247 },
    { x: 329, y: 349, r: 238, g: 16, b: 16 },
]);
var autoCameraPause = new Rerouter_1.Page('autoCameraPause', [
    { x: 501, y: 21, r: 255, g: 255, b: 255 },
    { x: 502, y: 15, r: 255, g: 255, b: 255 },
    { x: 503, y: 14, r: 255, g: 255, b: 255 },
    { x: 503, y: 15, r: 255, g: 255, b: 255 },
    { x: 505, y: 21, r: 255, g: 255, b: 255 },
    { x: 505, y: 22, r: 255, g: 255, b: 255 },
    { x: 505, y: 23, r: 255, g: 255, b: 255 },
    { x: 509, y: 14, r: 255, g: 255, b: 255 },
    { x: 509, y: 15, r: 255, g: 255, b: 255 },
    { x: 509, y: 16, r: 255, g: 255, b: 255 },
    { x: 509, y: 17, r: 255, g: 255, b: 255 },
    { x: 509, y: 18, r: 255, g: 255, b: 255 },
    { x: 509, y: 19, r: 255, g: 255, b: 255 },
    { x: 509, y: 20, r: 255, g: 255, b: 255 },
    { x: 509, y: 21, r: 255, g: 255, b: 255 },
    { x: 509, y: 22, r: 255, g: 255, b: 255 },
    { x: 510, y: 24, r: 255, g: 255, b: 255 },
    { x: 514, y: 15, r: 255, g: 255, b: 255 },
    { x: 514, y: 16, r: 255, g: 255, b: 255 },
    { x: 514, y: 17, r: 255, g: 255, b: 255 },
    { x: 514, y: 18, r: 255, g: 255, b: 255 },
    { x: 514, y: 19, r: 255, g: 255, b: 255 },
    { x: 514, y: 20, r: 255, g: 255, b: 255 },
    { x: 514, y: 21, r: 255, g: 255, b: 255 },
    { x: 514, y: 22, r: 255, g: 255, b: 255 },
    { x: 520, y: 14, r: 255, g: 255, b: 255 },
    { x: 520, y: 15, r: 255, g: 255, b: 255 },
    { x: 520, y: 16, r: 255, g: 255, b: 255 },
    { x: 520, y: 17, r: 255, g: 255, b: 255 },
    { x: 520, y: 18, r: 255, g: 255, b: 255 },
    { x: 520, y: 19, r: 255, g: 255, b: 255 },
    { x: 520, y: 20, r: 255, g: 255, b: 255 },
    { x: 520, y: 21, r: 255, g: 255, b: 255 },
    { x: 520, y: 22, r: 255, g: 255, b: 255 },
    { x: 520, y: 23, r: 255, g: 255, b: 255 },
    { x: 525, y: 17, r: 255, g: 255, b: 255 },
    { x: 525, y: 18, r: 255, g: 255, b: 255 },
    { x: 525, y: 19, r: 255, g: 255, b: 255 },
    { x: 525, y: 20, r: 255, g: 255, b: 255 },
    { x: 525, y: 21, r: 255, g: 255, b: 255 },
    { x: 525, y: 22, r: 255, g: 255, b: 255 },
    { x: 526, y: 24, r: 255, g: 255, b: 255 },
    { x: 528, y: 13, r: 255, g: 255, b: 255 },
    { x: 530, y: 14, r: 255, g: 255, b: 255 },
    { x: 530, y: 15, r: 255, g: 255, b: 255 },
    { x: 530, y: 16, r: 255, g: 255, b: 255 },
    { x: 530, y: 17, r: 255, g: 255, b: 255 },
    { x: 530, y: 18, r: 255, g: 255, b: 255 },
    { x: 530, y: 19, r: 255, g: 255, b: 255 },
    { x: 530, y: 20, r: 255, g: 255, b: 255 },
    { x: 530, y: 21, r: 255, g: 255, b: 255 },
    { x: 530, y: 22, r: 255, g: 255, b: 255 },
    { x: 530, y: 23, r: 255, g: 255, b: 255 },
    { x: 568, y: 12, r: 255, g: 255, b: 255 },
    { x: 612, y: 12, r: 255, g: 255, b: 255 },
    { x: 612, y: 13, r: 255, g: 255, b: 255 },
]);
var swingBtn = new Rerouter_1.Page('swingBtn', [
    { x: 515, y: 247, r: 43, g: 46, b: 41 },
    { x: 525, y: 255, r: 158, g: 156, b: 158 },
    { x: 531, y: 245, r: 49, g: 49, b: 49 },
    { x: 532, y: 263, r: 25, g: 25, b: 25 },
]);
var battery = new Rerouter_1.Page('battery', [
    { x: 484, y: 10, r: 255, g: 255, b: 255 },
    { x: 484, y: 11, r: 255, g: 255, b: 255 },
    { x: 484, y: 12, r: 255, g: 255, b: 255 },
    { x: 484, y: 13, r: 255, g: 255, b: 255 },
    { x: 484, y: 14, r: 255, g: 255, b: 255 },
    { x: 484, y: 15, r: 255, g: 255, b: 255 },
    { x: 484, y: 16, r: 255, g: 255, b: 255 },
    { x: 484, y: 17, r: 255, g: 255, b: 255 },
    { x: 485, y: 10, r: 255, g: 255, b: 255 },
    { x: 485, y: 11, r: 255, g: 255, b: 255 },
    { x: 485, y: 12, r: 255, g: 255, b: 255 },
    { x: 485, y: 13, r: 255, g: 255, b: 255 },
    { x: 485, y: 14, r: 255, g: 255, b: 255 },
    { x: 485, y: 15, r: 255, g: 255, b: 255 },
    { x: 485, y: 16, r: 255, g: 255, b: 255 },
    { x: 486, y: 10, r: 255, g: 255, b: 255 },
    { x: 486, y: 11, r: 255, g: 255, b: 255 },
    { x: 486, y: 12, r: 255, g: 255, b: 255 },
    { x: 486, y: 13, r: 255, g: 255, b: 255 },
    { x: 486, y: 14, r: 255, g: 255, b: 255 },
    { x: 486, y: 15, r: 255, g: 255, b: 255 },
    { x: 486, y: 16, r: 255, g: 255, b: 255 },
    { x: 487, y: 10, r: 255, g: 255, b: 255 },
    { x: 487, y: 11, r: 255, g: 255, b: 255 },
    { x: 487, y: 12, r: 255, g: 255, b: 255 },
    { x: 487, y: 13, r: 255, g: 255, b: 255 },
    { x: 487, y: 14, r: 255, g: 255, b: 255 },
    { x: 488, y: 10, r: 255, g: 255, b: 255 },
    { x: 488, y: 11, r: 255, g: 255, b: 255 },
    { x: 488, y: 12, r: 255, g: 255, b: 255 },
    { x: 489, y: 9, r: 255, g: 255, b: 255 },
    { x: 489, y: 10, r: 255, g: 255, b: 255 },
    { x: 489, y: 11, r: 255, g: 255, b: 255 },
    { x: 489, y: 12, r: 255, g: 255, b: 255 },
    { x: 490, y: 9, r: 255, g: 255, b: 255 },
    { x: 490, y: 10, r: 255, g: 255, b: 255 },
    { x: 490, y: 11, r: 255, g: 255, b: 255 },
    { x: 490, y: 12, r: 255, g: 255, b: 255 },
    { x: 491, y: 9, r: 255, g: 255, b: 255 },
    { x: 491, y: 10, r: 255, g: 255, b: 255 },
    { x: 491, y: 11, r: 255, g: 255, b: 255 },
    { x: 491, y: 12, r: 255, g: 255, b: 255 },
    { x: 492, y: 9, r: 255, g: 255, b: 255 },
    { x: 492, y: 10, r: 255, g: 255, b: 255 },
    { x: 492, y: 11, r: 255, g: 255, b: 255 },
    { x: 492, y: 12, r: 255, g: 255, b: 255 },
    { x: 493, y: 9, r: 255, g: 255, b: 255 },
    { x: 493, y: 10, r: 255, g: 255, b: 255 },
    { x: 493, y: 11, r: 255, g: 255, b: 255 },
    { x: 493, y: 12, r: 255, g: 255, b: 255 },
    { x: 494, y: 10, r: 255, g: 255, b: 255 },
    { x: 494, y: 11, r: 255, g: 255, b: 255 },
    { x: 494, y: 12, r: 255, g: 255, b: 255 },
    { x: 494, y: 13, r: 255, g: 255, b: 255 },
    { x: 495, y: 10, r: 255, g: 255, b: 255 },
    { x: 495, y: 11, r: 255, g: 255, b: 255 },
    { x: 495, y: 12, r: 255, g: 255, b: 255 },
    { x: 495, y: 13, r: 255, g: 255, b: 255 },
    { x: 496, y: 10, r: 255, g: 255, b: 255 },
    { x: 496, y: 11, r: 255, g: 255, b: 255 },
    { x: 496, y: 12, r: 255, g: 255, b: 255 },
    { x: 496, y: 13, r: 255, g: 255, b: 255 },
    { x: 496, y: 14, r: 255, g: 255, b: 255 },
    { x: 496, y: 15, r: 255, g: 255, b: 255 },
    { x: 496, y: 16, r: 255, g: 255, b: 255 },
    { x: 496, y: 17, r: 255, g: 255, b: 255 },
    { x: 497, y: 10, r: 255, g: 255, b: 255 },
    { x: 497, y: 11, r: 255, g: 255, b: 255 },
    { x: 497, y: 12, r: 255, g: 255, b: 255 },
    { x: 497, y: 13, r: 255, g: 255, b: 255 },
    { x: 497, y: 14, r: 255, g: 255, b: 255 },
    { x: 497, y: 15, r: 255, g: 255, b: 255 },
    { x: 497, y: 16, r: 255, g: 255, b: 255 },
    { x: 497, y: 17, r: 255, g: 255, b: 255 },
]);


/***/ }),

/***/ "./src/tasks/setting.ts":
/*!******************************!*\
  !*** ./src/tasks/setting.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = exports.addTask = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
function addTask() {
    console.log('addTask setting');
    // only run once
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.settingDefault,
        // maxTaskRunTimes: 1,
        minRoundInterval: Number.POSITIVE_INFINITY,
        maxTaskDuring: 10 * CONSTANTS.minuteInMs,
        forceStop: true,
    });
}
exports.addTask = addTask;
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(settings.name),
        match: settings,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            var inactiveTabColor = { r: 58, g: 65, b: 74 };
            var tab = (0, utils_1.arrayFind)(Object.keys(settingsTabs), function (t) {
                var _a = settingsTabs[t], x = _a.x, y = _a.y;
                return !(0, utils_1.isSameColor)(image, __assign({ x: x, y: y }, inactiveTabColor));
            });
            switch (context.task.name) {
                case taskNames_1.TASKS.settingDefault:
                    switch (tab) {
                        case undefined:
                            // not do anything
                            modules_1.state.onRunning();
                            finishRound(true);
                            break;
                        case 'graphicTab':
                            modules_1.state.onRunning();
                            handleGraphicTab();
                            // go to gameSettingsTab
                            modules_1.rerouter.screen.tap(settingsTabs.gameSettingsTab);
                            break;
                        case 'gameSettingsTab':
                            modules_1.state.onRunning();
                            handleGameSettingsTab();
                            finishRound(true);
                            break;
                        case 'notificationTab':
                            // don't need to handle notificationTab
                            modules_1.state.onRunning();
                            // handleNotificationTab();
                            finishRound(true);
                            break;
                        default:
                            // go to graphicTab
                            modules_1.rerouter.screen.tap(settingsTabs.graphicTab);
                            break;
                    }
                    break;
                case taskNames_1.TASKS.settingResetLeagueProgress:
                    if (!modules_1.state.leagueGame.needResetProgress) {
                        modules_1.state.onRunning();
                        finishRound(true);
                        break;
                    }
                    // go to leagueResetDialog
                    modules_1.rerouter.screen.tap(settingsBtns.leagueReset);
                    modules_1.state.leagueGame.needResetProgress = false;
                    break;
                default:
                    modules_1.rerouter.goBack(settings);
                    break;
            }
        },
    });
    // FIXME: this should only run when needed
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.settingResetLeagueProgress,
        minRoundInterval: 1 * CONSTANTS.minuteInMs,
        maxTaskDuring: 10 * CONSTANTS.minuteInMs,
        beforeRoute: function (task) {
            if (!modules_1.state.leagueGame.needResetProgress) {
                return 'skipRouteLoop';
            }
        },
        forceStop: true,
    });
}
exports.addRoutes = addRoutes;
function handleGraphicTab() {
    modules_1.rerouter.screen.tap(settingsGraphTabBtns.powerSaveOn);
    Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
}
function handleGameSettingsTab() {
    var btns = [
        settingsGameSettingsTabBtns.pitchingAuto,
        settingsGameSettingsTabBtns.fieldingAuto,
        settingsGameSettingsTabBtns.baseRunningAuto,
        settingsGameSettingsTabBtns.batterPlayTypeA,
        settingsGameSettingsTabBtns.dynamicCameraOff,
    ];
    for (var _i = 0, btns_1 = btns; _i < btns_1.length; _i++) {
        var btn = btns_1[_i];
        modules_1.rerouter.screen.tap(btn);
        Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
    }
}
function handleNotificationTab() {
    modules_1.rerouter.screen.tap(settingsNotificationTabBtns.allNotificationOff);
    Rerouter_1.Utils.sleep(CONSTANTS.sleepShort);
}
var settings = new Rerouter_1.Page('settings', [
    // navi in right
    // { x: 625, y: 7, r: 214, g: 210, b: 214 },
    // { x: 593, y: 14, r: 74, g: 93, b: 123 },
    // { x: 590, y: 14, r: 74, g: 93, b: 123 },
    // { x: 487, y: 15, r: 214, g: 210, b: 214 },
    // { x: 481, y: 15, r: 77, g: 86, b: 93 },
    // { x: 391, y: 11, r: 79, g: 80, b: 79 },
    // { x: 378, y: 16, r: 133, g: 150, b: 169 },
    // { x: 313, y: 11, r: 178, g: 178, b: 179 },
    // bg of right section
    { x: 478, y: 119, r: 41, g: 45, b: 58 },
    { x: 476, y: 175, r: 36, g: 40, b: 44 },
    { x: 476, y: 228, r: 107, g: 97, b: 90 },
    { x: 474, y: 283, r: 66, g: 77, b: 58 },
    { x: 609, y: 293, r: 41, g: 45, b: 58 },
    { x: 608, y: 234, r: 41, g: 45, b: 58 },
    { x: 605, y: 178, r: 41, g: 45, b: 58 },
    { x: 608, y: 122, r: 41, g: 45, b: 58 },
    // google play game icon in right section
    { x: 490, y: 115, r: 35, g: 38, b: 51 },
    // back
    { x: 25, y: 312, r: 193, g: 198, b: 191 },
    { x: 39, y: 322, r: 58, g: 69, b: 49 },
], { x: 41, y: 320 }, { x: 41, y: 320 });
var settingsTabs = {
    soundAndLanTab: { x: 22, y: 55 },
    graphicTab: { x: 111, y: 55 },
    gameSettingsTab: { x: 279, y: 70 },
    notificationTab: { x: 380, y: 71 },
};
var settingsBtns = {
    leagueReset: { x: 562, y: 217 },
};
// FIXME: add lan change pages
var settingsSoundTab = new Rerouter_1.Page('settings/sound', [
    // nav bar right
    { x: 621, y: 8, r: 214, g: 210, b: 214 },
    { x: 595, y: 10, r: 74, g: 97, b: 131 },
    { x: 503, y: 15, r: 74, g: 85, b: 90 },
    { x: 392, y: 12, r: 176, g: 173, b: 176 },
    { x: 315, y: 8, r: 238, g: 243, b: 238 },
    { x: 302, y: 17, r: 214, g: 214, b: 214 },
    // highlighted sound tab
    { x: 19, y: 60, r: 0, g: 101, b: 247 },
    { x: 20, y: 71, r: 0, g: 89, b: 222 },
    { x: 95, y: 69, r: 0, g: 92, b: 230 },
    // other tabs
    { x: 117, y: 56, r: 58, g: 65, b: 74 },
    { x: 205, y: 54, r: 58, g: 65, b: 74 },
    { x: 300, y: 52, r: 58, g: 65, b: 74 },
    { x: 394, y: 55, r: 58, g: 65, b: 74 },
    // bg table
    { x: 20, y: 85, r: 230, g: 231, b: 238 },
    { x: 20, y: 292, r: 206, g: 210, b: 214 },
    { x: 459, y: 85, r: 230, g: 231, b: 238 },
    { x: 460, y: 289, r: 206, g: 210, b: 214 },
    // right sidebar bg
    { x: 480, y: 120, r: 41, g: 45, b: 58 },
    { x: 483, y: 179, r: 41, g: 45, b: 58 },
    { x: 485, y: 232, r: 41, g: 45, b: 58 },
    { x: 486, y: 286, r: 41, g: 45, b: 58 },
    { x: 612, y: 119, r: 41, g: 45, b: 58 },
    { x: 610, y: 180, r: 41, g: 45, b: 58 },
    { x: 608, y: 234, r: 41, g: 45, b: 58 },
    { x: 610, y: 287, r: 41, g: 45, b: 58 },
], { x: 41, y: 320 }, { x: 41, y: 320 });
var settingsSoundTabBtns = {
    lang: { x: 401, y: 190 },
    // add more if need more setting
};
var settingsSoundTabLanSelect = new Rerouter_1.Page('settings/sound/lanSelect', [
    // bg
    { x: 293, y: 18, r: 25, g: 20, b: 25 },
    { x: 43, y: 343, r: 8, g: 4, b: 0 },
    { x: 622, y: 345, r: 8, g: 8, b: 8 },
    // lang english btn
    { x: 160, y: 127, r: 49, g: 89, b: 123 },
    { x: 190, y: 132, r: 58, g: 92, b: 129 },
    { x: 213, y: 133, r: 80, g: 113, b: 151 },
    { x: 229, y: 133, r: 166, g: 189, b: 218 },
    { x: 241, y: 133, r: 49, g: 85, b: 123 },
    { x: 266, y: 142, r: 49, g: 81, b: 115 },
    { x: 282, y: 129, r: 49, g: 89, b: 123 },
    { x: 166, y: 145, r: 41, g: 77, b: 115 },
    // back
    { x: 26, y: 316, r: 206, g: 210, b: 206 },
    { x: 43, y: 321, r: 206, g: 210, b: 206 },
    { x: 34, y: 329, r: 201, g: 206, b: 201 },
], { x: 200, y: 131 }, // english btn
{ x: 200, y: 131 } // english btn
);
var settingsSoundTabLanSelectProceedBtns = {
    yes: { x: 407, y: 307 },
};
var settingsGraphTab = new Rerouter_1.Page('settings/graph', [
    // nav bar right
    { x: 621, y: 8, r: 214, g: 210, b: 214 },
    { x: 595, y: 10, r: 74, g: 97, b: 131 },
    { x: 503, y: 15, r: 74, g: 85, b: 90 },
    { x: 392, y: 12, r: 176, g: 173, b: 176 },
    { x: 315, y: 8, r: 238, g: 243, b: 238 },
    { x: 302, y: 17, r: 214, g: 214, b: 214 },
    // highlighted graph tab
    { x: 123, y: 59, r: 0, g: 101, b: 254 },
    { x: 149, y: 59, r: 28, g: 119, b: 254 },
    { x: 177, y: 64, r: 0, g: 97, b: 238 },
    // other tabs
    { x: 37, y: 63, r: 58, g: 65, b: 74 },
    { x: 62, y: 62, r: 134, g: 143, b: 158 },
    { x: 232, y: 57, r: 58, g: 65, b: 74 },
    { x: 267, y: 63, r: 156, g: 167, b: 180 },
    { x: 322, y: 63, r: 160, g: 165, b: 180 },
    { x: 353, y: 63, r: 58, g: 65, b: 74 },
    { x: 401, y: 64, r: 171, g: 179, b: 192 },
    { x: 440, y: 61, r: 155, g: 159, b: 177 },
    // bg table
    { x: 19, y: 90, r: 230, g: 231, b: 238 },
    { x: 23, y: 291, r: 230, g: 231, b: 238 },
    { x: 459, y: 84, r: 230, g: 231, b: 238 },
    { x: 458, y: 287, r: 230, g: 231, b: 238 },
], { x: 41, y: 320 }, { x: 41, y: 320 });
var settingsGraphTabBtns = {
    qualityNormal: { x: 212, y: 120 },
    maxFPS30: { x: 83, y: 175 },
    powerSaveOn: { x: 222, y: 222 },
    bigHeadModeOff: { x: 86, y: 283 },
    // add more if need more setting
};
var settingsGameSettingsTabBtns = {
    pitchingAuto: { x: 100, y: 107 },
    fieldingAuto: { x: 100, y: 150 },
    baseRunningAuto: { x: 100, y: 192 },
    batterPlayTypeA: { x: 100, y: 243 },
    dynamicCameraOff: { x: 100, y: 285 },
};
var settingsNotificationTabBtns = {
    allNotificationOff: { x: 296, y: 96 },
};


/***/ }),

/***/ "./src/tasks/stayInLogin.ts":
/*!**********************************!*\
  !*** ./src/tasks/stayInLogin.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = exports.addTask = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var isGoHiveLogin = true;
function addTask() {
    console.log('addTask stayInLogin');
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.stayInLogin,
        forceStop: false,
    });
}
exports.addTask = addTask;
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(landing.name),
        match: landing,
        action: function (context) {
            isGoHiveLogin = true;
            if (!modules_1.Config.config.isCloud) {
                return;
            }
            modules_1.state.onLoginPage();
            console.log('landing');
            modules_1.rerouter.goNext(landing);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(loginSelectWay),
        match: loginSelectWay,
        action: function (context) {
            if (!modules_1.Config.config.isCloud) {
                return;
            }
            if (context.task.name === taskNames_1.TASKS.stayInLogin) {
                // check the direction to go by previous page
                if (!isGoHiveLogin) {
                    keycode('BACK', 100);
                    console.log('keycode back');
                    return;
                }
                isGoHiveLogin = false;
                modules_1.rerouter.goNext(loginSelectWay);
                return;
            }
            modules_1.rerouter.goNext(loginSelectWay);
        },
    });
    [logInHive, logInHive90].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: function (context) {
                if (!modules_1.Config.config.isCloud) {
                    return;
                }
                // Zack codes in this way (non-main logic return early ASAP)
                if (context.matchDuring >= CONSTANTS.switchWaitingLoginPagesInterval) {
                    console.log('click back for avoid session expired');
                    keycode('BACK', 100);
                    console.log('keycode back');
                    return;
                }
                if (context.task.name === taskNames_1.TASKS.stayInLogin) {
                    console.log('stay in login and sleep 10 secs');
                    modules_1.state.onLoginPage();
                    Rerouter_1.Utils.sleep(10000);
                    return;
                }
                // main logic
                console.log('need user input');
                modules_1.state.onLoginPage(true);
            },
        });
    });
    [fbLogIn90, googleLogIn90].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'keycodeBack',
        });
    });
}
exports.addRoutes = addRoutes;
var landing = new Rerouter_1.Page('landing', [
    // logo in center
    { x: 290, y: 248, r: 0, g: 28, b: 66 },
    { x: 299, y: 253, r: 255, g: 255, b: 255 },
    { x: 305, y: 248, r: 188, g: 0, b: 30 },
    // 9innings
    { x: 234, y: 270, r: 210, g: 209, b: 207 },
    { x: 254, y: 271, r: 26, g: 49, b: 82 },
    { x: 323, y: 268, r: 255, g: 255, b: 255 },
    { x: 341, y: 278, r: 255, g: 255, b: 255 },
], { x: 254, y: 200 }, // to select login
{ x: 254, y: 200 });
var loginSelectWay = new Rerouter_1.Page('loginSelectWay', [
    // bg
    { x: 51, y: 72, r: 7, g: 7, b: 8 },
    { x: 53, y: 306, r: 7, g: 6, b: 7 },
    { x: 618, y: 315, r: 5, g: 5, b: 5 },
    // google btn
    { x: 180, y: 200, r: 251, g: 188, b: 5 },
    { x: 185, y: 205, r: 92, g: 185, b: 116 },
    { x: 307, y: 202, r: 255, g: 255, b: 255 },
    // fb btn
    { x: 334, y: 201, r: 205, g: 225, b: 252 },
    { x: 333, y: 201, r: 24, g: 119, b: 242 },
    { x: 331, y: 197, r: 255, g: 255, b: 255 },
    // hive btn
    { x: 182, y: 228, r: 255, g: 255, b: 255 },
    { x: 185, y: 234, r: 240, g: 246, b: 255 },
    { x: 307, y: 235, r: 18, g: 119, b: 255 },
], { x: 243, y: 232 }, // login hive
{ x: 243, y: 232 } // login hive
);
var logInHive = new Rerouter_1.Page('logInHive', [
    { x: 226, y: 76, r: 48, g: 48, b: 48 },
    { x: 322, y: 78, r: 48, g: 48, b: 48 },
    { x: 535, y: 42, r: 48, g: 48, b: 48 },
    { x: 624, y: 40, r: 255, g: 255, b: 255 },
    { x: 66, y: 333, r: 238, g: 238, b: 238 },
    { x: 44, y: 235, r: 238, g: 238, b: 238 },
    { x: 136, y: 236, r: 238, g: 238, b: 238 },
    { x: 258, y: 232, r: 143, g: 186, b: 227 },
    { x: 548, y: 169, r: 43, g: 132, b: 216 },
    { x: 583, y: 195, r: 43, g: 132, b: 216 },
    { x: 43, y: 142, r: 255, g: 255, b: 255 },
    { x: 43, y: 195, r: 255, g: 255, b: 255 },
], { x: 554, y: 177 }, // login
{ x: 574, y: 40 } // back to game
);
// suit for dpi 90
var logInHive90 = new Rerouter_1.Page('logInHive90', [
    // bg
    { x: 11, y: 171, r: 238, g: 238, b: 238 },
    { x: 10, y: 326, r: 238, g: 238, b: 238 },
    { x: 628, y: 107, r: 238, g: 238, b: 238 },
    { x: 627, y: 326, r: 238, g: 238, b: 238 },
    // title
    { x: 319, y: 72, r: 238, g: 238, b: 238 },
    { x: 338, y: 71, r: 148, g: 148, b: 148 },
    { x: 375, y: 71, r: 48, g: 48, b: 48 },
    // input
    { x: 480, y: 155, r: 255, g: 255, b: 255 },
    { x: 480, y: 199, r: 255, g: 255, b: 255 },
    // login btn
    { x: 558, y: 160, r: 43, g: 132, b: 216 },
    { x: 589, y: 175, r: 43, g: 132, b: 216 },
    { x: 532, y: 162, r: 110, g: 171, b: 228 },
], { x: 554, y: 177 }, // login
{ x: 574, y: 40 } // back to game
);
var fbLogIn90 = new Rerouter_1.Page('fbLogIn90', [
    // fb logo
    { x: 304, y: 14, r: 24, g: 119, b: 242 },
    { x: 316, y: 17, r: 255, g: 255, b: 255 },
    { x: 309, y: 31, r: 24, g: 119, b: 242 },
    { x: 325, y: 32, r: 24, g: 119, b: 242 },
    { x: 331, y: 15, r: 24, g: 119, b: 242 },
    { x: 324, y: 12, r: 255, g: 255, b: 255 },
    { x: 345, y: 11, r: 255, g: 255, b: 255 },
    { x: 323, y: 19, r: 24, g: 119, b: 242 },
    { x: 330, y: 23, r: 24, g: 119, b: 242 },
    // bg
    { x: 73, y: 102, r: 255, g: 255, b: 255 },
    { x: 52, y: 261, r: 255, g: 255, b: 255 },
    { x: 312, y: 315, r: 255, g: 255, b: 255 },
    { x: 591, y: 197, r: 255, g: 255, b: 255 },
    { x: 492, y: 62, r: 255, g: 255, b: 255 },
    { x: 318, y: 86, r: 255, g: 255, b: 255 },
    // login btn bg
    { x: 203, y: 194, r: 24, g: 119, b: 242 },
    { x: 433, y: 197, r: 24, g: 119, b: 242 },
]);
var googleLogIn90 = new Rerouter_1.Page('googleLogIn90', [
    // google logo
    { x: 295, y: 64, r: 255, g: 255, b: 255 },
    { x: 306, y: 67, r: 255, g: 255, b: 255 },
    { x: 318, y: 68, r: 251, g: 188, b: 5 },
    { x: 321, y: 68, r: 253, g: 221, b: 130 },
    { x: 329, y: 68, r: 66, g: 133, b: 244 },
    { x: 335, y: 68, r: 234, g: 67, b: 53 },
    // bg
    { x: 94, y: 33, r: 75, g: 129, b: 218 },
    { x: 67, y: 227, r: 79, g: 132, b: 221 },
    { x: 142, y: 329, r: 255, g: 255, b: 255 },
    { x: 559, y: 338, r: 61, g: 114, b: 203 },
    { x: 539, y: 80, r: 63, g: 117, b: 205 },
    { x: 350, y: 334, r: 255, g: 255, b: 255 },
    // login btn bg
    { x: 478, y: 224, r: 26, g: 115, b: 232 },
]);
// TODO
// captcha
var logInCaptchaImNotRobot = new Rerouter_1.Page('logInCaptchaImNotRobot', [
    // captcha logo
    { x: 384, y: 193, r: 249, g: 249, b: 249 },
    { x: 374, y: 202, r: 216, g: 226, b: 242 },
    { x: 382, y: 204, r: 249, g: 249, b: 249 },
    // not checked
    { x: 246, y: 205, r: 255, g: 255, b: 255 },
    // bg next
    { x: 59, y: 274, r: 43, g: 132, b: 216 },
    { x: 574, y: 279, r: 43, g: 132, b: 216 },
    // bg
    { x: 44, y: 331, r: 238, g: 238, b: 238 },
    { x: 615, y: 337, r: 238, g: 238, b: 238 },
], { x: 247, y: 205 }, // check
{ x: 247, y: 205 } // check
);
var logInCaptchaImNotRobotChecked = new Rerouter_1.Page('logInCaptchaImNotRobotChecked', [
    // captcha logo
    { x: 374, y: 198, r: 249, g: 249, b: 249 },
    { x: 384, y: 203, r: 239, g: 239, b: 239 },
    { x: 384, y: 197, r: 35, g: 65, b: 161 },
    // bg captcha block
    { x: 270, y: 191, r: 249, g: 249, b: 249 },
    { x: 335, y: 218, r: 249, g: 249, b: 249 },
    { x: 209, y: 207, r: 238, g: 238, b: 238 },
    { x: 291, y: 170, r: 238, g: 238, b: 238 },
    { x: 328, y: 233, r: 238, g: 238, b: 238 },
    { x: 447, y: 196, r: 238, g: 238, b: 238 },
    // bg next
    { x: 59, y: 274, r: 43, g: 132, b: 216 },
    { x: 574, y: 279, r: 43, g: 132, b: 216 },
    // bg
    { x: 44, y: 331, r: 238, g: 238, b: 238 },
    { x: 615, y: 337, r: 238, g: 238, b: 238 },
], { x: 330, y: 270 }, // next
{ x: 330, y: 270 } // next
);


/***/ }),

/***/ "./src/tasks/taskNames.ts":
/*!********************************!*\
  !*** ./src/tasks/taskNames.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TASKS = void 0;
var TASKS;
(function (TASKS) {
    TASKS["restartAppPerDay"] = "restartAppPerDay";
    TASKS["settingDefault"] = "settingDefault";
    TASKS["settingResetLeagueProgress"] = "settingResetLeagueProgress";
    TASKS["playLeagueGame"] = "playLeagueGame";
    TASKS["playBattleGame"] = "playBattleGame";
    TASKS["adReward"] = "adReward";
    TASKS["weeklyMission"] = "weeklyMission";
    TASKS["recieveInbox"] = "recieveInbox";
    TASKS["stayInLogin"] = "stayInLogin";
    TASKS["uploadCache"] = "uploadCache";
    TASKS["sendAliveEvent"] = "sendAliveEvent";
    TASKS["sendWaitEvent"] = "sendWaitEvent";
})(TASKS = exports.TASKS || (exports.TASKS = {}));


/***/ }),

/***/ "./src/tasks/weeklyMission.ts":
/*!************************************!*\
  !*** ./src/tasks/weeklyMission.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addRoutes = exports.addTask = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
var modules_1 = __webpack_require__(/*! ../modules */ "./src/modules/index.ts");
var taskNames_1 = __webpack_require__(/*! ./taskNames */ "./src/tasks/taskNames.ts");
var CONSTANTS = __importStar(__webpack_require__(/*! ../constants */ "./src/constants.ts"));
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils.ts");
function addTask() {
    modules_1.rerouter.addTask({
        name: taskNames_1.TASKS.weeklyMission,
        // maxTaskRunTimes: 1,
        minRoundInterval: CONSTANTS.dayInMs,
        maxTaskDuring: 30 * CONSTANTS.minuteInMs,
        forceStop: true,
    });
}
exports.addTask = addTask;
function addRoutes() {
    modules_1.rerouter.addRoute({
        path: "/".concat(achievementMission.name),
        match: achievementMission,
        action: function (context, image) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.weeklyMission) {
                modules_1.rerouter.goBack(achievementMission);
                return;
            }
            // collect daily one if available
            var x = 613;
            var canCollectColor = { r: 8, g: 125, b: 255 };
            for (var y = 128; y < 260; y += 44) {
                var canCollect = (0, utils_1.isSameColor)(image, __assign({ x: x, y: y }, canCollectColor));
                if (canCollect) {
                    modules_1.rerouter.screen.tap({ x: x, y: y });
                    console.log('collect');
                    Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
                }
            }
            modules_1.rerouter.goNext(achievementMission);
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(maxCurrencyAlert.name),
        match: maxCurrencyAlert,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name === taskNames_1.TASKS.weeklyMission) {
                console.log('cannot collect more currency, skip weekly mission');
                finishRound(true);
            }
            modules_1.rerouter.goBack(maxCurrencyAlert);
            modules_1.state.onRunning();
        },
    });
    modules_1.rerouter.addRoute({
        path: "/".concat(weeklyMissionBox.name),
        match: weeklyMissionBox,
        action: function (context, image, matched, finishRound) {
            modules_1.state.checkUploadSession();
            if (context.task.name !== taskNames_1.TASKS.weeklyMission) {
                modules_1.rerouter.goBack(weeklyMissionBox);
                return;
            }
            var canCollectColor = { r: 189, g: 194, b: 197 };
            var _a = [27, 115], x = _a[0], y = _a[1];
            var _b = [198, 75], w = _b[0], h = _b[1];
            // click openBox only when all mission is complete
            // bc it is abled once a week
            for (var dx = 0; dx < 3 * w; dx += w) {
                for (var dy = 0; dy < 3 * h; dy += h) {
                    var canCollect = (0, utils_1.isSameColor)(image, __assign({ x: x + dx, y: y + dy }, canCollectColor));
                    if (!canCollect) {
                        console.log('wait all weekly mission complete');
                        finishRound(true);
                        modules_1.state.onRunning();
                        return;
                    }
                }
            }
            console.log('click open');
            modules_1.rerouter.screen.tap(weeklyMissionBoxBtns.openBox);
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            // TODO: let user select the item they want in the future
            // select the left bottom one
            console.log('select right bottom item');
            modules_1.rerouter.screen.tap({ x: x + 2 * w, y: y + 2 * h });
            Rerouter_1.Utils.sleep(CONSTANTS.sleepMedium);
            console.log('receive right bottom item');
            modules_1.rerouter.screen.tap(weeklyMissionBoxBtns.receiveReward);
            // enter receive confirm page
            finishRound(true);
            modules_1.state.onRunning();
        },
        debug: true,
    });
    [weeklyMissionBoxConfirm, weeklyMissionBoxReceived].forEach(function (p) {
        modules_1.rerouter.addRoute({
            path: "/".concat(p.name),
            match: p,
            action: 'goNext',
        });
    });
}
exports.addRoutes = addRoutes;
var achievementMission = new Rerouter_1.Page('achievementMission', [
    // today mission bg
    { x: 235, y: 55, r: 247, g: 247, b: 247 },
    { x: 231, y: 71, r: 247, g: 247, b: 247 },
    { x: 588, y: 72, r: 247, g: 247, b: 247 },
    // left section world record bg left bottom
    { x: 16, y: 293, r: 25, g: 40, b: 74 },
    // player head
    { x: 75, y: 88, r: 66, g: 59, b: 90 },
    // back
    { x: 31, y: 316, r: 214, g: 219, b: 214 },
], { x: 580, y: 278 }, // complete weekly mission box
{ x: 41, y: 320 });
var weeklyMissionBox = new Rerouter_1.Page('weeklyMissionBox', [
    // nav bar right part (p, star ...)
    { x: 299, y: 13, r: 214, g: 214, b: 214 },
    { x: 318, y: 9, r: 238, g: 234, b: 238 },
    { x: 313, y: 9, r: 238, g: 234, b: 238 },
    { x: 392, y: 9, r: 232, g: 229, b: 232 },
    { x: 385, y: 2, r: 214, g: 214, b: 214 },
    { x: 496, y: 13, r: 238, g: 166, b: 16 },
    { x: 483, y: 4, r: 214, g: 219, b: 216 },
    { x: 597, y: 10, r: 213, g: 226, b: 238 },
    { x: 628, y: 14, r: 214, g: 211, b: 214 },
    // bg of table
    { x: 14, y: 82, r: 33, g: 32, b: 41 },
    { x: 16, y: 288, r: 33, g: 44, b: 58 },
    { x: 615, y: 100, r: 33, g: 36, b: 41 },
    { x: 613, y: 283, r: 33, g: 44, b: 58 },
    // description footer
    { x: 80, y: 307, r: 202, g: 201, b: 196 },
    { x: 89, y: 315, r: 49, g: 61, b: 34 },
    { x: 103, y: 319, r: 73, g: 83, b: 66 },
    // back btn
    { x: 24, y: 314, r: 214, g: 214, b: 214 },
    { x: 42, y: 317, r: 214, g: 219, b: 214 },
    { x: 31, y: 331, r: 214, g: 219, b: 214 },
], { x: 41, y: 320 }, // back btn
{ x: 41, y: 320 });
var weeklyMissionBoxBtns = {
    openBox: { x: 418, y: 325 },
    receiveReward: { x: 561, y: 326 },
};
var weeklyMissionBoxConfirm = new Rerouter_1.Page('weeklyMissionBoxConfirm', [
    // bg
    { x: 111, y: 42, r: 181, g: 186, b: 189 },
    { x: 117, y: 304, r: 214, g: 219, b: 222 },
    { x: 515, y: 300, r: 214, g: 219, b: 222 },
    { x: 519, y: 177, r: 181, g: 186, b: 189 },
    // title
    { x: 240, y: 58, r: 155, g: 160, b: 163 },
    { x: 267, y: 58, r: 141, g: 147, b: 149 },
    { x: 325, y: 59, r: 161, g: 167, b: 170 },
    { x: 383, y: 59, r: 171, g: 179, b: 179 },
    { x: 407, y: 59, r: 181, g: 186, b: 189 },
    // x
    { x: 515, y: 49, r: 187, g: 185, b: 188 },
    { x: 519, y: 55, r: 91, g: 91, b: 92 },
    // no & yes btn
    { x: 210, y: 293, r: 41, g: 81, b: 123 },
    { x: 238, y: 296, r: 45, g: 81, b: 128 },
    { x: 284, y: 294, r: 41, g: 78, b: 123 },
    { x: 397, y: 299, r: 40, g: 134, b: 253 },
    { x: 433, y: 307, r: 8, g: 98, b: 247 },
], { x: 387, y: 300 }, // yes btn
{ x: 387, y: 300 });
var weeklyMissionBoxReceived = new Rerouter_1.Page('weeklyMissionBoxReceived', [
    // bg
    { x: 113, y: 53, r: 181, g: 186, b: 189 },
    { x: 117, y: 307, r: 214, g: 219, b: 222 },
    { x: 496, y: 299, r: 214, g: 219, b: 222 },
    // title
    { x: 217, y: 55, r: 181, g: 186, b: 189 },
    { x: 259, y: 55, r: 177, g: 181, b: 185 },
    { x: 298, y: 59, r: 181, g: 186, b: 189 },
    { x: 341, y: 60, r: 120, g: 124, b: 128 },
    { x: 386, y: 58, r: 16, g: 24, b: 33 },
    { x: 407, y: 58, r: 181, g: 186, b: 189 },
    // x
    { x: 512, y: 47, r: 181, g: 186, b: 182 },
    { x: 519, y: 53, r: 71, g: 70, b: 71 },
    // ok btn
    { x: 288, y: 297, r: 8, g: 122, b: 255 },
    { x: 320, y: 300, r: 136, g: 190, b: 255 },
    { x: 364, y: 301, r: 8, g: 114, b: 248 },
], { x: 320, y: 300 }, // ok btn
{ x: 320, y: 300 });
var maxCurrencyAlert = new Rerouter_1.Page('maxCurrencyAlert', [
    // max currency alert title
    { x: 232, y: 46, r: 197, g: 198, b: 206 },
    { x: 274, y: 52, r: 137, g: 139, b: 146 },
    { x: 314, y: 53, r: 197, g: 198, b: 206 },
    { x: 376, y: 53, r: 16, g: 24, b: 33 },
    { x: 395, y: 53, r: 16, g: 24, b: 33 },
    { x: 455, y: 55, r: 197, g: 198, b: 206 },
    // x
    { x: 605, y: 44, r: 74, g: 72, b: 74 },
    // ok
    { x: 292, y: 312, r: 8, g: 105, b: 247 },
    { x: 323, y: 309, r: 254, g: 254, b: 255 },
    { x: 361, y: 312, r: 8, g: 105, b: 247 },
], { x: 605, y: 46 }, // x
{ x: 605, y: 46 });


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isSameColorCount = exports.getColorCountInRange = exports.getPointsInRange = exports.isSameColor = exports.arrayFind = exports.endsWith = exports.executeCommands = exports.SavePageReference = exports.isImageMatchColorCnt = void 0;
var Rerouter_1 = __webpack_require__(/*! Rerouter */ "./node_modules/Rerouter/dist/index.js");
function isImageMatchColorCnt(img, colorCnts) {
    for (var _i = 0, colorCnts_1 = colorCnts; _i < colorCnts_1.length; _i++) {
        var _a = colorCnts_1[_i], leftTop = _a[0], rightBottom = _a[1], colorCntExpected = _a[2];
        var colorCnt = getColorCountInRange(img, leftTop, rightBottom);
        for (var _b = 0, _c = Object.keys(colorCntExpected); _b < _c.length; _b++) {
            var k = _c[_b];
            var expected = colorCntExpected[k];
            var actual = colorCnt[k] || 0;
            if (Math.abs(expected - actual) > 2) {
                console.log("".concat(k, " expected ").concat(expected, " actual ").concat(actual));
                return false;
            }
        }
    }
    return true;
}
exports.isImageMatchColorCnt = isImageMatchColorCnt;
function SavePageReference(img, page) {
    var name = page.name, points = page.points;
    var radius = 3;
    var rgba = [255, 20, 147, 0];
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var _a = points_1[_i], x = _a.x, y = _a.y;
        drawCircle.apply(void 0, __spreadArray([img, x, y, radius], rgba, false));
    }
    saveImage(img, "/sdcard/Pictures/Screenshots/robotmon/mlb/".concat(name, ".png"));
    console.log("[SavePageReference]: ".concat(name));
}
exports.SavePageReference = SavePageReference;
function executeCommands() {
    var commands = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        commands[_i] = arguments[_i];
    }
    var results = [];
    for (var _a = 0, commands_1 = commands; _a < commands_1.length; _a++) {
        var command = commands_1[_a];
        var res = execute(command);
        if (endsWith(res, 'exit status 1')) {
            console.log("[Error]: ".concat(command, " :\n ").concat(res, "\n"));
        }
        else {
            // console.log(`[Ok]: ${command} :\n ${res}\n`);
            console.log("[Ok]: ".concat(command));
        }
        results.push(res);
    }
    return results;
}
exports.executeCommands = executeCommands;
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
exports.endsWith = endsWith;
function arrayFind(arr, condition) {
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var el = arr_1[_i];
        if (condition(el)) {
            return el;
        }
    }
    return undefined;
}
exports.arrayFind = arrayFind;
function isSameColor(image, target, thres) {
    if (thres === void 0) { thres = 0.8; }
    var imageRGB;
    if ('r' in image) {
        // image is RGB
        imageRGB = image;
    }
    else if ('x' in target) {
        // image is Image, target is XYRGB
        imageRGB = getImageColor(image, target.x, target.y);
    }
    if (imageRGB === undefined) {
        throw new Error('target is not XYRGB');
    }
    var score = Rerouter_1.Utils.identityColor(imageRGB, target);
    return score > thres;
}
exports.isSameColor = isSameColor;
function getPointsInRange(image, leftTop, rightBottom) {
    var points = [];
    var x1 = leftTop.x, y1 = leftTop.y;
    var x2 = rightBottom.x, y2 = rightBottom.y;
    for (var x = x1; x <= x2; x++) {
        for (var y = y1; y <= y2; y++) {
            var _a = getImageColor(image, x, y), r = _a.r, g = _a.g, b = _a.b;
            points.push({ x: x, y: y, r: r, g: g, b: b });
        }
    }
    return points;
}
exports.getPointsInRange = getPointsInRange;
function getColorCountInRange(image, leftTop, rightBottom) {
    var cnt = {};
    var x1 = leftTop.x, y1 = leftTop.y;
    var x2 = rightBottom.x, y2 = rightBottom.y;
    for (var x = x1; x <= x2; x++) {
        for (var y = y1; y <= y2; y++) {
            var _a = getImageColor(image, x, y), r = _a.r, g = _a.g, b = _a.b;
            var color = "".concat(r, "-").concat(g, "-").concat(b);
            if (cnt[color] === undefined) {
                cnt[color] = 0;
            }
            cnt[color]++;
        }
    }
    return cnt;
}
exports.getColorCountInRange = getColorCountInRange;
function isSameColorCount(cnt1, cnt2) {
    var keys1 = Object.keys(cnt1);
    var keys2 = Object.keys(cnt2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
        var key = keys1_1[_i];
        if (cnt1[key] !== cnt2[key]) {
            return false;
        }
    }
    return true;
}
exports.isSameColorCount = isSameColorCount;


/***/ }),

/***/ "./src/version.ts":
/*!************************!*\
  !*** ./src/version.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PRODUCTION_VERSION_CODE = exports.GIT_VERSION = void 0;
exports.GIT_VERSION = '240330_1';
exports.PRODUCTION_VERSION_CODE = '15.50';


/***/ }),

/***/ "./node_modules/core-js/es/array/find-index.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/es/array/find-index.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

__webpack_require__(/*! ../../modules/es.array.find-index */ "./node_modules/core-js/modules/es.array.find-index.js");
var entryUnbind = __webpack_require__(/*! ../../internals/entry-unbind */ "./node_modules/core-js/internals/entry-unbind.js");

module.exports = entryUnbind('Array', 'findIndex');


/***/ }),

/***/ "./node_modules/core-js/es/object/assign.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/es/object/assign.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

__webpack_require__(/*! ../../modules/es.object.assign */ "./node_modules/core-js/modules/es.object.assign.js");
var path = __webpack_require__(/*! ../../internals/path */ "./node_modules/core-js/internals/path.js");

module.exports = path.Object.assign;


/***/ }),

/***/ "./node_modules/core-js/internals/a-callable.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/a-callable.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var tryToString = __webpack_require__(/*! ../internals/try-to-string */ "./node_modules/core-js/internals/try-to-string.js");

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a function');
};


/***/ }),

/***/ "./node_modules/core-js/internals/add-to-unscopables.js":
/*!**************************************************************!*\
  !*** ./node_modules/core-js/internals/add-to-unscopables.js ***!
  \**************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var create = __webpack_require__(/*! ../internals/object-create */ "./node_modules/core-js/internals/object-create.js");
var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js").f);

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ "./node_modules/core-js/internals/an-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/an-object.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError($String(argument) + ' is not an object');
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-includes.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/array-includes.js ***!
  \**********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toAbsoluteIndex = __webpack_require__(/*! ../internals/to-absolute-index */ "./node_modules/core-js/internals/to-absolute-index.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "./node_modules/core-js/internals/length-of-array-like.js");

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-iteration.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/array-iteration.js ***!
  \***********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var bind = __webpack_require__(/*! ../internals/function-bind-context */ "./node_modules/core-js/internals/function-bind-context.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "./node_modules/core-js/internals/length-of-array-like.js");
var arraySpeciesCreate = __webpack_require__(/*! ../internals/array-species-create */ "./node_modules/core-js/internals/array-species-create.js");

var push = uncurryThis([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that);
    var length = lengthOfArrayLike(self);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod(7)
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-species-constructor.js":
/*!*********************************************************************!*\
  !*** ./node_modules/core-js/internals/array-species-constructor.js ***!
  \*********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var isArray = __webpack_require__(/*! ../internals/is-array */ "./node_modules/core-js/internals/is-array.js");
var isConstructor = __webpack_require__(/*! ../internals/is-constructor */ "./node_modules/core-js/internals/is-constructor.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var SPECIES = wellKnownSymbol('species');
var $Array = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-species-create.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/array-species-create.js ***!
  \****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var arraySpeciesConstructor = __webpack_require__(/*! ../internals/array-species-constructor */ "./node_modules/core-js/internals/array-species-constructor.js");

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/classof-raw.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/classof-raw.js ***!
  \*******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};


/***/ }),

/***/ "./node_modules/core-js/internals/classof.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/classof.js ***!
  \***************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var TO_STRING_TAG_SUPPORT = __webpack_require__(/*! ../internals/to-string-tag-support */ "./node_modules/core-js/internals/to-string-tag-support.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var classofRaw = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/copy-constructor-properties.js":
/*!***********************************************************************!*\
  !*** ./node_modules/core-js/internals/copy-constructor-properties.js ***!
  \***********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var ownKeys = __webpack_require__(/*! ../internals/own-keys */ "./node_modules/core-js/internals/own-keys.js");
var getOwnPropertyDescriptorModule = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");

module.exports = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-non-enumerable-property.js":
/*!**************************************************************************!*\
  !*** ./node_modules/core-js/internals/create-non-enumerable-property.js ***!
  \**************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-property-descriptor.js":
/*!**********************************************************************!*\
  !*** ./node_modules/core-js/internals/create-property-descriptor.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/define-built-in.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/define-built-in.js ***!
  \***********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var makeBuiltIn = __webpack_require__(/*! ../internals/make-built-in */ "./node_modules/core-js/internals/make-built-in.js");
var defineGlobalProperty = __webpack_require__(/*! ../internals/define-global-property */ "./node_modules/core-js/internals/define-global-property.js");

module.exports = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/define-global-property.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/define-global-property.js ***!
  \******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ "./node_modules/core-js/internals/descriptors.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/descriptors.js ***!
  \*******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/document-all.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/document-all.js ***!
  \********************************************************/
/***/ (function(module) {

"use strict";

var documentAll = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var IS_HTMLDDA = typeof documentAll == 'undefined' && documentAll !== undefined;

module.exports = {
  all: documentAll,
  IS_HTMLDDA: IS_HTMLDDA
};


/***/ }),

/***/ "./node_modules/core-js/internals/document-create-element.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/document-create-element.js ***!
  \*******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ "./node_modules/core-js/internals/engine-user-agent.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/engine-user-agent.js ***!
  \*************************************************************/
/***/ (function(module) {

"use strict";

module.exports = typeof navigator != 'undefined' && String(navigator.userAgent) || '';


/***/ }),

/***/ "./node_modules/core-js/internals/engine-v8-version.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/engine-v8-version.js ***!
  \*************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var userAgent = __webpack_require__(/*! ../internals/engine-user-agent */ "./node_modules/core-js/internals/engine-user-agent.js");

var process = global.process;
var Deno = global.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;


/***/ }),

/***/ "./node_modules/core-js/internals/entry-unbind.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/entry-unbind.js ***!
  \********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");

module.exports = function (CONSTRUCTOR, METHOD) {
  return uncurryThis(global[CONSTRUCTOR].prototype[METHOD]);
};


/***/ }),

/***/ "./node_modules/core-js/internals/enum-bug-keys.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/enum-bug-keys.js ***!
  \*********************************************************/
/***/ (function(module) {

"use strict";

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ "./node_modules/core-js/internals/export.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/export.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var getOwnPropertyDescriptor = (__webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js").f);
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "./node_modules/core-js/internals/define-built-in.js");
var defineGlobalProperty = __webpack_require__(/*! ../internals/define-global-property */ "./node_modules/core-js/internals/define-global-property.js");
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "./node_modules/core-js/internals/copy-constructor-properties.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "./node_modules/core-js/internals/is-forced.js");

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/fails.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/internals/fails.js ***!
  \*************************************************/
/***/ (function(module) {

"use strict";

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-bind-context.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/function-bind-context.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this-clause */ "./node_modules/core-js/internals/function-uncurry-this-clause.js");
var aCallable = __webpack_require__(/*! ../internals/a-callable */ "./node_modules/core-js/internals/a-callable.js");
var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "./node_modules/core-js/internals/function-bind-native.js");

var bind = uncurryThis(uncurryThis.bind);

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-bind-native.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/function-bind-native.js ***!
  \****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});


/***/ }),

/***/ "./node_modules/core-js/internals/function-call.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/function-call.js ***!
  \*********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "./node_modules/core-js/internals/function-bind-native.js");

var call = Function.prototype.call;

module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-name.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/function-name.js ***!
  \*********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-uncurry-this-clause.js":
/*!************************************************************************!*\
  !*** ./node_modules/core-js/internals/function-uncurry-this-clause.js ***!
  \************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var classofRaw = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-uncurry-this.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/function-uncurry-this.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "./node_modules/core-js/internals/function-bind-native.js");

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-built-in.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/get-built-in.js ***!
  \********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global[namespace]) : global[namespace] && global[namespace][method];
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-method.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/get-method.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var aCallable = __webpack_require__(/*! ../internals/a-callable */ "./node_modules/core-js/internals/a-callable.js");
var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "./node_modules/core-js/internals/is-null-or-undefined.js");

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};


/***/ }),

/***/ "./node_modules/core-js/internals/global.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/global.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || this || Function('return this')();


/***/ }),

/***/ "./node_modules/core-js/internals/has-own-property.js":
/*!************************************************************!*\
  !*** ./node_modules/core-js/internals/has-own-property.js ***!
  \************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};


/***/ }),

/***/ "./node_modules/core-js/internals/hidden-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/hidden-keys.js ***!
  \*******************************************************/
/***/ (function(module) {

"use strict";

module.exports = {};


/***/ }),

/***/ "./node_modules/core-js/internals/html.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/html.js ***!
  \************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ "./node_modules/core-js/internals/ie8-dom-define.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/ie8-dom-define.js ***!
  \**********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/indexed-object.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/indexed-object.js ***!
  \**********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;


/***/ }),

/***/ "./node_modules/core-js/internals/inspect-source.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/inspect-source.js ***!
  \**********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ "./node_modules/core-js/internals/internal-state.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/internal-state.js ***!
  \**********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var NATIVE_WEAK_MAP = __webpack_require__(/*! ../internals/weak-map-basic-detection */ "./node_modules/core-js/internals/weak-map-basic-detection.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var shared = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = global.TypeError;
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-array.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/is-array.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-callable.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/is-callable.js ***!
  \*******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var $documentAll = __webpack_require__(/*! ../internals/document-all */ "./node_modules/core-js/internals/document-all.js");

var documentAll = $documentAll.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = $documentAll.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-constructor.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/is-constructor.js ***!
  \**********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var classof = __webpack_require__(/*! ../internals/classof */ "./node_modules/core-js/internals/classof.js");
var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "./node_modules/core-js/internals/inspect-source.js");

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = uncurryThis(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
module.exports = !construct || fails(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;


/***/ }),

/***/ "./node_modules/core-js/internals/is-forced.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-forced.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ "./node_modules/core-js/internals/is-null-or-undefined.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/is-null-or-undefined.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-object.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var $documentAll = __webpack_require__(/*! ../internals/document-all */ "./node_modules/core-js/internals/document-all.js");

var documentAll = $documentAll.all;

module.exports = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-pure.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/is-pure.js ***!
  \***************************************************/
/***/ (function(module) {

"use strict";

module.exports = false;


/***/ }),

/***/ "./node_modules/core-js/internals/is-symbol.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-symbol.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var isPrototypeOf = __webpack_require__(/*! ../internals/object-is-prototype-of */ "./node_modules/core-js/internals/object-is-prototype-of.js");
var USE_SYMBOL_AS_UID = __webpack_require__(/*! ../internals/use-symbol-as-uid */ "./node_modules/core-js/internals/use-symbol-as-uid.js");

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};


/***/ }),

/***/ "./node_modules/core-js/internals/length-of-array-like.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/length-of-array-like.js ***!
  \****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/make-built-in.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/make-built-in.js ***!
  \*********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var CONFIGURABLE_FUNCTION_NAME = (__webpack_require__(/*! ../internals/function-name */ "./node_modules/core-js/internals/function-name.js").CONFIGURABLE);
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "./node_modules/core-js/internals/inspect-source.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis(''.slice);
var replace = uncurryThis(''.replace);
var join = uncurryThis([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');


/***/ }),

/***/ "./node_modules/core-js/internals/math-trunc.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/math-trunc.js ***!
  \******************************************************/
/***/ (function(module) {

"use strict";

var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-assign.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/object-assign.js ***!
  \*********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var call = __webpack_require__(/*! ../internals/function-call */ "./node_modules/core-js/internals/function-call.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "./node_modules/core-js/internals/object-keys.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "./node_modules/core-js/internals/object-get-own-property-symbols.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty = Object.defineProperty;
var concat = uncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
module.exports = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || call(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;


/***/ }),

/***/ "./node_modules/core-js/internals/object-create.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/object-create.js ***!
  \*********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/* global ActiveXObject -- old IE, WSH */
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var definePropertiesModule = __webpack_require__(/*! ../internals/object-define-properties */ "./node_modules/core-js/internals/object-define-properties.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");
var html = __webpack_require__(/*! ../internals/html */ "./node_modules/core-js/internals/html.js");
var documentCreateElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-define-properties.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/object-define-properties.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(/*! ../internals/v8-prototype-define-bug */ "./node_modules/core-js/internals/v8-prototype-define-bug.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "./node_modules/core-js/internals/object-keys.js");

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-define-property.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-define-property.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(/*! ../internals/v8-prototype-define-bug */ "./node_modules/core-js/internals/v8-prototype-define-bug.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "./node_modules/core-js/internals/to-property-key.js");

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-descriptor.js":
/*!******************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-descriptor.js ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var call = __webpack_require__(/*! ../internals/function-call */ "./node_modules/core-js/internals/function-call.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "./node_modules/core-js/internals/to-property-key.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-names.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-names.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-symbols.js":
/*!***************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-symbols.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ "./node_modules/core-js/internals/object-is-prototype-of.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-is-prototype-of.js ***!
  \******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");

module.exports = uncurryThis({}.isPrototypeOf);


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys-internal.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys-internal.js ***!
  \****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var indexOf = (__webpack_require__(/*! ../internals/array-includes */ "./node_modules/core-js/internals/array-includes.js").indexOf);
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys.js ***!
  \*******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-property-is-enumerable.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-property-is-enumerable.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;


/***/ }),

/***/ "./node_modules/core-js/internals/ordinary-to-primitive.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/ordinary-to-primitive.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var call = __webpack_require__(/*! ../internals/function-call */ "./node_modules/core-js/internals/function-call.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw new $TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "./node_modules/core-js/internals/own-keys.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/own-keys.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");
var getOwnPropertyNamesModule = __webpack_require__(/*! ../internals/object-get-own-property-names */ "./node_modules/core-js/internals/object-get-own-property-names.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "./node_modules/core-js/internals/object-get-own-property-symbols.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ "./node_modules/core-js/internals/path.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/path.js ***!
  \************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

module.exports = global;


/***/ }),

/***/ "./node_modules/core-js/internals/require-object-coercible.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/require-object-coercible.js ***!
  \********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "./node_modules/core-js/internals/is-null-or-undefined.js");

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-key.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/shared-key.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-store.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/shared-store.js ***!
  \********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var defineGlobalProperty = __webpack_require__(/*! ../internals/define-global-property */ "./node_modules/core-js/internals/define-global-property.js");

var SHARED = '__core-js_shared__';
var store = global[SHARED] || defineGlobalProperty(SHARED, {});

module.exports = store;


/***/ }),

/***/ "./node_modules/core-js/internals/shared.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/shared.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.33.1',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.33.1/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});


/***/ }),

/***/ "./node_modules/core-js/internals/symbol-constructor-detection.js":
/*!************************************************************************!*\
  !*** ./node_modules/core-js/internals/symbol-constructor-detection.js ***!
  \************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = __webpack_require__(/*! ../internals/engine-v8-version */ "./node_modules/core-js/internals/engine-v8-version.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

var $String = global.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});


/***/ }),

/***/ "./node_modules/core-js/internals/to-absolute-index.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-absolute-index.js ***!
  \*************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "./node_modules/core-js/internals/to-integer-or-infinity.js");

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-indexed-object.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-indexed-object.js ***!
  \*************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-integer-or-infinity.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/to-integer-or-infinity.js ***!
  \******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var trunc = __webpack_require__(/*! ../internals/math-trunc */ "./node_modules/core-js/internals/math-trunc.js");

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-length.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-length.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "./node_modules/core-js/internals/to-integer-or-infinity.js");

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-object.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-primitive.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/to-primitive.js ***!
  \********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var call = __webpack_require__(/*! ../internals/function-call */ "./node_modules/core-js/internals/function-call.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "./node_modules/core-js/internals/is-symbol.js");
var getMethod = __webpack_require__(/*! ../internals/get-method */ "./node_modules/core-js/internals/get-method.js");
var ordinaryToPrimitive = __webpack_require__(/*! ../internals/ordinary-to-primitive */ "./node_modules/core-js/internals/ordinary-to-primitive.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-property-key.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/to-property-key.js ***!
  \***********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "./node_modules/core-js/internals/is-symbol.js");

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-string-tag-support.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/to-string-tag-support.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),

/***/ "./node_modules/core-js/internals/try-to-string.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/try-to-string.js ***!
  \*********************************************************/
/***/ (function(module) {

"use strict";

var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/uid.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/internals/uid.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "./node_modules/core-js/internals/function-uncurry-this.js");

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.0.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};


/***/ }),

/***/ "./node_modules/core-js/internals/use-symbol-as-uid.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/use-symbol-as-uid.js ***!
  \*************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "./node_modules/core-js/internals/symbol-constructor-detection.js");

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ "./node_modules/core-js/internals/v8-prototype-define-bug.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/v8-prototype-define-bug.js ***!
  \*******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});


/***/ }),

/***/ "./node_modules/core-js/internals/weak-map-basic-detection.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/weak-map-basic-detection.js ***!
  \********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));


/***/ }),

/***/ "./node_modules/core-js/internals/well-known-symbol.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/well-known-symbol.js ***!
  \*************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "./node_modules/core-js/internals/symbol-constructor-detection.js");
var USE_SYMBOL_AS_UID = __webpack_require__(/*! ../internals/use-symbol-as-uid */ "./node_modules/core-js/internals/use-symbol-as-uid.js");

var Symbol = global.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),

/***/ "./node_modules/core-js/modules/es.array.find-index.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/modules/es.array.find-index.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var $findIndex = (__webpack_require__(/*! ../internals/array-iteration */ "./node_modules/core-js/internals/array-iteration.js").findIndex);
var addToUnscopables = __webpack_require__(/*! ../internals/add-to-unscopables */ "./node_modules/core-js/internals/add-to-unscopables.js");

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-findindex -- testing
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND_INDEX);


/***/ }),

/***/ "./node_modules/core-js/modules/es.object.assign.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/modules/es.object.assign.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var assign = __webpack_require__(/*! ../internals/object-assign */ "./node_modules/core-js/internals/object-assign.js");

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
$({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign }, {
  assign: assign
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
var exports = __webpack_exports__;
/*!******************!*\
  !*** ./index.ts ***!
  \******************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stop = exports.start = void 0;
var src_1 = __webpack_require__(/*! ./src */ "./src/index.ts");
var mlb9i;
function start(jsonConfig) {
    mlb9i = new src_1.MLB9I(jsonConfig);
    mlb9i.start();
}
exports.start = start;
function stop() {
    if (mlb9i === undefined) {
        return;
    }
    mlb9i.stop();
    mlb9i = undefined;
}
exports.stop = stop;
window.start = start;
window.stop = stop;

}();
/******/ })()
;
function start(jsonConfig){window.start(jsonConfig);}
function stop(){window.stop();}
