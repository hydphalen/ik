package com.example.amappurify.utils

import org.json.JSONObject
import org.json.JSONArray

object JsonFilter {
    private val BLOCK_MODULES = setOf(
        "loan", "car_sell", "insurance", "finance_ad"
    )
    private val BLOCK_CARDS = setOf(
        "ai_chat", "ai_assistant", "ad_banner", "shopping", "promotion"
    )

    fun filter(jsonString: String): String {
        return try {
            val obj = JSONObject(jsonString)
            filterObject(obj)
            obj.toString()
        } catch (e: Exception) {
            jsonString
        }
    }

    private fun filterObject(obj: JSONObject) {
        val keys = obj.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            when (key.lowercase()) {
                "modules" -> filterArray(obj.optJSONArray(key), BLOCK_MODULES)
                "feeds" -> filterArray(obj.optJSONArray(key), BLOCK_CARDS)
            }
        }
    }

    private fun filterArray(array: JSONArray?, blockTypes: Set<String>) {
        array ?: return
        var i = array.length() - 1
        while (i >= 0) {
            val item = array.optJSONObject(i)
            if (item != null) {
                val type = item.optString("type", "")
                if (blockTypes.contains(type)) {
                    array.remove(i)
                }
            }
            i--
        }
    }
}
