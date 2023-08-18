"use client"

import React from 'react';
import { useState, useRef, useEffect, createRef } from 'react';
import { Combobox } from '@headlessui/react'
import EChartsComponent from './components/EChartsComponent';
import NeoFrameEditor from './components/NeoFrameEditor';
import barTemplate from './components/echartOpt/bar.json';
import lineTemplate from './components/echartOpt/line.json';
import pieTemplate from './components/echartOpt/pie.json';

const chartModeList = [
  'bar', 'line', 'smoothLine', 'pie', 'Others'
]

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
  const frameRefs = useRef([]); // 引用变量 frameRefs 是每一个 Dataframe 的主代码的内容
  const frameTimes = useRef([]);// 引用变量 frameTimes 是每一个 Dataframe 的持续时间

  const [frameCount, setFrameCount] = useState(0); // 使用一个计数器来生成 Dataframe 的唯一 key
  const [frames, setFrames] = useState([]); // 新增状态变量frames
  const [textareaVisibility, setTextareaVisibility] = useState({}); // 状态变量 textareaVisibility 用于记录代码编辑器的显示状态
  const [NeoEditVisibility, setNeoEditVisibility] = useState({}); // 状态变量 NeoEditVisibility 用于记录可视化编辑器的显示状态
  const [newFrameContent, setNewFrameContent] = useState(''); // 状态变量 newFrameContent
  const [newFrameTime, setNewFrameTime] = useState(''); // 状态变量 newFrameTime
  const [chartMode, setChartMode] = useState(chartModeList[0]); //状态变量 chartMode 用于记录当前的图表模式
  const [query, setQuery] = useState('')

  const filteredChartMode =
    query === ''
      ? chartModeList
      : chartModeList.filter((chartMode) => {
        return chartMode.toLowerCase().includes(query.toLowerCase())
      })

  // Play 按钮，播放当前完整的图表动画
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
        var option;
        eval(`option = ${frameRef.current.value}`);
        chartRef.current.setOption(option, true);
      } catch (error) {
        console.error('Invalid option', error);
      }
      i++;
      // 持续时间
      setTimeout(loadNextFrame, Number(frameTime.current.value) * 1000);
    };
    loadNextFrame();
  };

  // 预览这一数据帧
  const preivewFrame = (keyToPreview) => {
    console.log(keyToPreview, frameRefs)
    const frameRef = frameRefs.current.find((ref, index) => frames[index] === keyToPreview);
    if (!frameRef || !frameRef.current) {
      console.error(`No ref found for frame ${keyToPreview}`);
      return;
    }
    try {
      var option
      eval(`option = ${frameRef.current.value}`);
      chartRef.current.setOption(option, true);
    } catch (error) {
      console.error('Invalid option:', error);
    }
  };

  // 新建空白数据帧
  const handleNewFrame = () => {
    setFrameCount(prevCount => prevCount + 1); // 每次添加一个新元素时，都增加计数器的值
    setFrames(prevFrames => [...prevFrames, frameCount]); // 使用计数器的值作为新元素的key
    frameRefs.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameRefs数组中
    frameTimes.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameTimes数组中
    console.log(frameRefs.current, frameTimes.current)
  };

  // 带有参数的新建数据帧
  const newFrame = (frameContent = '', frameTime = '') => {
    setFrameCount(prevCount => prevCount + 1); // 每次添加一个新元素时，都增加计数器的值
    setFrames(prevFrames => [...prevFrames, frameCount]); // 使用计数器的值作为新元素的key
    const newFrameRef = createRef();
    newFrameRef.current = frameContent;
    frameRefs.current.push(newFrameRef); // 将newFrameRef添加到frameRefs数组中
    const newTimeRef = createRef();
    newTimeRef.current = frameTime;
    frameTimes.current.push(newTimeRef); // 将newTimeRef添加到frameTimes数组中
  };

  // 根据模板新建关键帧
  const newTemplateFrame = () => {
    console.log('Now Chart Mode is ' + chartMode)
    if (chartMode == 'bar') { // 新建柱状图
      const barTemplateString = JSON.stringify(barTemplate, null, 5);
      newFrame(barTemplateString, 5);
    } else if (chartMode == 'line') { // 新建折线图
      const lineTemplateString = JSON.stringify(lineTemplate, null, 5);
      newFrame(lineTemplateString, 5);
    } else if (chartMode == 'pie') { // 新建饼图
      const pieTemplateString = JSON.stringify(pieTemplate, null, 5);
      newFrame(pieTemplateString, 5);
    } else {
      newFrame('There is no template for this type', 5);
    }
  }

  // 数据帧的复制
  const duplicateFrame = (keyToDuplicate) => {
    const frameToDuplicate = frameRefs.current.find((ref, index) => frames[index] === keyToDuplicate); // 找到要复制的数据帧的代码内容
    const timeToDuplicate = frameTimes.current.find((ref, index) => frames[index] === keyToDuplicate); // 找到要复制的数据帧的持续时间
    if (!frameToDuplicate || !frameToDuplicate.current || !timeToDuplicate || !timeToDuplicate.current) {
      console.error(`No ref found for frame ${keyToDuplicate}`);
      return;
    }
    const newFrameContent = frameToDuplicate.current.value;
    const newFrameTime = timeToDuplicate.current.value;

    // 判断数据的代码、持续时间是否为空
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
        newFrameRef.current.value = newFrameContent; // 将被复制的数据帧的代码赋值给最后一个数据帧
      }
    }
    if (newFrameTime !== '' && frameTimes.current.length > 0) {
      const newTimeRef = frameTimes.current[frameTimes.current.length - 1];
      if (newTimeRef && newTimeRef.current) {
        newTimeRef.current.value = newFrameTime; // 将被复制的数据帧的持续时间赋值给最后一个数据帧
      }
    }
  }, [newFrameContent, newFrameTime]);

  // 数据帧的删除
  const handleDeleteFrame = (keyToDelete) => {
    setFrames(prevFrames => prevFrames.filter(key => key !== keyToDelete));
    const indexToDelete = frameRefs.current.findIndex((ref, index) => frames[index] === keyToDelete);
    frameRefs.current.splice(indexToDelete, 1);
  };

  // 数据帧的上移
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

  // 数据帧的下移
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

  // 切换指定key的 代码编辑器 的显示/隐藏状态
  const toggleTextarea = (key) => {
    setTextareaVisibility(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  // 切换指定key的 可视化编辑器 的显示/隐藏状态
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
      <div className='row-span-2 md:col-span-7'>
        <div className='text-xl font-medium pb-2'>Chart Area</div>
        <section id='ChartArea' className='aspect-video bg-white p-2 w-[95%] my-0 mx-[auto] md:w-full'>
          <EChartsComponent option={option} onChartReady={chart => chartRef.current = chart} />
        </section>
        <div className='flex flex-row gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={handleClick} className='py-1 px-2 text-md text-main border-main border-2 rounded-lg'>Play DataMotion</button>
        </div>
        <div className='flex gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <div>
            <Combobox value={chartMode} onChange={setChartMode}>
              <Combobox.Input onChange={(event) => setQuery(event.target.value)} className='bg-zinc-800 py-1 border text-center rounded-lg w-20' />
              <Combobox.Options className='bg-zinc-800 mt-2 py-1 border text-center rounded-lg w-20'>
                {filteredChartMode.map((chartMode) => (
                  <Combobox.Option key={chartMode} value={chartMode}>
                    {chartMode}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox>
          </div>
        </div>
      </div>
      <section id="EditArea" className='row-span-4 md:col-span-5'>
        <div className='text-xl font-medium pb-2'>DataFrame Editor</div>
        <div className='pb-2 overflow-y-auto h-[80%] w-[95%] md:w-full md:h-[calc(100vh-140px)] mx-[auto]'>
          {frames.map((key, index) => (
            <NeoFrameEditor
              key={key}      // key 无法作为 props 传递到子组件
              frameKey={key} // 因此设立一个 frameKey 作为 key
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
              chartMode={chartMode} // chartMode 用于记录当前的图表模式
            />
          ))}
        </div>
        <div id='EditFloatButton' className='grid grid-cols-2 gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={handleNewFrame} className='px-1 md:p-2 flex flex-col items-center border rounded-full'>New Blank DataFrame</button>
          <button onClick={newTemplateFrame} className='px-1 md:p-2 flex flex-col items-center border rounded-full'>New Template DataFrame</button>
        </div>
      </section>
    </main >
  );
}

export default HomePage
