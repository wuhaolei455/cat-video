"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';

// 缓冲策略类型
export type BufferStrategy = 'traditional' | 'smart' | 'aggressive';

// 网络状况类型
export type NetworkCondition = 'slow' | 'medium' | 'fast';

// 用户行为数据
export interface UserBehavior {
  seekPattern: number[];      // 用户跳跃点模式
  averageWatchDuration: number; // 平均观看时长
  skipRate: number;           // 跳过率
  pauseFrequency: number;     // 暂停频率
  playbackSpeed: number;      // 播放速度偏好
}

// 缓冲性能指标
export interface BufferMetrics {
  bufferHealth: number;       // 缓冲健康度 (0-100)
  prebufferTime: number;      // 预缓冲时长
  bufferStalls: number;       // 卡顿次数
  wastedBuffer: number;       // 浪费的缓冲量
  adaptiveScore: number;      // 自适应评分
  networkEfficiency: number;  // 网络效率
}

// 智能缓冲配置
export interface SmartBufferConfig {
  strategy: BufferStrategy;
  minBufferTime: number;      // 最小缓冲时间(秒)
  maxBufferTime: number;      // 最大缓冲时间(秒)
  adaptiveThreshold: number;  // 自适应阈值
  predictiveEnabled: boolean; // 启用预测性缓冲
  networkAware: boolean;      // 网络感知
}

// 缓冲状态
export interface BufferState {
  currentBuffer: number;      // 当前缓冲量
  targetBuffer: number;       // 目标缓冲量
  isBuffering: boolean;       // 正在缓冲
  networkSpeed: number;       // 网络速度 (Mbps)
  quality: string;           // 当前质量
  efficiency: number;         // 缓冲效率
}

// 默认配置
const DEFAULT_CONFIGS: Record<BufferStrategy, SmartBufferConfig> = {
  traditional: {
    strategy: 'traditional',
    minBufferTime: 5,
    maxBufferTime: 30,
    adaptiveThreshold: 0.3,
    predictiveEnabled: false,
    networkAware: false
  },
  smart: {
    strategy: 'smart',
    minBufferTime: 3,
    maxBufferTime: 15,
    adaptiveThreshold: 0.5,
    predictiveEnabled: true,
    networkAware: true
  },
  aggressive: {
    strategy: 'aggressive',
    minBufferTime: 1,
    maxBufferTime: 60,
    adaptiveThreshold: 0.8,
    predictiveEnabled: true,
    networkAware: true
  }
};

// 智能缓冲管理器
class SmartBufferManager {
  private config: SmartBufferConfig;
  private userBehavior: UserBehavior;
  private networkCondition: NetworkCondition = 'medium';
  private metrics: BufferMetrics;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement, config: SmartBufferConfig) {
    this.video = video;
    this.config = config;
    this.userBehavior = this.initializeUserBehavior();
    this.metrics = this.initializeMetrics();
    this.setupNetworkMonitoring();
  }

  private initializeUserBehavior(): UserBehavior {
    return {
      seekPattern: [],
      averageWatchDuration: 0,
      skipRate: 0,
      pauseFrequency: 0,
      playbackSpeed: 1
    };
  }

  private initializeMetrics(): BufferMetrics {
    return {
      bufferHealth: 100,
      prebufferTime: 0,
      bufferStalls: 0,
      wastedBuffer: 0,
      adaptiveScore: 0,
      networkEfficiency: 0
    };
  }

  // 网络监控
  private setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateNetworkCondition(connection.effectiveType);
      
      connection.addEventListener('change', () => {
        this.updateNetworkCondition(connection.effectiveType);
      });
    }
  }

  private updateNetworkCondition(effectiveType: string) {
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        this.networkCondition = 'slow';
        break;
      case '3g':
        this.networkCondition = 'medium';
        break;
      case '4g':
        this.networkCondition = 'fast';
        break;
      default:
        this.networkCondition = 'medium';
    }
  }

  // 计算最优缓冲时间
  public calculateOptimalBuffer(): number {
    const { strategy, minBufferTime, maxBufferTime } = this.config;
    
    switch (strategy) {
      case 'traditional':
        return this.calculateTraditionalBuffer();
      case 'smart':
        return this.calculateSmartBuffer();
      case 'aggressive':
        return this.calculateAggressiveBuffer();
      default:
        return minBufferTime;
    }
  }

  private calculateTraditionalBuffer(): number {
    // 传统策略：固定缓冲时间，不考虑用户行为
    return this.config.minBufferTime;
  }

  private calculateSmartBuffer(): number {
    // 智能策略：基于网络状况和用户行为
    let baseBuffer = this.config.minBufferTime;
    
    // 网络状况调整
    switch (this.networkCondition) {
      case 'slow':
        baseBuffer *= 2;
        break;
      case 'fast':
        baseBuffer *= 0.7;
        break;
    }
    
    // 用户行为调整
    if (this.userBehavior.skipRate > 0.3) {
      baseBuffer *= 0.6; // 用户经常跳过，减少缓冲
    }
    
    if (this.userBehavior.pauseFrequency > 0.2) {
      baseBuffer *= 1.3; // 用户经常暂停，增加缓冲
    }
    
    return Math.min(baseBuffer, this.config.maxBufferTime);
  }

  private calculateAggressiveBuffer(): number {
    // 激进策略：最大化缓冲，预测性加载
    let targetBuffer = this.config.maxBufferTime;
    
    // 根据观看模式调整
    if (this.userBehavior.seekPattern.length > 0) {
      // 预测下一个可能的跳跃点
      const predictedSeek = this.predictNextSeek();
      if (predictedSeek > 0) {
        targetBuffer = Math.min(predictedSeek - this.video.currentTime, targetBuffer);
      }
    }
    
    return targetBuffer;
  }

  private predictNextSeek(): number {
    // 简单的跳跃点预测算法
    const pattern = this.userBehavior.seekPattern;
    if (pattern.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < pattern.length; i++) {
      intervals.push(pattern[i] - pattern[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return pattern[pattern.length - 1] + avgInterval;
  }

  // 更新用户行为数据
  public updateUserBehavior(event: string, data: any) {
    switch (event) {
      case 'seek':
        this.userBehavior.seekPattern.push(data.currentTime);
        if (this.userBehavior.seekPattern.length > 10) {
          this.userBehavior.seekPattern.shift();
        }
        break;
      case 'pause':
        this.userBehavior.pauseFrequency += 0.1;
        break;
      case 'ratechange':
        this.userBehavior.playbackSpeed = data.playbackRate;
        break;
    }
  }

  // 获取缓冲状态
  public getBufferState(): BufferState {
    const buffered = this.video.buffered;
    const currentTime = this.video.currentTime;
    let currentBuffer = 0;
    
    if (buffered.length > 0) {
      for (let i = 0; i < buffered.length; i++) {
        if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
          currentBuffer = buffered.end(i) - currentTime;
          break;
        }
      }
    }
    
    return {
      currentBuffer,
      targetBuffer: this.calculateOptimalBuffer(),
      isBuffering: this.video.readyState < 3,
      networkSpeed: this.getEstimatedNetworkSpeed(),
      quality: this.getCurrentQuality(),
      efficiency: this.calculateBufferEfficiency()
    };
  }

  private getEstimatedNetworkSpeed(): number {
    // 简化的网络速度估算
    switch (this.networkCondition) {
      case 'slow': return 1;
      case 'medium': return 5;
      case 'fast': return 20;
      default: return 5;
    }
  }

  private getCurrentQuality(): string {
    // 获取当前视频质量（简化版）
    const height = this.video.videoHeight;
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    return '360p';
  }

  private calculateBufferEfficiency(): number {
    const state = this.getBufferState();
    return Math.min((state.currentBuffer / state.targetBuffer) * 100, 100);
  }

  // 获取性能指标
  public getMetrics(): BufferMetrics {
    return { ...this.metrics };
  }
}

// React Hook
export function useSmartBuffer(
  videoRef: React.RefObject<HTMLVideoElement>, 
  strategy: BufferStrategy = 'smart'
) {
  const [bufferState, setBufferState] = useState<BufferState | null>(null);
  const [metrics, setMetrics] = useState<BufferMetrics | null>(null);
  const managerRef = useRef<SmartBufferManager | null>(null);

  const updateBufferState = useCallback(() => {
    if (managerRef.current) {
      setBufferState(managerRef.current.getBufferState());
      setMetrics(managerRef.current.getMetrics());
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const config = DEFAULT_CONFIGS[strategy];
    managerRef.current = new SmartBufferManager(videoRef.current, config);

    const video = videoRef.current;
    
    // 监听视频事件
    const handleProgress = () => updateBufferState();
    const handleTimeUpdate = () => updateBufferState();
    const handleSeeked = () => {
      managerRef.current?.updateUserBehavior('seek', { currentTime: video.currentTime });
      updateBufferState();
    };
    const handlePause = () => {
      managerRef.current?.updateUserBehavior('pause', {});
      updateBufferState();
    };
    const handleRateChange = () => {
      managerRef.current?.updateUserBehavior('ratechange', { playbackRate: video.playbackRate });
      updateBufferState();
    };

    video.addEventListener('progress', handleProgress);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ratechange', handleRateChange);

    // 初始更新
    updateBufferState();

    // 定期更新
    const interval = setInterval(updateBufferState, 1000);

    return () => {
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ratechange', handleRateChange);
      clearInterval(interval);
    };
  }, [videoRef, strategy, updateBufferState]);

  return { bufferState, metrics };
}

// 缓冲状态显示组件
interface BufferIndicatorProps {
  bufferState: BufferState | null;
  metrics: BufferMetrics | null;
  strategy: BufferStrategy;
}

export const BufferIndicator: React.FC<BufferIndicatorProps> = ({ 
  bufferState, 
  metrics, 
  strategy 
}) => {
  if (!bufferState || !metrics) return null;

  const getStrategyColor = () => {
    switch (strategy) {
      case 'traditional': return 'text-red-600 bg-red-50';
      case 'smart': return 'text-green-600 bg-green-50';
      case 'aggressive': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrategyIcon = () => {
    switch (strategy) {
      case 'traditional': return '🐌';
      case 'smart': return '🧠';
      case 'aggressive': return '🚀';
      default: return '📊';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStrategyColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          {getStrategyIcon()} {strategy.toUpperCase()} 缓冲策略
        </h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          bufferState.isBuffering ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {bufferState.isBuffering ? '缓冲中' : '播放中'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-gray-500">当前缓冲</div>
          <div className="font-medium">{bufferState.currentBuffer.toFixed(1)}s</div>
        </div>
        <div>
          <div className="text-gray-500">目标缓冲</div>
          <div className="font-medium">{bufferState.targetBuffer.toFixed(1)}s</div>
        </div>
        <div>
          <div className="text-gray-500">网络速度</div>
          <div className="font-medium">{bufferState.networkSpeed}Mbps</div>
        </div>
        <div>
          <div className="text-gray-500">缓冲效率</div>
          <div className="font-medium">{bufferState.efficiency.toFixed(0)}%</div>
        </div>
      </div>

      {/* 缓冲进度条 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>缓冲进度</span>
          <span>{Math.min((bufferState.currentBuffer / bufferState.targetBuffer) * 100, 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-current h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((bufferState.currentBuffer / bufferState.targetBuffer) * 100, 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};
