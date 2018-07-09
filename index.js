'use strict';

import { NativeModules, NativeAppEventEmitter } from "react-native";

var SoundLevelModule = NativeModules.RNSoundLevelModule;

var SoundLevel = {
  start: function() {
    if (this.frameSubscription) this.frameSubscription.remove();
    this.frameSubscription = NativeAppEventEmitter.addListener('frame',
      (data) => {
        if (this.onNewFrame) {
          this.onNewFrame(data);
        }
      }
    );

    return SoundLevelModule.start();
  },
  stop: function() {
    if (this.frameSubscription) this.frameSubscription.remove();
    return SoundLevelModule.stop();
  },
};

module.exports = SoundLevel;
