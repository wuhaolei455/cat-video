// 视频蒙层状态管理 - 基于CoverGroupValue设计
import { useState, useCallback, useRef, useEffect } from 'react';
import type { VideoState, PlaybackRate } from '../types';

// 播放速度枚举
export enum PlayerSpeed {
  SPEED_0_25 = 0.25,
  SPEED_0_50 = 0.5,
  SPEED_0_75 = 0.75,
  SPEED_1_00 = 1,
  SPEED_1_25 = 1.25,
  SPEED_1_50 = 1.5,
  SPEED_1_75 = 1.75,
  SPEED_2_00 = 2
}

// 视频信息接口
export interface VideoInfo {
  id: string;
  name: string;
  duration: number; // 秒
  videoUrl: string;
  thumbnailUrl?: string;
  vipMark?: boolean;
  free?: boolean;
}

// 视频蒙层状态接口
export interface VideoOverlayState {
  // 基础状态
  isReady: boolean;
  isPlaying: boolean;
  speed: PlayerSpeed;
  currentPlayTime: number; // 毫秒
  totalDuration: number; // 毫秒
  isImmersed: boolean; // 是否沉浸式播放
  
  // 蒙层显示状态
  vipTryCompleteCoverVisible: boolean; // VIP试看结束蒙层
  completeCoverVisible: boolean; // 播放完成蒙层
  speedCoverVisible: boolean; // 倍速选择蒙层
  errorCoverVisible: boolean; // 错误蒙层
  vipTryCoverVisible: boolean; // VIP试看气泡
  feedbackCoverVisible: boolean; // 反馈蒙层
  
  // 视频信息
  currentVideo: VideoInfo;
  
  // UI控制状态
  enableFeedback: boolean;
  enableShare: boolean;
  isLandscape: boolean; // 是否横屏
  isHalfScreen: boolean; // 是否半屏
  headerCoverVisible: boolean; // 顶部UI显示
  shareIconVisible: boolean; // 分享按钮显示
  feedbackIconVisible: boolean; // 反馈按钮显示
  
  // 特殊状态
  isDailyPractice: boolean; // 是否是练习视频
}

// 初始状态
const initialVideoInfo: VideoInfo = {
  id: '',
  name: '',
  duration: 0,
  videoUrl: '',
  vipMark: false,
  free: true
};

const initialState: VideoOverlayState = {
  isReady: false,
  isPlaying: false,
  speed: PlayerSpeed.SPEED_1_00,
  currentPlayTime: 0,
  totalDuration: 0,
  isImmersed: false,
  
  vipTryCompleteCoverVisible: false,
  completeCoverVisible: false,
  speedCoverVisible: false,
  errorCoverVisible: false,
  vipTryCoverVisible: false,
  feedbackCoverVisible: false,
  
  currentVideo: initialVideoInfo,
  
  enableFeedback: false,
  enableShare: false,
  isLandscape: false,
  isHalfScreen: false,
  headerCoverVisible: true,
  shareIconVisible: false,
  feedbackIconVisible: false,
  
  isDailyPractice: false
};

// 视频蒙层状态管理Hook
export const useVideoOverlayState = () => {
  const [state, setState] = useState<VideoOverlayState>(initialState);
  const eventListenersRef = useRef<Map<string, Function[]>>(new Map());

  // 事件监听器管理
  const addEventListener = useCallback((event: string, listener: Function) => {
    if (!eventListenersRef.current.has(event)) {
      eventListenersRef.current.set(event, []);
    }
    eventListenersRef.current.get(event)!.push(listener);
  }, []);

  const removeEventListener = useCallback((event: string, listener: Function) => {
    const listeners = eventListenersRef.current.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }, []);

  const emitEvent = useCallback((event: string, data?: any) => {
    const listeners = eventListenersRef.current.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }, []);

  // 状态更新方法
  const setIsReady = useCallback((isReady: boolean) => {
    setState(prev => ({ ...prev, isReady }));
    emitEvent('stateChange', { isReady });
  }, [emitEvent]);

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setState(prev => ({ ...prev, isPlaying }));
    emitEvent('playingChange', { isPlaying });
  }, [emitEvent]);

  const setSpeed = useCallback((speed: PlayerSpeed) => {
    setState(prev => ({ ...prev, speed }));
    emitEvent('speedChange', { speed });
  }, [emitEvent]);

  const setCurrentPlayTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentPlayTime: time }));
    emitEvent('timeUpdate', { currentTime: time });
  }, [emitEvent]);

  const setTotalDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, totalDuration: duration }));
    emitEvent('durationUpdate', { duration });
  }, [emitEvent]);

  const setIsImmersed = useCallback((isImmersed: boolean) => {
    setState(prev => ({ ...prev, isImmersed }));
    emitEvent('immersedChange', { isImmersed });
  }, [emitEvent]);

  // 蒙层显示控制
  const setVipTryCompleteCoverVisible = useCallback((visible: boolean) => {
    setState(prev => {
      const newState = { ...prev, vipTryCompleteCoverVisible: visible };
      if (visible) {
        newState.isHalfScreen = false;
        newState.feedbackIconVisible = !visible;
        newState.shareIconVisible = !visible;
      }
      return newState;
    });
    emitEvent('vipTryCompleteCoverChange', { visible });
  }, [emitEvent]);

  const setCompleteCoverVisible = useCallback((visible: boolean) => {
    setState(prev => {
      const newState = { ...prev, completeCoverVisible: visible };
      if (visible) {
        newState.isImmersed = false;
      }
      return newState;
    });
    emitEvent('completeCoverChange', { visible });
  }, [emitEvent]);

  const setSpeedCoverVisible = useCallback((visible: boolean) => {
    setState(prev => {
      const newState = { ...prev, speedCoverVisible: visible };
      if (visible) {
        newState.isImmersed = true;
      }
      return newState;
    });
    emitEvent('speedCoverChange', { visible });
  }, [emitEvent]);

  const setErrorCoverVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, errorCoverVisible: visible }));
    emitEvent('errorCoverChange', { visible });
  }, [emitEvent]);

  const setVipTryCoverVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, vipTryCoverVisible: visible }));
    emitEvent('vipTryCoverChange', { visible });
  }, [emitEvent]);

  const setFeedbackCoverVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, feedbackCoverVisible: visible }));
    emitEvent('feedbackCoverChange', { visible });
  }, [emitEvent]);

  // 视频信息管理
  const setCurrentVideoData = useCallback((videoData: VideoInfo) => {
    setState(prev => ({
      ...prev,
      currentVideo: videoData,
      totalDuration: videoData.duration * 1000 // 转换为毫秒
    }));
    emitEvent('videoDataChange', { videoData });
  }, [emitEvent]);

  // UI控制
  const setEnableFeedback = useCallback((enable: boolean) => {
    setState(prev => ({ ...prev, enableFeedback: enable }));
  }, []);

  const setEnableShare = useCallback((enable: boolean) => {
    setState(prev => ({ ...prev, enableShare: enable }));
  }, []);

  const setIsLandscape = useCallback((isLandscape: boolean) => {
    setState(prev => ({ ...prev, isLandscape }));
    emitEvent('orientationChange', { isLandscape });
  }, [emitEvent]);

  const setIsHalfScreen = useCallback((isHalfScreen: boolean) => {
    setState(prev => ({
      ...prev,
      isHalfScreen,
      headerCoverVisible: !isHalfScreen,
      isImmersed: false
    }));
    emitEvent('halfScreenChange', { isHalfScreen });
  }, [emitEvent]);

  const setHeaderCoverVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, headerCoverVisible: visible }));
  }, []);

  const setShareIconVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, shareIconVisible: visible }));
  }, []);

  const setFeedbackIconVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, feedbackIconVisible: visible }));
  }, []);

  const setIsDailyPractice = useCallback((isDailyPractice: boolean) => {
    setState(prev => ({ ...prev, isDailyPractice }));
  }, []);

  // 播放器状态同步
  const syncPlayerState = useCallback((playerState: string) => {
    const isPlaying = playerState === 'playing';
    setIsPlaying(isPlaying);

    switch (playerState) {
      case 'canplay':
      case 'playing':
        setIsReady(true);
        setVipTryCompleteCoverVisible(false);
        setCompleteCoverVisible(false);
        setErrorCoverVisible(false);
        break;
      case 'error':
        setIsReady(false);
        setErrorCoverVisible(true);
        break;
      case 'ended':
        setIsReady(false);
        // 根据VIP状态决定显示哪个蒙层
        const needShowVip = !state.currentVideo.free && (state.currentVideo.vipMark === true);
        setVipTryCompleteCoverVisible(needShowVip);
        setCompleteCoverVisible(!needShowVip);
        setSpeedCoverVisible(false);
        break;
    }
  }, [state.currentVideo, setIsPlaying, setIsReady, setVipTryCompleteCoverVisible, setCompleteCoverVisible, setErrorCoverVisible, setSpeedCoverVisible]);

  // 时间更新处理
  const handleTimeUpdate = useCallback((time: number) => {
    // 避免频繁更新，只在时间变化超过1秒时更新
    if (Math.abs(time - state.currentPlayTime) > 1000) {
      setCurrentPlayTime(time);
    }
  }, [state.currentPlayTime, setCurrentPlayTime]);

  // 错误处理
  const handleError = useCallback((error: Error) => {
    setIsReady(false);
    setErrorCoverVisible(true);
    emitEvent('error', { error });
  }, [setIsReady, setErrorCoverVisible, emitEvent]);

  // 清理函数
  const cleanup = useCallback(() => {
    eventListenersRef.current.clear();
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // 状态
    state,
    
    // 状态更新方法
    setIsReady,
    setIsPlaying,
    setSpeed,
    setCurrentPlayTime,
    setTotalDuration,
    setIsImmersed,
    
    // 蒙层控制
    setVipTryCompleteCoverVisible,
    setCompleteCoverVisible,
    setSpeedCoverVisible,
    setErrorCoverVisible,
    setVipTryCoverVisible,
    setFeedbackCoverVisible,
    
    // 视频信息
    setCurrentVideoData,
    
    // UI控制
    setEnableFeedback,
    setEnableShare,
    setIsLandscape,
    setIsHalfScreen,
    setHeaderCoverVisible,
    setShareIconVisible,
    setFeedbackIconVisible,
    setIsDailyPractice,
    
    // 播放器同步
    syncPlayerState,
    handleTimeUpdate,
    handleError,
    
    // 事件管理
    addEventListener,
    removeEventListener,
    emitEvent,
    
    // 工具方法
    cleanup
  };
};

export default useVideoOverlayState;