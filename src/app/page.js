"use client"

import { useState, useRef, useEffect } from 'react';
import EChartsComponent from './components/EChartsComponent';

export function HomePage() {
  const [option, setOption] = useState({
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
  const inputFrame0 = useRef(); //代码编辑器
  const inputFrame1 = useRef(); //代码编辑器
  const chartRef = useRef(null);
  const inputChartType = useRef(); //图谱样式

  useEffect(() => {
    // 加载第一帧
    try {
      const newOption = eval(`(${inputFrame0.current.value})`);
      setOption(newOption);
    } catch (error) {
      console.error('Invalid option:', error);
    }

    // 10秒后加载第二帧
    const timer = setTimeout(() => {
      try {
        const newOption = eval(`(${inputFrame1.current.value})`);
        setOption(newOption);
      } catch (error) {
        console.error('Invalid option:', error);
      }
    }, 5000); // 5000毫秒 = 10秒

    // 清除定时器
    return () => clearTimeout(timer);
  }, []);


  //按下 Reload 按钮重载图谱
  const handleClick = () => {
    // 加载第一帧
    try {
      const newOption = eval(`(${inputFrame0.current.value})`);
      chartRef.current.setOption(newOption, true);
    } catch (error) {
      console.error('Invalid option:', error);
    }

    // 10秒后加载第二帧
    setTimeout(() => {
      try {
        const newOption = eval(`(${inputFrame1.current.value})`);
        chartRef.current.setOption(newOption, true);
      } catch (error) {
        console.error('Invalid option:', error);
      }
    }, 5000); // 5000毫秒 = 10秒
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
          <textarea ref={inputFrame0} className='w-full aspect-video bg-white p-2 block col-span-3' />

          <textarea ref={inputFrame1} className='w-full aspect-video bg-white p-2 block col-span-3' />

          <button onClick={handleClick} className='p-2 my-2 flex flex-col items-center bg-white col-span-3'>Reload</button>
        </div>
      </section>
    </main>
  );
}

export default HomePage
