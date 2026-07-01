# LSPosed模块开发指南 - 高德地图净化

## 项目结构

```
amap-purify-module/
├── app/                          # LSPosed模块App
│   ├── src/main/
│   │   ├── java/com/example/amappurify/
│   │   │   ├── App.kt                    # 模块入口
│   │   │   ├── hooks/
│   │   │   │   ├── NetworkHook.kt       # 网络层Hook
│   │   │   │   ├── DataModelHook.kt     # 数据模型Hook
│   │   │   │   ├── UIComponentHook.kt   # UI组件Hook（备用）n│   │   │   │   └── RouteHook.kt         # 路由Hook
│   │   │   ├── utils/
│   │   │   │   ├── JsonFilter.kt        # JSON过滤工具
│   │   │   │   ├── ClassLoader.kt       # 类加载辅助
│   │   │   │   └── Logger.kt            # 日志
│   │   │   └── config/
│   │   │       └── FilterConfig.kt      # 配置管理
│   │   ├── resources/
│   │   │   └── strings.xml
│   │   └── AndroidManifest.xml
│   ├── build.gradle
│   └── ...
├── module.prop                    # LSPosed模块配置
├── common/                        # 模块公共库
└── README.md
```

## 核心Hook策略

### 1. 网络层拦截（优先）

**目标**: 在JSON数据被解析前，删除不需要的数据节点

**Hook点**:
```java
// Gson解析Hook
HookGsonFromJson();

// 或 OkHttp拦截器Hook
HookOkHttpResponseBody();
```

**实现伪代码**:
```java
// 拦截Gson.fromJson()
XposedHelpers.findAndHookMethod(
    "com.google.gson.Gson",
    lpparam.classLoader,
    "fromJson",
    String.class,
    Type.class,
    new XC_MethodHook() {
        @Override
        protected void beforeHookedMethod(MethodHookParam param) {
            String json = (String) param.args[0];
            // 检查是否是个人页/首页数据
            if (json.contains("modules") || json.contains("feeds")) {
                // 过滤不需要的模块
                json = filterJson(json);
                param.args[0] = json;
            }
        }
    }
);
```

### 2. 数据模型Hook（需要反编译后确认）

**目标**: Hook数据Model类的setter，过滤不需要的字段

**伪代码**:
```java
// Hook个人页数据model
HookDataModel("com.amap.profile.UserProfileModel", new Filter() {
    public void filter(Object model) {
        // 删除金融模块
        ReflectionUtils.setFieldValue(model, "loanModule", null);
        ReflectionUtils.setFieldValue(model, "carSellModule", null);
    }
});
```

### 3. JSON过滤工具

**功能**: 删除JSON中特定的key-value对

```java
private String filterJson(String json) {
    try {
        JSONObject obj = new JSONObject(json);
        
        // 删除个人页的金融模块
        if (obj.has("modules")) {
            JSONArray modules = obj.getJSONArray("modules");
            JSONArray filtered = new JSONArray();
            
            for (int i = 0; i < modules.length(); i++) {
                JSONObject module = modules.getJSONObject(i);
                String type = module.optString("type", "");
                
                // 黑名单过滤
                if (!BLOCK_MODULE_TYPES.contains(type)) {
                    filtered.put(module);
                }
            }
            obj.put("modules", filtered);
        }
        
        // 删除首页推荐卡片
        if (obj.has("feeds")) {
            JSONArray feeds = obj.getJSONArray("feeds");
            JSONArray filtered = new JSONArray();
            
            for (int i = 0; i < feeds.length(); i++) {
                JSONObject feed = feeds.getJSONObject(i);
                String cardType = feed.optString("cardType", "");
                
                if (!BLOCK_CARD_TYPES.contains(cardType)) {
                    filtered.put(feed);
                }
            }
            obj.put("feeds", filtered);
        }
        
        return obj.toString();
    } catch (Exception e) {
        Log.e("FilterJson", "Error filtering JSON", e);
        return json; // 返回原始JSON
    }
}

private static final Set<String> BLOCK_MODULE_TYPES = new HashSet<>(Arrays.asList(
    "loan",          // 借钱
    "car_sell",      // 卖车
    "insurance",     // 保险
    "finance_ad"     // 金融广告
));

private static final Set<String> BLOCK_CARD_TYPES = new HashSet<>(Arrays.asList(
    "ai_chat",       // AI对话
    "ad_banner",     // 广告横幅
    "shopping",      // 购物卡片
    "promotion"      // 促销
));
```

## 构建环境要求

```gradle
android {
    compileSdkVersion 34
    targetSdkVersion 34
    minSdkVersion 28
}

dependencies {
    // LSPosed API
    compileOnly 'org.lsposed.hiddenapibypass:hiddenapibypass:4.3'
    compileOnly 'de.robv.android.xposed:api:82'
    
    // JSON处理
    implementation 'com.google.code.gson:gson:2.10.1'
    implementation 'org.json:json:20230227'
    
    // 日志
    implementation 'com.google.code.gson:gson:2.10.1'
    
    // AndroidX
    implementation 'androidx.appcompat:appcompat:1.6.1'
}
```

## 测试流程

1. **安装LSPosed框架**（需要root）
2. **打包模块APK** → 通过LSPosed管理器安装
3. **激活模块** → 选择目标应用（高德地图）
4. **重启手机**
5. **打开高德地图** → 观察个人页/首页是否净化
6. **查看Logcat日志** → 确认Hook是否工作

```bash
# 查看日志
adb logcat | grep AmapPurify
```

## module.prop 配置示例

```properties
id=amap_purify
name=高德地图净化
version=1.0
versionCode=1
author=hydphalen
description=Remove unwanted features from Amap (loan, car sale, AI chat, ads)
scope=com.amap.android.servicesservices
```

## 常见问题

### Q: 如何确保不卡顿？
**A**: 
- 在网络层过滤比UI层更高效
- 使用线程池异步处理JSON
- 缓存过滤结果

### Q: 如何兼容多个高德版本？
**A**:
- 使用Try-Catch捕获反射异常
- 版本检测后选择不同Hook策略
- 记录失败日志便于调试

### Q: LSPosed和Xposed的区别？
**A**:
- LSPosed是Xposed的现代分支
- API基本兼容，但管理方式不同
- LSPosed只支持Android 8+

## 文件说明

- **APK_ANALYSIS.md**: 详细的APK分析报告
- **LSPOSED_MODULE_SETUP.md**: 本文件，模块开发指南
- **反编译文件**: 待添加（见下一节）

---

**更新时间**: 2026-07-01
