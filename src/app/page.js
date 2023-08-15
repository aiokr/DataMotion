"use client"

import { useState, useRef } from 'react';
import EChartsComponent from './components/EChartsComponent';

export function HomePage() {
  const [option, setOption] = useState({
    title: { text: '默认图表' },
    xAxis: {
      type: 'category',
      data: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [7, 5, 5, 7, 5, 7, 7],
        type: 'bar'
      }
    ]
  });
  const inputRef = useRef();

  const handleClick = () => {
    try {
      const newOption = eval(`(${inputRef.current.value})`);
      setOption(newOption);
    } catch (error) {
      console.error('Invalid option:', error);
    }
  };

  return (
    <main className="grid grid-cols-12 min-h-screen gap-6 p-6">
      <div className='col-span-6 '>
        <div className='text-xl font-medium text-white pb-2'>Video Area</div>
        <section id='ChartArea' className='aspect-video bg-white p-2'>
          <EChartsComponent option={option} />
        </section>
        <button className='w-full p-2 mt-2 flex flex-col radius items-center bg-white'>General Video</button>
      </div>
      <section id="EditArea" className='col-span-6'>
        <div className='text-xl font-medium text-white pb-2'>Code Editor</div>
        <textarea ref={inputRef} className='w-full aspect-video bg-white p-2 block' />
        <button onClick={handleClick} className='w-full p-2 mt-2 flex flex-col radius items-center bg-white'>Reload</button>
      </section>
    </main>
  );
}

export default HomePage
