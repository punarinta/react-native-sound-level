//
//  RNSoundLevelModule.h
//  RNSoundLevelModule
//
//  Created by Vladimir Osipov on 2018-07-09.
//  Copyright (c) 2018 Vladimir Osipov. All rights reserved.
//

#if __has_include("RCTConvert.h")
#import "RCTConvert.h"
#else
#import <React/RCTConvert.h>
#endif

#if __has_include("RCTBridge.h")
#import "RCTBridge.h"
#else
#import <React/RCTBridge.h>
#endif

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

#if __has_include("RCTEventDispatcher.h")
#import "RCTEventDispatcher.h"
#else
#import <React/RCTEventDispatcher.h>
#endif

#import <AVFoundation/AVFoundation.h>

@implementation RNSoundLevelModule {

  AVAudioRecorder *_audioRecorder;
  id _progressUpdateTimer;
  int _frameId;
  int _progressUpdateInterval;
  NSDate *_prevProgressUpdateTime;
  AVAudioSession *_recordSession;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (void)sendProgressUpdate {
  if (!_audioRecorder || !_audioRecorder.isRecording) {
    return;
  }

  if (_prevProgressUpdateTime == nil ||
   (([_prevProgressUpdateTime timeIntervalSinceNow] * -1000.0) >= _progressUpdateInterval)) {
      _frameId++;
      NSMutableDictionary *body = [[NSMutableDictionary alloc] init];
      [body setObject:[NSNumber numberWithFloat:_frameId] forKey:@"id"];

      [_audioRecorder updateMeters];
      float _currentLevel = [_audioRecorder averagePowerForChannel: 0];
      [body setObject:[NSNumber numberWithFloat:_currentLevel] forKey:@"value"];
      [body setObject:[NSNumber numberWithFloat:_currentLevel] forKey:@"rawValue"];

      [self.bridge.eventDispatcher sendAppEventWithName:@"frame" body:body];

    _prevProgressUpdateTime = [NSDate date];
  }
}

- (void)stopProgressTimer {
  [_progressUpdateTimer invalidate];
}

- (void)startProgressTimer:(int)monitorInterval {
  _progressUpdateInterval = monitorInterval;

  [self stopProgressTimer];

  _progressUpdateTimer = [CADisplayLink displayLinkWithTarget:self selector:@selector(sendProgressUpdate)];
  [_progressUpdateTimer addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];
}

RCT_EXPORT_METHOD(start:(int)monitorInterval)
{
  NSLog(@"Start Monitoring");
  _prevProgressUpdateTime = nil;
  [self stopProgressTimer];

  NSDictionary *recordSettings = [NSDictionary dictionaryWithObjectsAndKeys:
          [NSNumber numberWithInt:AVAudioQualityLow], AVEncoderAudioQualityKey,
          [NSNumber numberWithInt:kAudioFormatMPEG4AAC], AVFormatIDKey,
          [NSNumber numberWithInt:1], AVNumberOfChannelsKey,
          [NSNumber numberWithFloat:22050.0], AVSampleRateKey,
          nil];

  NSError *error = nil;

  _recordSession = [AVAudioSession sharedInstance];
  [_recordSession setCategory:AVAudioSessionCategoryMultiRoute error:nil];

  NSURL *_tempFileUrl = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:@"temp"]];

  _audioRecorder = [[AVAudioRecorder alloc]
                initWithURL:_tempFileUrl
                settings:recordSettings
                error:&error];

  _audioRecorder.delegate = self;

  if (error) {
      NSLog(@"error: %@", [error localizedDescription]);
    } else {
      [_audioRecorder prepareToRecord];
  }

  _audioRecorder.meteringEnabled = YES;

  [self startProgressTimer:monitorInterval];
  [_recordSession setActive:YES error:nil];
  [_audioRecorder record];
}

RCT_EXPORT_METHOD(stop)
{
  [_audioRecorder stop];
  [_recordSession setCategory:AVAudioSessionCategoryPlayback error:nil];
  _prevProgressUpdateTime = nil;
}

@end
