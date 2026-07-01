function (res) {
  var tipKey = 'tip{%APP_ID%}'
  function showToast(res) {
    if (res && res.error == 6) {
      AlipayJSBridge.call('toast', {
        content: '{%APP_NAME%}快捷方式已存在',
        duration: 2000
      }, function () {

      });
    } else if (res && res.error == 7) {
      AlipayJSBridge.call('toast', {
        content: '已取消添加',
        duration: 2000
      }, function () {

      });
    } else if (res && res.success) {
      AlipayJSBridge.call('toast', {
        content: '已添加',
        duration: 2000
      }, function () {

      });
    }
  }
  if (navigator.userAgent && navigator.userAgent.indexOf('iPhone') < 0) {
    AlipayJSBridge.call('getAPDataStorage', {
      type: "user",
      business: "setShortCut",
      key: tipKey,
    }, function (result) {
      if (result.data != '1') {
        AlipayJSBridge.call('setAPDataStorage', {
          type: "user",
          business: "setShortCut",
          key: tipKey,
          value: '1'
        }, function (result) {
        });

        if (res && res.showDetailDialog) {
          if (res.needShowToast) {
            showToast(res)
          }
          return;
        }

        AlipayJSBridge.call('alert', {
          title: '提示',
          message: '已尝试添加到桌面，如果在桌面未能找到该小程序的图标，请检查系统权限设置中是否开启了“创建桌面快捷方式”功能 ',
          button: '确定'
        }, function (e) {
        });
      } else {
        if (res && res.showDetailDialog) {
          if (res.needShowToast) {
            showToast(res)
          }
          return;
        }
        showToast(res)
      }
    });
  }
}