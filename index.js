"use strict";

import { NativeModules, NativeAppEventEmitter, Platform } from "react-native";

var SoundLevelModule =
  Platform.OS === "desktop"
    ? NativeModules.RNSoundLevel
    : NativeModules.RNSoundLevelModule;

var SoundLevel = {
  timer: null,

  start: function (_monitorConfig = 250) {
    const monitorConfig = {
      monitorInterval: _monitorConfig?.monitorInterval ?? 250,
      samplingRate: _monitorConfig?.samplingRate ?? 22050,
      allowHapticsAndSystemSoundsDuringRecording:
        _monitorConfig?.allowHapticsAndSystemSoundsDuringRecording ?? false,
    };

    if (typeof _monitorConfig === "number") {
      monitorConfig.monitorInterval = _monitorConfig;
    }

    if (this.frameSubscription) {
      this.frameSubscription.remove();
    }

    if (Platform.OS === "desktop") {
      this.timer = setInterval(async () => {
        if (this.onNewFrame) {
          const frame = await SoundLevelModule.measure();
          this.onNewFrame(JSON.parse(frame));
        }
      }, monitorConfig.monitorInterval);
    } else {
      this.frameSubscription = NativeAppEventEmitter.addListener(
        "frame",
        (data) => {
          if (this.onNewFrame) {
            this.onNewFrame(data);
          }
        }
      );
    }

    return Platform.OS === "ios"
      ? SoundLevelModule.start(
          monitorConfig.monitorInterval,
          monitorConfig.samplingRate,
          monitorConfig.allowHapticsAndSystemSoundsDuringRecording
        )
      : Platform.OS === "android"
      ? SoundLevelModule.start(
          monitorConfig.monitorInterval,
          monitorConfig.samplingRate
        )
      : SoundLevelModule.start();
  },

  stop: function () {
    if (this.frameSubscription) {
      this.frameSubscription.remove();
    }

    if (this.timer) {
      clearInterval(this.timer);
    }

    return SoundLevelModule.stop();
  },
};

module.exports = SoundLevel;
