// 瀑布流分组算法工具函数

export interface ImageItem {
  id: number;
  width: number;
  height: number;
  src?: string;
  alt?: string;
}

export interface WaterfallColumn {
  items: ImageItem[];
  totalHeight: number;
}

export interface WaterfallLayoutResult {
  columns: WaterfallColumn[];
  totalColumns: number;
}

/**
 * 瀑布流分组算法
 * @param images 图片数组，每个元素包含宽高信息
 * @param columnWidth 列宽度限制（px）
 * @param gap 图片间隙（px）
 * @param minColumns 最小列数
 * @param maxColumns 最大列数
 * @returns 分组后的瀑布流数据
 */
export function createWaterfallLayout(
  images: ImageItem[],
  columnWidth: number = 400,
  gap: number = 16,
  minColumns: number = 2,
  maxColumns: number = 8
): WaterfallLayoutResult {
  // 根据屏幕宽度计算列数
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const availableWidth = screenWidth - 64; // 减去页面边距
  const columnWithGap = columnWidth + gap;

  let columnCount = Math.floor(availableWidth / columnWithGap);
  columnCount = Math.max(minColumns, Math.min(maxColumns, columnCount));

  // 初始化列数组
  const columns: WaterfallColumn[] = Array.from(
    { length: columnCount },
    () => ({
      items: [],
      totalHeight: 0,
    })
  );

  // 为每个图片分配到最短的列
  images.forEach((image) => {
    // 计算缩放后的高度（保持宽高比，宽度固定为columnWidth）
    const scaledHeight = (image.height * columnWidth) / image.width;

    // 找到当前最短的列
    const shortestColumnIndex = columns.reduce((minIndex, column, index) => {
      return columns[minIndex].totalHeight > column.totalHeight
        ? index
        : minIndex;
    }, 0);

    // 将图片添加到最短列
    columns[shortestColumnIndex].items.push({
      ...image,
      height: scaledHeight, // 使用缩放后的高度
    });

    // 更新列的总高度（包含间隙）
    columns[shortestColumnIndex].totalHeight += scaledHeight + gap;
  });

  return {
    columns,
    totalColumns: columnCount,
  };
}

/**
 * 生成测试用的图片数据
 * @param count 图片数量
 * @returns 图片数组
 */
export function generateTestImages(count: number = 100): ImageItem[] {
  return Array.from({ length: count }, (_, index) => {
    // 生成随机宽高，模拟真实图片的多样性
    const baseWidth = 400;
    const aspectRatios = [
      { width: 400, height: 300 }, // 4:3
      { width: 400, height: 600 }, // 2:3 (竖图)
      { width: 400, height: 250 }, // 16:10
      { width: 400, height: 400 }, // 1:1 (正方形)
      { width: 400, height: 500 }, // 4:5
      { width: 400, height: 200 }, // 2:1 (宽图)
    ];

    const randomRatio =
      aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

    return {
      id: index,
      width: randomRatio.width,
      height: randomRatio.height,
      src: `https://picsum.photos/400/${randomRatio.height}?random=${index}`,
      alt: `瀑布流图片 ${index + 1}`,
    };
  });
}

/**
 * 响应式瀑布流布局计算
 * @param containerWidth 容器宽度
 * @param columnWidth 期望的列宽
 * @param gap 间隙
 * @returns 计算后的列数和实际列宽
 */
export function calculateResponsiveLayout(
  containerWidth: number,
  columnWidth: number = 400,
  gap: number = 16
) {
  const minColumns = 1;
  const maxColumns = 5;

  // 计算能容纳的列数
  let columns = Math.floor((containerWidth + gap) / (columnWidth + gap));
  columns = Math.max(minColumns, Math.min(maxColumns, columns));

  // 计算实际列宽（充分利用容器宽度）
  const actualColumnWidth = (containerWidth - gap * (columns - 1)) / columns;

  return {
    columns,
    columnWidth: actualColumnWidth,
  };
}
