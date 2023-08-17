"use client"

import { useState, useRef, useEffect, createRef } from 'react';
import EChartsComponent from './components/EChartsComponent';

export function HomePage() {

  //默认图谱
  const [option] = useState({
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data: ['']
    },
    xAxis: {
      data: []
    },
    yAxis: {},
    series: [
      {
        name: '',
        type: 'bar',
        data: []
      }
    ]
  });

  const chartRef = useRef(null);// 使用useRef Hook创建一个引用，用于存储图表实例
  const [frameCount, setFrameCount] = useState(0); // 使用一个计数器来生成唯一的key
  const [frames, setFrames] = useState([]); // 新增状态变量frames
  const frameRefs = useRef([]);// 使用useRef Hook创建一个引用，用于存储所有代码编辑器的引用
  const frameTimes = useRef([]);// 使用useRef Hook创建一个引用，用于存储持续时间的引用

  // 定义一个函数，用于处理点击Reload按钮的事件
  const handleClick = () => {
    let i = 0;
    // 持续时间
    const loadNextFrame = () => {
      if (i >= frames.length) {
        return;
      }
      const key = frames[i];
      const frameRef = frameRefs.current.find((ref, index) => frames[index] === key);
      const frameTime = frameTimes.current.find((ref, index) => frames[index] === key);
      if (!frameRef || !frameRef.current || !frameTime || !frameTime.current) {
        console.error(`No ref found for frame ${key}`);
        return;
      }
      try {
        const newOption = eval(`(${frameRef.current.value})`);
        chartRef.current.setOption(newOption, true);
      } catch (error) {
        console.error('Invalid option:', error);
      }
      i++;
      setTimeout(loadNextFrame, Number(frameTime.current.value) * 1000);
    };
    loadNextFrame();
  };

  //数据帧的增加与删除
  const handleNewFrame = () => {
    setFrameCount(prevCount => prevCount + 1); // 每次添加一个新元素时，都增加计数器的值
    setFrames(prevFrames => [...prevFrames, frameCount]); // 使用计数器的值作为新元素的key
    frameRefs.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameRefs数组中
    frameTimes.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameTimes数组中
  };


  const handleDeleteFrame = (keyToDelete) => {
    setFrames(prevFrames => prevFrames.filter(key => key !== keyToDelete));
    const indexToDelete = frameRefs.current.findIndex((ref, index) => frames[index] === keyToDelete);
    frameRefs.current.splice(indexToDelete, 1);
  };

  const handleMoveUp = (key) => {
    setFrames(prevFrames => {
      const frameIndex = prevFrames.findIndex(frame => frame === key);
      if (frameIndex === 0) { // 如果已经在最顶部，无法再向上移动
        return prevFrames;
      }
      const updatedFrames = [...prevFrames];
      const temp = updatedFrames[frameIndex - 1];
      updatedFrames[frameIndex - 1] = updatedFrames[frameIndex];
      updatedFrames[frameIndex] = temp;
      return updatedFrames;
    });
  };

  const handleMoveDown = (key) => {
    setFrames(prevFrames => {
      const frameIndex = prevFrames.findIndex(frame => frame === key);
      if (frameIndex === prevFrames.length - 1) { // 如果已经在最底部，无法再向下移动
        return prevFrames;
      }
      const updatedFrames = [...prevFrames];
      const temp = updatedFrames[frameIndex + 1];
      updatedFrames[frameIndex + 1] = updatedFrames[frameIndex];
      updatedFrames[frameIndex] = temp;
      return updatedFrames;
    });
  };


  useEffect(() => {
    while (frameRefs.current.length < frames.length) {
      frameRefs.current.push(createRef());
    }
  }, [frames.length]);

  return (
    <main className="grid grid-cols-12 min-h-screen gap-6 p-6">
      <div className='col-span-6 '>
        <div className='text-xl font-medium text-white pb-2'>Video Area</div>
        <section id='ChartArea' className='aspect-video bg-white p-2'>
          <EChartsComponent option={option} onChartReady={chart => chartRef.current = chart} />
        </section>
        <div className='grid grid-cols-3 gap-2'>
          <button className='p-2 my-2 flex flex-col items-center bg-white'>Start Rec</button>
        </div>
      </div>
      <section id="EditArea" className='col-span-6'>
        <div className='text-xl font-medium text-white pb-2'>Code Editor</div>
        <div id='EditFloatButton' className='grid grid-cols-2 gap-2 fixed z-10 w-auto shadow-2xl bottom-12'>
          <button onClick={handleNewFrame} className='p-2 flex flex-col items-center bg-white'>New DataFrame</button>
          <button onClick={handleClick} className='p-2 flex flex-col items-center bg-white'>Reload</button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {frames.map((key, index) => (
            <div key={key} className='w-full  bg-white p-2 block col-span-3'>
              DataFrame Key: {key} / Index: {index} / Time <input ref={frameTimes.current[index]}></input>
              <button onClick={() => handleMoveUp(key)}>Move Up</button>
              <button onClick={() => handleMoveDown(key)}>Move Down</button>
              <textarea ref={frameRefs.current[index]} className='border w-full h-48 p-2' />
              <button onClick={() => handleDeleteFrame(key)} className='p-2 my-2 flex flex-col items-center bg-white'>Delete</button>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}

export default HomePage
