// 瀑布流分组算法演示

import { createWaterfallLayout, ImageItem } from '@/utils/waterfallLayout';

/**
 * 瀑布流分组算法演示
 * 
 * 问题：给定一个图片数组（每个元素包含宽和高），
 * 限定列宽为400px，返回分组后的瀑布流数据
 */

// 示例图片数据
const exampleImages: ImageItem[] = [
  { id: 1, width: 400, height: 300 },  // 4:3 横图
  { id: 2, width: 400, height: 600 },  // 2:3 竖图
  { id: 3, width: 400, height: 250 },  // 16:10 宽图
  { id: 4, width: 400, height: 400 },  // 1:1 正方形
  { id: 5, width: 400, height: 500 },  // 4:5 竖图
  { id: 6, width: 400, height: 200 },  // 2:1 超宽图
  { id: 7, width: 400, height: 350 },  // 接近4:3
  { id: 8, width: 400, height: 450 },  // 接近4:5
  { id: 9, width: 400, height: 280 },  // 10:7
  { id: 10, width: 400, height: 320 }, // 5:4
];

// 执行瀑布流分组
const result = createWaterfallLayout(
  exampleImages,
  400,  // 列宽度
  16,   // 间隙
  2,    // 最小列数
  4     // 最大列数
);

console.log('🌊 瀑布流分组结果：');
console.log(`总列数: ${result.totalColumns}`);

result.columns.forEach((column, index) => {
  console.log(`\n第 ${index + 1} 列:`);
  console.log(`- 图片数量: ${column.items.length}`);
  console.log(`- 总高度: ${column.totalHeight.toFixed(0)}px`);
  console.log('- 包含图片:');
  
  column.items.forEach(item => {
    console.log(`  * ID ${item.id}: ${item.width}×${item.height}px (缩放后高度: ${item.height.toFixed(0)}px)`);
  });
});

// 算法核心逻辑解释
console.log('\n📋 算法逻辑说明:');
console.log('1. 根据容器宽度计算最佳列数');
console.log('2. 初始化空列数组');
console.log('3. 对每张图片:');
console.log('   - 按列宽缩放图片高度 (保持宽高比)');
console.log('   - 找到当前最短的列');
console.log('   - 将图片添加到最短列');
console.log('   - 更新列的总高度');
console.log('4. 返回分组结果');

// 性能特点
console.log('\n⚡ 算法特点:');
console.log('- 时间复杂度: O(n) - n为图片数量');
console.log('- 空间复杂度: O(n) - 存储分组结果');
console.log('- 平衡性: 每次选择最短列，保证列高度相对平衡');
console.log('- 响应式: 支持动态计算列数和列宽');

export { result as waterfallDemoResult };
