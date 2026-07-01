# 高德地图APK分析报告

## 基本信息

### 应用识别
- **应用包名**: com.amap.android. службы (根据AndroidManifest.xml)
- **主要活动**: 多个Activity，包括地图主界面、个人页等
- **架构**: AJ3（异步JS3）框架 + 原生代码混合
- **DEX文件数量**: 8个（classes.dex - classes8.dex）
- **总DEX大小**: ~97MB（多DEX架构，可能使用MultiDex）

## 依赖分析

### 关键框架库
1. **支付宝SDK** (alipay-api.properties)
   - 位置: 应该有支付相关业务
   - 可能涉及: 借钱、花呗等金融功能

2. **HMS Core** (Huawei Mobile Services)
   - HMSCore-base, HMSCore-ui, HMSCore-device等
   - 推送服务、位置服务等

3. **AndroidAnnotations** 
   - 代码生成框架
   - 可能简化了类名混淆

4. **其他关键库**
   - network-common、network-framework-compat（网络框架）
   - agconnect-core（阿里连接）

## 关键功能模块位置（待反编译确认）

### 1. 数据网络层

**Hook目标**: HTTP/网络请求拦截

```
预期位置:
- com.amap.api.services.* (高德API服务)
- com.amap.api.http.* (HTTP客户端)
- 可能使用OkHttp或自定义HTTP库
```

**策略**: Hook JSON响应解析层，过滤不需要的数据字段

### 2. 个人页模块 (需反编译确认)

**标志**: 包含"借钱"、"卖车"等金融功能入口

**可能的类路径**:
```
com.amap.android.profile.*
com.amap.android.user.*
com.amap.android.mine.*
```

**Hook策略**:
- 拦截个人页数据接口
- 在JSON中删除金融模块数据段
- 或Hook数据Model的setter方法

### 3. 首页模块 (需反编译确认)

**标志**: 包含AI对话、推荐卡片等

**可能的类路径**:
```
com.amap.android.home.*
com.amap.android.recommend.*
com.amap.android.feed.*
```

**Hook策略**:
- 拦截首页推荐数据
- 在业务逻辑层过滤模块

## 网络请求格式（待实际抓包确认）

### 预期API接口

```
个人页:
GET/POST /service/profile or /service/user/mine
Response: JSON
{
  "code": 1000,
  "data": {
    "userInfo": {...},
    "modules": [  // 这里可能包含各个功能入口
      {"type": "loan", "name": "借钱", ...},
      {"type": "car_sell", "name": "卖车", ...},
      ...
    ]
  }
}

首页:
GET /service/home/feeds
Response: JSON数组，包含卡片数据
```

## 反编译状态

| 文件 | 大小 | 反编译进度 | 说明 |
|------|------|----------|------|
| classes.dex | 12.5MB | ⏳ 待开始 | 主要业务逻辑 |
| classes2.dex | 12.5MB | ⏳ 待开始 | 支持库或子模块 |
| classes3.dex | 13.6MB | ⏳ 待开始 | - |
| classes4-8.dex | ~61MB | ⏳ 待开始 | 其他模块 |

## 预期Hook点汇总

### 优先级 1（必须Hook）

1. **网络响应解析**
   - Hook点: JSON解析类（Gson/FastJson）
   - 方法: `fromJson()` 或 `parse()`
   - 操作: 在解析前过滤JSON字符串

2. **个人页数据获取**
   - Hook点: 个人页Activity/Fragment的数据加载方法
   - 方法: `loadUserData()` / `refreshProfile()`
   - 操作: 过滤返回的数据模型

### 优先级 2（可选Hook）

3. **首页推荐流**
   - Hook点: 首页Feed数据管理类
   - 操作: 过滤不需要的卡片类型

4. **业务路由**
   - Hook点: 应用内导航/路由分发器
   - 操作: 阻止金融功能的路由注册

## 下一步行动

- [ ] 反编译所有DEX文件
- [ ] 定位确切的Hook类和方法
- [ ] 获取实际的API响应示例
- [ ] 编写Hook代码
- [ ] 测试和迭代

---

**更新时间**: 2026-07-01
**分析工具**: 基于APK解包内容初步分析
