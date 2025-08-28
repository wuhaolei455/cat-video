import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="card">
      <h2>计数器示例</h2>
      <p>当前计数: <strong>{count}</strong></p>
      <div style={{ marginTop: '1rem' }}>
        <button 
          className="button" 
          onClick={() => setCount(count - 1)}
          style={{ marginRight: '0.5rem' }}
        >
          -1
        </button>
        <button 
          className="button" 
          onClick={() => setCount(count + 1)}
        >
          +1
        </button>
      </div>
    </div>
  );
};

export default Counter;
