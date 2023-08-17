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
  const [textareaVisibility, setTextareaVisibility] = useState({}); // 新增状态变量textareaVisibility
  const [NeoEditVisibility, setNeoEditVisibility] = useState({}); // 新增状态变量NeoEditVisibility

  // 定义一个函数，用于处理点击Reload按钮的事件
  const handleClick = () => {
    let i = 0;

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
      // 持续时间
      setTimeout(loadNextFrame, Number(frameTime.current.value) * 1000);
    };
    loadNextFrame();
  };

  // 数据帧预览
  const preivewFrame = (keyToPreview) => {
    const frameRef = frameRefs.current.find((ref, index) => frames[index] === keyToPreview);
    if (!frameRef || !frameRef.current) {
      console.error(`No ref found for frame ${keyToPreview}`);
      return;
    }
    try {
      const newOption = eval(`(${frameRef.current.value})`);
      chartRef.current.setOption(newOption, true);
    } catch (error) {
      console.error('Invalid option:', error);
    }
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

  //数据帧的移动（编辑顺序）
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

  // 新增一个函数，用于切换指定key的 代码编辑器 的显示/隐藏状态
  const toggleTextarea = (key) => {
    setTextareaVisibility(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  // 新增一个函数，用于切换指定key的 可视化编辑器 的显示/隐藏状态
  const toggleNewEditor = (key) => {
    setNeoEditVisibility(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  useEffect(() => {
    while (frameRefs.current.length < frames.length) {
      frameRefs.current.push(createRef());
    }
  }, [frames.length]);

  return (
    <main className="grid grid-cols-12 h-screen w-screen gap-6 p-6 bg-zinc-800 text-zinc-100">
      <div className='col-span-6' >
        <div className='text-xl font-medium pb-2'>Chart Area</div>
        <section id='ChartArea' className='aspect-video bg-white p-2'>
          <EChartsComponent option={option} onChartReady={chart => chartRef.current = chart} />
        </section>
        <div className='grid grid-cols-3 gap-2 my-6'>
          <button onClick={handleClick} className='p-2 flex flex-col items-center border rounded-full'>Reload</button>
        </div>
      </div>
      <section id="EditArea" className='col-span-6'>
        <div className='text-xl font-medium pb-2'>DataFrame Editor</div>
        <div className='pb-2 overflow-y-auto w-[98%] h-[calc(100vh-140px)]'>
          {frames.map((key, index) => (
            <div key={key} className='w-full bg-zinc-600 p-4 mb-4 transition rounded-lg block'>
              <div className='py-2 grid grid-cols-12'>
                <div className='col-span-11'>
                  <div className='text-xl font-bold pb-2'>DataFrame Key: {key} / Index: {index}</div>
                  <div>
                    Time <input ref={frameTimes.current[index]} className='bg-zinc-800 p-2 ml-2 rounded-lg'></input>
                  </div>
                </div>
                <div className='col-span-1 grid grid-rows-2 gap-1 pb-4'>
                  <button onClick={() => handleMoveUp(key)} className='bg-zinc-500 rounded-lg text-sm'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 m-[auto]">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button onClick={() => handleMoveDown(key)} className='bg-zinc-500 rounded-lg text-sm'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 m-[auto]">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* 编辑器显示/隐藏按钮 */}
              <div className='grid grid-cols-2 gap-4'>
                <button onClick={() => toggleTextarea(key)} className="bg-zinc-500 rounded-lg py-2 w-full">
                  Code Editor
                </button>
                <button onClick={() => toggleNewEditor(key)} className="bg-zinc-500 rounded-lg py-2 w-full">
                  Neo Editor
                </button>
              </div>
              {/* 代码编辑器 */}
              <textarea
                ref={frameRefs.current[index]}
                className='w-full h-48 p-2 my-2 rounded-lg bg-zinc-800'
                style={{ display: textareaVisibility[key] ? 'none' : 'block' }}
              />
              {/* 可视化编辑器 */}
              <div
                className='w-full p-2 my-2 '
                style={{ display: NeoEditVisibility[key] ? 'block' : 'none' }}>Neo Editor (Codeing……) </div>
              <div className='mt-4 flex gap-2'>
                <button onClick={() => preivewFrame(key)} className='flex-1 py-1 px-2 text-sm  border-2 rounded-lg'>Preivew</button>
                <button onClick={() => handleDeleteFrame(key)} className='py-1 px-2 text-sm text-red-400 border-red-500 border-2 rounded-lg float-right'>Delete</button>
              </div>

            </div>
          ))}
        </div>
        <div id='EditFloatButton' className=''>
          <button onClick={handleNewFrame} className=' my-4  py-2 px-4  border rounded-full'>New DataFrame</button>
        </div>
      </section>
    </main >
  );
}

export default HomePage
