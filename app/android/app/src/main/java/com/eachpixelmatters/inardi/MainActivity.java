package com.eachpixelmatters.inardi;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // let the studio sting and the music start without waiting for a first tap
        WebSettings s = this.bridge.getWebView().getSettings();
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);   // ignore the phone's font-size setting so the layout stays as designed
    }
}
