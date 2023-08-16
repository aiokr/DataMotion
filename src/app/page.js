"use client"

import { useState, useRef, useEffect } from 'react';
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
  const [frameCount, setFrameCount] = useState(1);// 使用useState Hook初始化代码编辑器的数量
  const frameRefs = useRef([]);// 使用useRef Hook创建一个引用，用于存储所有代码编辑器的引用

  // 定义一个函数，用于处理点击Reload按钮的事件
  const handleClick = () => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= frameRefs.current.length) {
        clearInterval(interval);
        return;
      }
      try {
        const newOption = eval(`(${frameRefs.current[i].current.value})`);  // 尝试解析代码编辑器中的内容为JavaScript对象
        chartRef.current.setOption(newOption, true);  // 使用新的配置更新图表
      } catch (error) {
        console.error('Invalid option:', error);// 如果解析失败，打印错误信息
      }
      i++;
    }, 5000);
  };



  useEffect(() => {
    while (frameRefs.current.length < frameCount) {
      frameRefs.current.push({ current: null });// 如果代码编辑器的数量增加，添加新的引用
    }
  }, [frameCount]);// 当frameCount变化时，重新执行这个effect

  // 定义一个函数，用于处理点击New DataFrame按钮的事件
  const handleNewFrame = () => {
    setFrameCount(prevCount => prevCount + 1);// 增加代码编辑器的数量
  };

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
        <div className='text-xl font-medium text-white pb-2'>Code Editor</div><div className='grid grid-cols-3 gap-2'>
          {frameRefs.current.map((ref, index) => (
            <textarea key={index} ref={ref} className='w-full aspect-video bg-white p-2 block col-span-3' />
          ))}
          <button onClick={handleNewFrame} className='p-2 my-2 flex flex-col items-center bg-white col-span-3'>New DataFrame</button>
          <button onClick={handleClick} className='p-2 my-2 flex flex-col items-center bg-white col-span-3'>Reload</button>
        </div>
      </section>
    </main>
  );
}

export default HomePage
