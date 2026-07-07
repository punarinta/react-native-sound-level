package com.punarinta.RNSoundLevel;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.util.Timer;
import java.util.TimerTask;

import android.media.MediaRecorder;
import android.util.Log;
import com.facebook.react.modules.core.DeviceEventManagerModule;

class RNSoundLevelModule extends ReactContextBaseJavaModule {

  private static final String TAG = "RNSoundLevel";

  private MediaRecorder recorder;
  private File outputFile;
  private boolean isRecording = false;
  private Timer timer;
  private int frameId = 0;

  public RNSoundLevelModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "RNSoundLevelModule";
  }

  @ReactMethod
  public void start(int monitorInterval, int samplingRate, Promise promise) {
    synchronized (this) {
      if (isRecording) {
        logAndRejectPromise(promise, "INVALID_STATE", "Please call stop before starting");
        return;
      }

      recorder = new MediaRecorder();
      try {
        recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
        recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
        recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
        recorder.setAudioSamplingRate(samplingRate);
        recorder.setAudioChannels(1);
        recorder.setAudioEncodingBitRate(32000);
        // The recording itself is never used, only the amplitude is metered,
        // but the MPEG_4 muxer needs a real, seekable file. It is removed
        // in stop() and any stale one is replaced here.
        outputFile = new File(this.getReactApplicationContext().getCacheDir(), "rnsoundlevel.tmp");
        if (outputFile.exists()) {
          outputFile.delete();
        }
        recorder.setOutputFile(outputFile.getAbsolutePath());
      }
      catch(final Exception e) {
        releaseFailedRecorder();
        logAndRejectPromise(promise, "COULDNT_CONFIGURE_MEDIA_RECORDER" , "Make sure: android.permission.RECORD_AUDIO is added to AndroidManifest.xml, user permission to use the microphone is acquired. " + e.getMessage());
        return;
      }

      try {
        recorder.prepare();
      } catch (final Exception e) {
        releaseFailedRecorder();
        logAndRejectPromise(promise, "COULDNT_PREPARE_RECORDING", e.getMessage());
        return;
      }

      try {
        recorder.start();
      } catch (final Exception e) {
        releaseFailedRecorder();
        logAndRejectPromise(promise, "COULDNT_START_RECORDING", e.getMessage());
        return;
      }

      frameId = 0;
      isRecording = true;
    }

    startTimer(monitorInterval);
    promise.resolve(true);
  }

  @ReactMethod
  public void stop(Promise promise) {
    stopTimer();

    synchronized (this) {
      if (!isRecording) {
        logAndRejectPromise(promise, "INVALID_STATE", "Please call start before stopping recording");
        return;
      }

      isRecording = false;

      try {
        recorder.stop();
        recorder.release();
      }
      catch (final RuntimeException e) {
        logAndRejectPromise(promise, "RUNTIME_EXCEPTION", "No valid audio data received. You may be using a device that can't record audio.");
        return;
      }
      finally {
        recorder = null;
        if (outputFile != null) {
          outputFile.delete();
          outputFile = null;
        }
      }
    }

    promise.resolve(true);
  }

  @ReactMethod
  public void addListener(String eventName) {
    // Required by NativeEventEmitter, no-op
  }

  @ReactMethod
  public void removeListeners(double count) {
    // Required by NativeEventEmitter, no-op
  }

  private void releaseFailedRecorder() {
    try {
      recorder.release();
    } catch (final Exception ignored) {
    }

    recorder = null;

    if (outputFile != null) {
      outputFile.delete();
      outputFile = null;
    }
  }

  private void startTimer(int monitorInterval) {
    timer = new Timer();
    timer.scheduleAtFixedRate(new TimerTask() {
      @Override
      public void run() {
        int amplitude;

        synchronized (RNSoundLevelModule.this) {
          if (!isRecording || recorder == null) {
            return;
          }

          try {
            amplitude = recorder.getMaxAmplitude();
          } catch (final IllegalStateException e) {
            return;
          }
        }

        WritableMap body = Arguments.createMap();
        body.putDouble("id", frameId++);

        if (amplitude == 0) {
          body.putInt("value", -160);
          body.putInt("rawValue", 0);
        } else {
          body.putInt("rawValue", amplitude);
          body.putInt("value", (int) (20 * Math.log10(((double) amplitude) / 32767d)));
        }

        sendEvent("frame", body);
      }
    }, 0, monitorInterval);
  }

  private void stopTimer() {
    if (timer != null) {
      timer.cancel();
      timer.purge();
      timer = null;
    }
  }

  private void sendEvent(String eventName, Object params) {
    getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

  private void logAndRejectPromise(Promise promise, String errorCode, String errorMessage) {
    Log.e(TAG, "[" + errorCode + "] " + errorMessage);
    promise.reject(errorCode, errorMessage);
  }
}
