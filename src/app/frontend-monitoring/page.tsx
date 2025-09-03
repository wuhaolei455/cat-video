"use client";
import React, { useState, useEffect, useRef } from "react";
import { MonitoringDashboard } from "@/components/MonitoringDashboard";
import { ErrorTracker } from "@/components/ErrorTracker";
import { WhiteScreenDetector } from "@/components/WhiteScreenDetector";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { DemoScenarios } from "@/components/DemoScenarios";

export default function FrontendMonitoringPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [monitoringData, setMonitoringData] = useState({
    errors: [],
    performance: {},
    whiteScreen: false,
    apiErrors: []
  });

  const tabs = [
    { id: "overview", name: "监控概览", icon: "📊" },
    { id: "whitscreen", name: "白屏监控", icon: "⚪" },
    { id: "errors", name: "错误监控", icon: "❌" },
    { id: "performance", name: "性能监控", icon: "⚡" },
    { id: "demo", name: "演示场景", icon: "🎭" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔍 前端监控分析系统
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            深入分析前端白屏、接口报错等问题的监控方案与实现策略
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
            监控系统运行中
          </div>
        </div>

        {/* 导航标签 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md"
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "overview" && (
            <MonitoringDashboard data={monitoringData} />
          )}
          
          {activeTab === "whitscreen" && (
            <WhiteScreenDetector />
          )}
          
          {activeTab === "errors" && (
            <ErrorTracker />
          )}
          
          {activeTab === "performance" && (
            <PerformanceMonitor />
          )}
          
          {activeTab === "demo" && (
            <DemoScenarios />
          )}
        </div>

        {/* 底部说明 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 监控系统核心价值</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-700 mb-2">精准定位</h4>
              <p className="text-sm text-gray-600">快速识别白屏、错误等问题根源</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-semibold text-gray-700 mb-2">实时监控</h4>
              <p className="text-sm text-gray-600">7x24小时持续监控用户体验</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-semibold text-gray-700 mb-2">优化指导</h4>
              <p className="text-sm text-gray-600">提供具体的性能优化建议</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
