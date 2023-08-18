"use client"

import React from 'react';
import { useState, useRef, useEffect, createRef } from 'react';
import EChartsComponent from './components/EChartsComponent';
import NeoFrameEditor from './components/NeoFrameEditor';

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
  const [newFrameContent, setNewFrameContent] = useState(''); // 
  const [newFrameTime, setNewFrameTime] = useState(''); //

  // 定义一个函数，用于处理点击Reload按钮的事件
  const handleClick = () => {
    console.log('Reload ECharts');
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
    console.log(keyToPreview, frameRefs)
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

  //数据帧的增加
  const handleNewFrame = () => {
    setFrameCount(prevCount => prevCount + 1); // 每次添加一个新元素时，都增加计数器的值
    setFrames(prevFrames => [...prevFrames, frameCount]); // 使用计数器的值作为新元素的key
    frameRefs.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameRefs数组中
    frameTimes.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameTimes数组中
    console.log(frameRefs.current, frameTimes.current)
  };

  //带有参数的数据帧的增加
  const newFrame = (frameContent = '', frameTime = '') => {
    console.log(frameContent, frameTime)
    setFrameCount(prevCount => prevCount + 1); // 每次添加一个新元素时，都增加计数器的值
    setFrames(prevFrames => [...prevFrames, frameCount]); // 使用计数器的值作为新元素的key
    const newFrameRef = createRef();
    newFrameRef.current = frameContent;
    frameRefs.current.push(newFrameRef); // 将newFrameRef添加到frameRefs数组中
    const newTimeRef = createRef();
    newTimeRef.current = frameTime;
    frameTimes.current.push(newTimeRef); // 将newTimeRef添加到frameTimes数组中
  };

  //数据帧的复制
  const duplicateFrame = (keyToDuplicate) => {
    const frameToDuplicate = frameRefs.current.find((ref, index) => frames[index] === keyToDuplicate);
    const timeToDuplicate = frameTimes.current.find((ref, index) => frames[index] === keyToDuplicate);
    if (!frameToDuplicate || !frameToDuplicate.current || !timeToDuplicate || !timeToDuplicate.current) {
      console.error(`No ref found for frame ${keyToDuplicate}`);
      return;
    }
    const newFrameContent = frameToDuplicate.current.value;
    const newFrameTime = timeToDuplicate.current.value;
    if (newFrameContent === '' || newFrameTime === '') {
      console.error('time or frameCode is empty')
      return;
    }
    newFrame(newFrameContent, newFrameTime);
  };

  useEffect(() => {
    if (newFrameContent !== '' && frameRefs.current.length > 0) {
      const newFrameRef = frameRefs.current[frameRefs.current.length - 1];
      if (newFrameRef && newFrameRef.current) {
        newFrameRef.current.value = newFrameContent;
      }
    }
    if (newFrameTime !== '' && frameTimes.current.length > 0) {
      const newTimeRef = frameTimes.current[frameTimes.current.length - 1];
      if (newTimeRef && newTimeRef.current) {
        newTimeRef.current.value = newFrameTime;
      }
    }
  }, [newFrameContent, newFrameTime]);

  //数据帧的删除
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
    <main className="grid grid-cols-none grid-rows-6 md:grid-rows-none md:grid-cols-12 h-screen w-screen gap-6 p-6 bg-zinc-800 text-zinc-100">
      <div className='row-span-2 md:col-span-6'>
        <div className='text-xl font-medium pb-2'>Chart Area</div>
        <section id='ChartArea' className='aspect-video bg-white p-2 w-[95%] my-0 mx-[auto] md:w-full'>
          <EChartsComponent option={option} onChartReady={chart => chartRef.current = chart} />
        </section>
        <div className='grid grid-cols-3 gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={handleClick} className='px-1 md:p-2 flex flex-col items-center border rounded-full'>Reload</button>
        </div>
      </div>
      <section id="EditArea" className='row-span-4 md:col-span-6'>
        <div className='text-xl font-medium pb-2'>DataFrame Editor</div>
        <div className='pb-2 overflow-y-auto h-[80%] w-[95%] md:w-[98%] md:h-[calc(100vh-140px)] mx-[auto]'>
          {frames.map((key, index) => (
            <NeoFrameEditor
              key={key}
              frameKey={key}
              index={index}
              handleMoveUp={handleMoveUp}
              handleMoveDown={handleMoveDown}
              toggleTextarea={toggleTextarea}
              toggleNewEditor={toggleNewEditor}
              textareaVisibility={textareaVisibility}
              NeoEditVisibility={NeoEditVisibility}
              preivewFrame={preivewFrame}
              duplicateFrame={duplicateFrame}
              handleDeleteFrame={handleDeleteFrame}
              frameTimes={frameTimes}
              frameRefs={frameRefs}
            />
          ))}
        </div>
        <div id='EditFloatButton' className='grid grid-cols-2 gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={handleNewFrame} className='px-1 md:p-2 flex flex-col items-center border rounded-full'>New DataFrame</button>
        </div>
      </section>
    </main >
  );
}

export default HomePage
