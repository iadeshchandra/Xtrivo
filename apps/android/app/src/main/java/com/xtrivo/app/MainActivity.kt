package com.xtrivo.app

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

/**
 * Stage 1 scaffolding activity. The real download-manager UI (Stage 2/4)
 * replaces this with the Jetpack navigation graph.
 */
class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val label = TextView(this).apply {
            text = "XTRIVO — Stage 1 scaffolding"
            textSize = 20f
            setPadding(48, 48, 48, 48)
        }
        setContentView(label)
    }
}
