import { FlowReducerProvider } from '../../contexts/FlowReducerContext';
import ReducerController from '../../components/ReducerController';

export default function ReducerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-green-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            useReducer 状态管理演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Context + useReducer Pattern Demo
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            在原demo基础上，使用useReducer替代useState进行状态管理
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {/* useReducer版本的状态管理 */}
          <FlowReducerProvider totalSteps={3} initialData={{}}>
            <ReducerController />
          </FlowReducerProvider>
        </main>

        <footer className="text-center py-8">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                  ✅ useReducer 优势
                </h3>
                <ul className="text-xs space-y-1 text-left">
                  <li>• 复杂状态逻辑集中管理</li>
                  <li>• 不可变状态更新</li>
                  <li>• TypeScript Action 类型安全</li>
                  <li>• 状态变更可预测和调试</li>
                  <li>• 支持时间旅行调试</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                  🔄 与useState对比
                </h3>
                <ul className="text-xs space-y-1 text-left">
                  <li>• <strong>useState</strong>: 简单状态，分散更新逻辑</li>
                  <li>• <strong>useReducer</strong>: 复杂状态，集中更新逻辑</li>
                  <li>• <strong>Action类型</strong>: 明确的状态变更意图</li>
                  <li>• <strong>Reducer纯函数</strong>: 易于测试和调试</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 
                             text-white font-medium rounded-lg transition-colors duration-200"
                >
                  🧩 useState 版本
                </a>
                <a 
                  href="/reducer"
                  className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 
                             text-white font-medium rounded-lg transition-colors duration-200"
                >
                  🔄 useReducer 版本 (当前)
                </a>
                <a 
                  href="/video"
                  className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 
                             text-white font-medium rounded-lg transition-colors duration-200"
                >
                  🎥 视频模块演示
                </a>
              </div>
              <p className="mt-2 text-xs">
                探索不同的状态管理方式和视频播放器技术
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
