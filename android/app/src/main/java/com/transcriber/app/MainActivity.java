package com.transcriber.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void start() {
        WebView.setWebContentsDebuggingEnabled(true);
        super.start();
    }
}
