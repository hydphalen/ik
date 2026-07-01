package com.example.amappurify.hooks

import de.robv.android.xposed.XposedHelpers
import de.robv.android.xposed.callbacks.XC_LoadPackage
import com.example.amappurify.utils.JsonFilter

object NetworkHook {
    fun hook(lpparam: XC_LoadPackage.LoadPackageParam) {
        try {
            val gsonClass = XposedHelpers.findClass(
                "com.google.gson.Gson",
                lpparam.classLoader
            )

            XposedHelpers.findAndHookMethod(
                gsonClass,
                "fromJson",
                String::class.java,
                java.lang.reflect.Type::class.java,
                object : de.robv.android.xposed.XC_MethodHook() {
                    override fun beforeHookedMethod(param: MethodHookParam) {
                        val json = param.args[0] as? String ?: return
                        if (json.contains("modules") || json.contains("feeds")) {
                            param.args[0] = JsonFilter.filter(json)
                        }
                    }
                }
            )
        } catch (e: Exception) {
            // Ignore
        }
    }
}
