# 开发指南

## 下一步

1. 反编译APK确认实际的Hook点
2. 根据反编译结果更新类名
3. 添加更多Hook策略
4. 测试验证

## 反编译命令

```bash
jadx -d decompiled/ classes*.dex
```

## 调试日志

```bash
adb logcat | grep AmapPurify
```
