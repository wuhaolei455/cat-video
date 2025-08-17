import { FlowProvider } from '../contexts/FlowContext';
import Controller from '../components/Controller';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            React 组合模式演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Composition Pattern Demo
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            通过 FlowContext.Provider 组合多个子组件实现复杂功能
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {/* 组合模式的核心实现 */}
          <FlowProvider totalSteps={3} initialData={{}}>
            <Controller />
          </FlowProvider>
        </main>

        <footer className="text-center py-8">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-4">
            <p>
              <strong>组合模式特点:</strong>
            </p>
            <ul className="list-none space-y-1">
              <li>🧩 通过组合多个小组件构建复杂功能</li>
              <li>🔄 使用 Context 在组件间共享状态</li>
              <li>📦 每个子组件职责单一，易于维护</li>
              <li>🎯 提高代码复用性和可测试性</li>
            </ul>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                <a 
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  🧩 useState 版本 (当前)
                </a>
                <a 
                  href="/reducer"
                  className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  🔄 useReducer 版本
                </a>
                <a 
                  href="/video"
                  className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  🎥 视频模块演示
                </a>
                <a 
                  href="/form-demo"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  📝 表单设计模式演示
                </a>
                <a 
                  href="/render-props-demo"
                  className="inline-flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  🎨 Render Props 示例
                </a>
                <a 
                  href="/render-props-practice"
                  className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  ✍️ Render Props 练习
                </a>
                <a 
                  href="/debounce-test"
                  className="inline-flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  ⏱️ 防抖功能测试
                </a>
                <a 
                  href="/ssr-test"
                  className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  🔧 SSR 水合测试
                </a>
                <a 
                  href="/ref-demo"
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 
                             text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  🎯 forwardRef 演示
                </a>
              </div>
              <p className="mt-4 text-xs">
                探索不同的 React 设计模式、状态管理方式和高级功能
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}