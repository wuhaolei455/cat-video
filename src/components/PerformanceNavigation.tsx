"use client";
import React from "react";
import Link from "next/link";

export function PerformanceNavigation() {
  const pages = [
    {
      href: "/no-lazy-img",
      title: "🚫 无懒加载",
      description: "所有图片立即加载",
      color: "orange",
      performance: "最差性能",
    },
    {
      href: "/lazy-img-basic",
      title: "⚡ 基础懒加载",
      description: "视口内才加载",
      color: "yellow",
      performance: "基础优化",
    },
    {
      href: "/lazy-img-traditional",
      title: "🐌 传统懒加载",
      description: "预加载距离优化",
      color: "red",
      performance: "中等优化",
    },
    {
      href: "/lazy-img-frame",
      title: "🚀 分帧加载",
      description: "智能分帧优化",
      color: "green",
      performance: "最优性能",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-8 border">
      <h2 className="text-2xl font-bold text-center mb-4">🚀 完整性能对比测试</h2>
      <p className="text-center text-gray-600 mb-6">四种不同的图片加载策略，从无优化到最优化</p>
      
      {/* 性能梯度说明 */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-red-600">性能最差</span>
            <div className="w-8 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"></div>
            <span className="text-green-600">性能最优</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pages.map((page) => (
          <Link 
            key={page.href}
            href={page.href} 
            className={`p-4 bg-${page.color}-100 border-2 border-${page.color}-300 rounded-lg hover:bg-${page.color}-200 transition-colors text-center block`}
          >
            <div className="text-2xl mb-2">{page.title.split(' ')[0]}</div>
            <div className={`text-sm font-semibold text-${page.color}-700`}>{page.title.split(' ').slice(1).join(' ')}</div>
            <div className={`text-xs text-${page.color}-600 mt-1`}>{page.description}</div>
            <div className={`text-xs text-${page.color}-500 mt-2 font-medium`}>{page.performance}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
