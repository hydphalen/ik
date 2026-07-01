# Amap Purify LSPosed Module

高德地图LSPosed净化模块

## 功能

- 移除"借钱"模块
- 移除"卖车"模块
- 移除AI对话
- 移除购物卡片
- 移除广告

## 技术原理

网络层Hook - 在Gson.fromJson()拦截，移除不需要的JSON字段

## 编译

```bash
./gradlew :app:assembleRelease
```

## 安装

1. 通过LSPosed安装
2. 选择高德地图应用
3. 重启手机
