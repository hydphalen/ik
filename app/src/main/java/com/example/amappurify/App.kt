package com.example.amappurify

import de.robv.android.xposed.IXposedHookLoadPackage
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.callbacks.XC_LoadPackage
import com.example.amappurify.hooks.NetworkHook

class App : IXposedHookLoadPackage {
    override fun handleLoadPackage(lpparam: XC_LoadPackage.LoadPackageParam) {
        if (lpparam.packageName == "com.amap.android.services") {
            try {
                NetworkHook.hook(lpparam)
            } catch (e: Exception) {
                XposedBridge.log(e)
            }
        }
    }
}
