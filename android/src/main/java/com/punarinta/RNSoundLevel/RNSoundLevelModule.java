package com.punarinta.RNSoundLevel;

import android.media.MediaRecorder;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Timer;
import java.util.TimerTask;

class RNSoundLevelModule extends ReactContextBaseJavaModule {

    private static final String TAG = "RNSoundLevel";

    private MediaRecorder recorder;
    private boolean isRecording = false;
    private Timer timer;
    private int frameId = 0;

    @SuppressWarnings("WeakerAccess")
    public RNSoundLevelModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNSoundLevelModule";
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void start(Promise promise) {
        if (isRecording) {
            logAndRejectPromise(promise, "INVALID_STATE", "Please call stop before starting");
            return;
        }

        recorder = new MediaRecorder();
        try {
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setAudioSamplingRate(22050);
            recorder.setAudioChannels(1);
            recorder.setAudioEncodingBitRate(32000);
            recorder.setOutputFile(this.getReactApplicationContext().getCacheDir().getAbsolutePath() + "/soundlevel");
        } catch (final Exception e) {
            logAndRejectPromise(promise, "COULDNT_CONFIGURE_MEDIA_RECORDER", "Make sure you've added RECORD_AUDIO permission to your AndroidManifest.xml file " + e.getMessage());
            return;
        }

        try {
            recorder.prepare();
        } catch (final Exception e) {
            logAndRejectPromise(promise, "COULDNT_PREPARE_RECORDING", e.getMessage());
        }

        recorder.start();

        frameId = 0;
        isRecording = true;
        startTimer();
        promise.resolve(true);
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void stop(Promise promise) {
        if (!isRecording) {
            logAndRejectPromise(promise, "INVALID_STATE", "Please call start before stopping recording");
            return;
        }

        stopTimer();
        isRecording = false;

        try {
            recorder.stop();
            recorder.release();
        } catch (final RuntimeException e) {
            logAndRejectPromise(promise, "RUNTIME_EXCEPTION", "No valid audio data received. You may be using a device that can't record audio.");
            return;
        } finally {
            recorder = null;
        }

        promise.resolve(true);
    }

    private void startTimer() {
        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {

                WritableMap body = Arguments.createMap();
                body.putDouble("id", frameId++);

                int amplitude = recorder.getMaxAmplitude();
                body.putInt("rawValue", amplitude);
                if (amplitude == 0) {
                    body.putInt("value", -160);
                } else {
                    body.putInt("value", (int) (20 * Math.log(((double) amplitude) / 32767d)));
                }
                sendEvent(body);
            }
        }, 0, 250);
    }

    private void stopTimer() {
        if (timer != null) {
            timer.cancel();
            timer.purge();
            timer = null;
        }
    }

    private void sendEvent(Object params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("frame", params);
    }

    private void logAndRejectPromise(Promise promise, String errorCode, String errorMessage) {
        Log.e(TAG, errorMessage);
        promise.reject(errorCode, errorMessage);
    }
}
