//
//  RNSoundLevelModule.m
//  RNSoundLevelModule
//
//  Created by Vladimir Osipov on 2018-07-09.
//  Copyright (c) 2018 Vladimir Osipov. All rights reserved.
//

#import "RNSoundLevelModule.h"
#import <AVFoundation/AVFoundation.h>

@implementation RNSoundLevelModule {
  AVAudioRecorder *_audioRecorder;
  NSTimer *_progressUpdateTimer;
  int _frameId;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"frame"];
}

- (void)sendProgressUpdate
{
  if (!_audioRecorder || !_audioRecorder.isRecording) {
    return;
  }

  _frameId++;
  [_audioRecorder updateMeters];
  float currentLevel = [_audioRecorder averagePowerForChannel:0];

  [self sendEventWithName:@"frame" body:@{
    @"id": @(_frameId),
    @"value": @(currentLevel),
    @"rawValue": @(currentLevel)
  }];
}

- (void)stopProgressTimer
{
  [_progressUpdateTimer invalidate];
  _progressUpdateTimer = nil;
}

- (void)startProgressTimer:(int)monitorInterval
{
  [self stopProgressTimer];

  _progressUpdateTimer = [NSTimer timerWithTimeInterval:monitorInterval / 1000.0
                                                 target:self
                                               selector:@selector(sendProgressUpdate)
                                               userInfo:nil
                                                repeats:YES];

  // NSRunLoopCommonModes keeps the timer firing while the user scrolls
  [[NSRunLoop mainRunLoop] addTimer:_progressUpdateTimer forMode:NSRunLoopCommonModes];
}

RCT_EXPORT_METHOD(start:(int)monitorInterval
                  samplingRate:(float)sampleRate
                  allowHapticsAndSystemSoundsDuringRecording:(BOOL)allowHapticsAndSystemSounds
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (_audioRecorder && _audioRecorder.isRecording) {
    reject(@"INVALID_STATE", @"Please call stop before starting", nil);
    return;
  }

  [self stopProgressTimer];

  NSDictionary *recordSettings = @{
    AVEncoderAudioQualityKey: @(AVAudioQualityLow),
    AVFormatIDKey: @(kAudioFormatMPEG4AAC),
    AVNumberOfChannelsKey: @1,
    AVSampleRateKey: @(sampleRate)
  };

  NSError *error = nil;
  AVAudioSession *session = [AVAudioSession sharedInstance];

  // PlayAndRecord + MixWithOthers keeps other audio players/recorders alive,
  // AllowBluetooth makes headset microphones usable
  [session setCategory:AVAudioSessionCategoryPlayAndRecord
           withOptions:AVAudioSessionCategoryOptionMixWithOthers |
                       AVAudioSessionCategoryOptionAllowBluetooth |
                       AVAudioSessionCategoryOptionDefaultToSpeaker
                 error:&error];

  if (error) {
    reject(@"COULDNT_CONFIGURE_AUDIO_SESSION", error.localizedDescription, error);
    return;
  }

  if (@available(iOS 13.0, *)) {
    [session setAllowHapticsAndSystemSoundsDuringRecording:allowHapticsAndSystemSounds error:nil];
  }

  NSURL *tempFileUrl = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:@"rn-sound-level.m4a"]];

  error = nil;
  _audioRecorder = [[AVAudioRecorder alloc] initWithURL:tempFileUrl
                                               settings:recordSettings
                                                  error:&error];

  if (error || !_audioRecorder) {
    _audioRecorder = nil;
    reject(@"COULDNT_CONFIGURE_MEDIA_RECORDER",
           error ? error.localizedDescription : @"Failed to create the audio recorder. Make sure NSMicrophoneUsageDescription is present in Info.plist and the microphone permission is granted.",
           error);
    return;
  }

  _audioRecorder.delegate = self;
  _audioRecorder.meteringEnabled = YES;

  if (![_audioRecorder prepareToRecord]) {
    _audioRecorder = nil;
    reject(@"COULDNT_PREPARE_RECORDING", @"Failed to prepare the recording", nil);
    return;
  }

  error = nil;
  [session setActive:YES error:&error];

  if (error) {
    _audioRecorder = nil;
    reject(@"COULDNT_ACTIVATE_AUDIO_SESSION", error.localizedDescription, error);
    return;
  }

  if (![_audioRecorder record]) {
    _audioRecorder = nil;
    reject(@"COULDNT_START_RECORDING", @"Failed to start recording. The microphone permission may be missing.", nil);
    return;
  }

  _frameId = 0;
  [self startProgressTimer:monitorInterval];
  resolve(nil);
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [self stopProgressTimer];

  if (_audioRecorder) {
    [_audioRecorder stop];
    [_audioRecorder deleteRecording];
    _audioRecorder = nil;
  }

  // Hand the audio session back to the system instead of forcing
  // a new category onto the host app
  [[AVAudioSession sharedInstance] setActive:NO
                                 withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation
                                       error:nil];

  resolve(nil);
}

@end
