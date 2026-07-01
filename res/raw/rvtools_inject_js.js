//保证每个页面只注册一次
window.g_RvToolsFetchResourceJsInjectStatus || injectFetchResourceScript();

function injectFetchResourceScript() {
    if (window.AlipayJSBridge) {
        injectFetchResourceScriptInner();
    } else {
        document.addEventListener('AlipayJSBridgeReady', () => {
            injectFetchResourceScriptInner();
        }, false);
    }
}

function injectFetchResourceScriptInner() {
    console.log("start injectFetchResourceScript");
    let isSupportTimingApi = function() {
        let windowPerformance = window.performance;
        if (!windowPerformance) {
            return false;
        } else {
            return true;
        }
    }();

    if(!isSupportTimingApi) {
        console.log("not support performance timing api");
        AlipayJSBridge.call("rvToolsFetchResource", {
            error: true,
            errorCode: 18615748219,
            errorMsg: "not support performance timing api"
        });
        return;
    } else {
        console.log("support performance timing api");
    }

    /*
    目前的实现方式为页面隐藏后，主动获取一次数据，
    但是这样会存在最后一个页面无法获取的问题，所以这里由native发送一个事件，这样来主动拉一次
    */
    document.addEventListener("rvToolsFetchResourceEvent", function(e) {
        console.log("test finish, send performance info");
        fetchPagePerformance();
    });

    window.g_RvToolsFetchResourceJsInjectStatus = true;
}

function fetchPagePerformance() {
    console.log("start fetch page performance info");
    //因为容器每次通信的数据大小有限制，如果Resource太多的话，可能会导致oom
    AlipayJSBridge.call("rvToolsFetchResource", {
        performanceResourceTiming: fetchPerformanceResourceTiming(),
        pageUrl: location.href,
    });
}


function is(type, obj) {
    var klass = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && klass === type;
}

function fetchPerformanceResourceTiming() {
    /***
     * 返回的结果中包括:
     * PerformanceNavigationTiming、PerformanceResourceTiming、PerformancePaintTiming
     * 这里只留下PerformanceResourceTiming
     */

//    let performanceResourceAfterFilter = entries.filter(function(entry){
//        return is("PerformanceResourceTiming", entry);
//    });

    let resourceEntries = window.performance.getEntriesByType("resource").map(function (entry) {
        return {
            "url": entry["name"],
            "transferSize": entry["transferSize"],
       };
    });
    console.log("after filter count: " + resourceEntries.length)
    return resourceEntries;
}