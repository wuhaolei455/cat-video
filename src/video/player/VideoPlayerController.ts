// 视频播放器控制器 - 基于AVPlayerController设计
import { VideoEventEmitterTyped } from '../EventEmitter';
import type { VideoState, PlaybackRate, VideoQuality } from '../types';
import { PlayerSpeed } from '../overlay/VideoOverlayState';

// 播放器事件类型
export enum PlayerEvent {
  STATE_CHANGE = 'stateChange',
  TIME_UPDATE = 'timeUpdate',
  DURATION_UPDATE = 'durationUpdate',
  VOLUME_CHANGE = 'volumeChange',
  SPEED_DONE = 'speedDone',
  SEEK_DONE = 'seekDone',
  BUFFERING_UPDATE = 'bufferingUpdate',
  VIDEO_SIZE_CHANGE = 'videoSizeChange',
  ERROR = 'error',
  VIDEO_UPDATE = 'videoUpdate',
  START_RENDER_FRAME = 'startRenderFrame'
}

// 播放器状态枚举
export enum PlayerState {
  IDLE = 'idle',
  INITIALIZED = 'initialized',
  PREPARED = 'prepared',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ERROR = 'error',
  RELEASED = 'released'
}

// 播放器控制器接口
export interface IPlayerController {
  // 基础控制
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(timeMs: number): void;
  setSpeed(speed: PlayerSpeed): void;
  setVolume(volume: number): void;
  
  // 视频源管理
  setUrl(url: string): Promise<void>;
  setDataProvider(dataProvider: () => Promise<string>): void;
  
  // 配置
  setAutoPlay(autoPlay: boolean): void;
  setSurfaceId(surfaceId: string): Promise<void>;
  
  // 生命周期
  start(): Promise<void>;
  reset(): Promise<void>;
  release(): Promise<void>;
  
  // 事件监听
  on(event: PlayerEvent, listener: Function): void;
  off(event: PlayerEvent, listener: Function): void;
  emit(event: PlayerEvent, ...args: any[]): void;
}

// 视频播放器控制器实现
export class VideoPlayerController implements IPlayerController {
  private videoElement?: HTMLVideoElement;
  private autoPlay: boolean = true;
  private videoUrl: string = '';
  private dataProvider?: () => Promise<string>;
  private eventEmitter: VideoEventEmitterTyped;
  private currentState: PlayerState = PlayerState.IDLE;
  private currentSpeed: PlayerSpeed = PlayerSpeed.SPEED_1_00;
  private currentVolume: number = 1;

  constructor() {
    this.eventEmitter = new VideoEventEmitterTyped();
  }

  // 初始化视频元素
  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;
    this.currentState = PlayerState.INITIALIZED;
    this.registerEventListener();
    this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
  }

  // 设置数据提供者
  setDataProvider(dataProvider: () => Promise<string>): void {
    this.dataProvider = dataProvider;
  }

  // 开始播放
  async start(): Promise<void> {
    if (this.dataProvider) {
      try {
        const url = await this.dataProvider();
        await this.setUrl(url);
      } catch (error) {
        this.emit(PlayerEvent.ERROR, error);
        console.error('VideoPlayerController: Failed to get video URL', error);
      }
    }
  }

  // 设置自动播放
  setAutoPlay(autoPlay: boolean): void {
    this.autoPlay = autoPlay;
  }

  // 设置视频源ID（在Web环境中可以用于标识）
  async setSurfaceId(surfaceId: string): Promise<void> {
    // 在Web环境中，这个可以用于标识或配置
    console.log('Surface ID set:', surfaceId);
  }

  // 设置视频URL
  async setUrl(url: string): Promise<void> {
    if (!url) {
      this.emit(PlayerEvent.ERROR, new Error('URL is empty'));
      return;
    }

    if (!this.videoElement) {
      this.emit(PlayerEvent.ERROR, new Error('Video element not initialized'));
      return;
    }

    try {
      await this.reset();
      this.videoUrl = url;
      this.videoElement.src = url;
      this.emit(PlayerEvent.VIDEO_UPDATE, this.videoUrl);
    } catch (error) {
      this.emit(PlayerEvent.ERROR, error);
    }
  }

  // 设置播放速度
  setSpeed(speed: PlayerSpeed): void {
    if (!this.videoElement) return;
    
    this.currentSpeed = speed;
    this.videoElement.playbackRate = speed;
    this.emit(PlayerEvent.SPEED_DONE, speed);
  }

  // 播放
  async play(): Promise<void> {
    if (!this.videoElement) return;
    
    try {
      await this.videoElement.play();
      this.currentState = PlayerState.PLAYING;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    } catch (error) {
      this.emit(PlayerEvent.ERROR, error);
      console.error('VideoPlayerController: Play failed', error);
    }
  }

  // 暂停
  async pause(): Promise<void> {
    if (!this.videoElement) return;
    
    try {
      this.videoElement.pause();
      this.currentState = PlayerState.PAUSED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    } catch (error) {
      this.emit(PlayerEvent.ERROR, error);
      console.error('VideoPlayerController: Pause failed', error);
    }
  }

  // 跳转
  seek(timeMs: number): void {
    if (!this.videoElement) return;
    
    const timeSeconds = timeMs / 1000;
    if (timeSeconds >= 0 && timeSeconds <= this.videoElement.duration) {
      this.videoElement.currentTime = timeSeconds;
      this.emit(PlayerEvent.SEEK_DONE, timeMs);
    }
  }

  // 停止
  async stop(): Promise<void> {
    if (!this.videoElement) return;
    
    try {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
      this.currentState = PlayerState.STOPPED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    } catch (error) {
      this.emit(PlayerEvent.ERROR, error);
      console.error('VideoPlayerController: Stop failed', error);
    }
  }

  // 重置
  async reset(): Promise<void> {
    if (!this.videoElement) return;
    
    try {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
      this.currentState = PlayerState.IDLE;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    } catch (error) {
      this.emit(PlayerEvent.ERROR, error);
      console.error('VideoPlayerController: Reset failed', error);
    }
  }

  // 释放资源
  async release(): Promise<void> {
    if (!this.videoElement) return;
    
    try {
      this.videoElement.pause();
      this.videoElement.removeAttribute('src');
      this.videoElement.load();
      this.currentState = PlayerState.RELEASED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    } catch (error) {
      this.emit(PlayerEvent.ERROR, error);
      console.error('VideoPlayerController: Release failed', error);
    }
  }

  // 设置音量
  setVolume(volume: number): void {
    if (!this.videoElement) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.currentVolume = clampedVolume;
    this.videoElement.volume = clampedVolume;
    this.emit(PlayerEvent.VOLUME_CHANGE, clampedVolume);
  }

  // 注册事件监听器
  private registerEventListener(): void {
    if (!this.videoElement) return;

    // 首帧渲染
    this.videoElement.addEventListener('loadeddata', () => {
      this.emit(PlayerEvent.START_RENDER_FRAME);
    });

    // 播放状态变化
    this.videoElement.addEventListener('loadstart', () => {
      this.currentState = PlayerState.INITIALIZED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    });

    this.videoElement.addEventListener('canplay', () => {
      this.currentState = PlayerState.PREPARED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
      
      if (this.autoPlay) {
        this.play();
      }
    });

    this.videoElement.addEventListener('play', () => {
      this.currentState = PlayerState.PLAYING;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    });

    this.videoElement.addEventListener('pause', () => {
      this.currentState = PlayerState.PAUSED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    });

    this.videoElement.addEventListener('ended', () => {
      this.currentState = PlayerState.COMPLETED;
      this.emit(PlayerEvent.STATE_CHANGE, this.currentState);
    });

    // 音量变化
    this.videoElement.addEventListener('volumechange', () => {
      this.emit(PlayerEvent.VOLUME_CHANGE, this.videoElement!.volume);
    });

    // 跳转完成
    this.videoElement.addEventListener('seeked', () => {
      this.emit(PlayerEvent.SEEK_DONE, this.videoElement!.currentTime * 1000);
    });

    // 播放速度变化
    this.videoElement.addEventListener('ratechange', () => {
      this.emit(PlayerEvent.SPEED_DONE, this.videoElement!.playbackRate);
    });

    // 时间更新
    this.videoElement.addEventListener('timeupdate', () => {
      this.emit(PlayerEvent.TIME_UPDATE, this.videoElement!.currentTime * 1000);
    });

    // 时长更新
    this.videoElement.addEventListener('durationchange', () => {
      this.emit(PlayerEvent.DURATION_UPDATE, this.videoElement!.duration * 1000);
    });

    // 缓冲更新
    this.videoElement.addEventListener('progress', () => {
      const buffered = this.videoElement!.buffered;
      if (buffered.length > 0) {
        const loaded = buffered.end(buffered.length - 1) * 1000;
        this.emit(PlayerEvent.BUFFERING_UPDATE, loaded);
      }
    });

    // 视频尺寸变化
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.emit(PlayerEvent.VIDEO_SIZE_CHANGE, this.videoElement!.videoWidth, this.videoElement!.videoHeight);
    });

    // 错误处理
    this.videoElement.addEventListener('error', (event) => {
      const error = this.videoElement!.error;
      this.currentState = PlayerState.ERROR;
      this.emit(PlayerEvent.ERROR, error || new Error('Video playback error'));
      this.reset();
    });
  }

  // 事件监听
  on(event: PlayerEvent, listener: Function): void {
    this.eventEmitter.on(event as any, listener as any);
  }

  off(event: PlayerEvent, listener: Function): void {
    this.eventEmitter.off(event as any, listener as any);
  }

  emit(event: PlayerEvent, ...args: any[]): void {
    this.eventEmitter.emit(event as any, args[0]);
  }

  // 获取当前状态
  getCurrentState(): PlayerState {
    return this.currentState;
  }

  // 获取当前播放时间
  getCurrentTime(): number {
    return this.videoElement ? this.videoElement.currentTime * 1000 : 0;
  }

  // 获取总时长
  getDuration(): number {
    return this.videoElement ? this.videoElement.duration * 1000 : 0;
  }

  // 获取当前音量
  getVolume(): number {
    return this.currentVolume;
  }

  // 获取当前播放速度
  getSpeed(): PlayerSpeed {
    return this.currentSpeed;
  }
}

export default VideoPlayerController;