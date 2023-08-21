"use client"

import React, { useState, useRef, useEffect, createRef, RefObject } from 'react';
import { Combobox } from '@headlessui/react'
import EChartsComponent from './components/EChartsComponent';
import NeoFrameEditor from './components/FrameEditor';

import barTemplate from './components/echartOpt/bar.json';
import lineTemplate from './components/echartOpt/line.json';
import pieTemplate from './components/echartOpt/pie.json';

const chartModeList: string[] = [
  'Bar', 'Line', 'SmoothLine', 'Pie', 'Customize'
]

const HomePage: React.FC = () => {

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

  const chartRef = useRef<echarts.ECharts | null>(null);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [frames, setFrames] = useState<number[]>([]);
  const [textareaVisibility, setTextareaVisibility] = useState<Record<number, boolean>>({});
  const [NeoEditVisibility, setNeoEditVisibility] = useState<Record<number, boolean>>({});
  const [newFrameContent, setNewFrameContent] = useState<string>('');
  const [newFrameTime, setNewFrameTime] = useState<number>(0);
  const [chartMode, setChartMode] = useState<string>(chartModeList[0]);
  const [query, setQuery] = useState<string>('')


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
      const frameTimeRef = frameTimeRefs.current.find((ref, index) => frames[index] === key);
      if (!frameRef || !frameRef.current || !frameTimeRef || !frameTimeRefs.current) {
        console.error(`No ref found for frame ${key}`);
        return;
      }
      try {
        var option;
        eval(`option = ${frameRef.current}`);
        chartRef.current.setOption(option, true);
      } catch (error) {
        console.error('Invalid option', error);
      }
      i++;
      // 持续时间
      setTimeout(loadNextFrame, Number(frameTimeRef.current) * 1000);
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
      eval(`option = ${frameRef.current}`);
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
    frameTimeRefs.current.push(createRef()); // 为新的frame创建一个新的引用，并将其添加到frameTimes数组中
    console.log(frameRefs.current, frameTimeRefs.current)
  };

  const frameRefs = useRef<React.RefObject<string>[]>([]);
  const frameTimeRefs = useRef<React.RefObject<number>[]>([]);
  const newFrameRef = useRef<string | null>(null);
  const newTimeRef = useRef<number | null>(null);

  // 带有参数的新建数据帧
  const newFrame = (frameContent = '', frameTime: number) => {
    const frameTimeAsNumber = Number(frameTime);
    if (isNaN(frameTimeAsNumber)) {
      console.error('frameTime is not a number:', frameTime);
      return;
    }

    setFrameCount(prevCount => prevCount + 1);
    setFrames(prevFrames => [...prevFrames, frameCount]);

    // 更新ref
    frameRefs.current.push({ current: frameContent });
    frameTimeRefs.current.push({ current: frameTime });

    console.log(frameContent, frameTime)
  };

  // 根据模板新建关键帧
  const newTemplateFrame = () => {
    let templateContent;
    if (chartMode === 'Bar') { // 新建柱状图
      templateContent = JSON.stringify(barTemplate, null, 5);
    } else if (chartMode === 'Line') { // 新建折线图
      templateContent = JSON.stringify(lineTemplate, null, 5);
    } else if (chartMode === 'Pie') { // 新建饼图
      templateContent = JSON.stringify(pieTemplate, null, 5);
    } else {
      templateContent = 'There is no template for this type';
    }
    newFrame(templateContent, 5);
  }

  // 数据帧的复制
  const duplicateFrame = (keyToDuplicate) => {
    const frameToDuplicate = frameRefs.current.find((ref, index) => frames[index] === keyToDuplicate);
    const timeToDuplicate = frameTimeRefs.current.find((ref, index) => frames[index] === keyToDuplicate);
    console.log(frameToDuplicate, timeToDuplicate)
    if (!frameToDuplicate || !frameToDuplicate.current || !timeToDuplicate || !timeToDuplicate.current) {
      console.error(`No ref found for frame ${keyToDuplicate}`);
      return;
    }
    const newFrameContent = frameToDuplicate.current;
    const newFrameTime = timeToDuplicate.current;

    // 判断数据的代码、持续时间是否为空
    if (newFrameContent === '') {
      console.error('frameCode is empty')
      return;
    }
    newFrame(newFrameContent, newFrameTime);
  };



  // 数据帧的删除
  const handleDeleteFrame = (keyToDelete) => {
    setFrames(prevFrames => prevFrames.filter(key => key !== keyToDelete));
    const indexToDelete = frameRefs.current.findIndex((ref, index) => frames[index] === keyToDelete);
    frameRefs.current.splice(indexToDelete, 1);
    frameTimeRefs.current.splice(indexToDelete, 1);
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
    // 也改变 frameRefs 和 frameTimeRefs 数组的顺序
    const frameIndex = frameRefs.current.findIndex((ref, index) => frames[index] === key);
    const temp = frameRefs.current[frameIndex - 1];
    frameRefs.current[frameIndex - 1] = frameRefs.current[frameIndex];
    frameRefs.current[frameIndex] = temp;
    const tempTime = frameTimeRefs.current[frameIndex - 1];
    frameTimeRefs.current[frameIndex - 1] = frameTimeRefs.current[frameIndex];
    frameTimeRefs.current[frameIndex] = tempTime;
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
    // 也改变 frameRefs 和 frameTimeRefs 数组的顺序
    const frameIndex = frameRefs.current.findIndex((ref, index) => frames[index] === key);
    const temp = frameRefs.current[frameIndex + 1];
    frameRefs.current[frameIndex + 1] = frameRefs.current[frameIndex];
    frameRefs.current[frameIndex] = temp;
    const tempTime = frameTimeRefs.current[frameIndex + 1];
    frameTimeRefs.current[frameIndex + 1] = frameTimeRefs.current[frameIndex];
    frameTimeRefs.current[frameIndex] = tempTime;
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

  // 修改背景颜色

  const setWhiteBg = () => {
    document.getElementById('ChartArea').style.backgroundImage = `none`;
    document.getElementById('ChartArea').style.backgroundColor = 'white';

  }


  const setBlueBg = () => {
    document.getElementById('ChartArea').style.backgroundImage = `none`;
    document.getElementById('ChartArea').style.backgroundColor = 'blue';

  }

  const setGreenBg = () => {
    document.getElementById('ChartArea').style.backgroundImage = `none`;
    document.getElementById('ChartArea').style.backgroundColor = 'green';

  }

  const setImageBg = (event: React.ChangeEvent<HTMLInputElement>) => {
    const bgImage = event.target.files && event.target.files[0];
    if (bgImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        document.getElementById('ChartArea').style.backgroundImage = `url(${reader.result})`;
        document.getElementById('ChartArea').style.backgroundSize = 'cover';  // 背景图片覆盖整个元素
        document.getElementById('ChartArea').style.backgroundRepeat = 'no-repeat';  // 背景图片不重复
        document.getElementById('ChartArea').style.backgroundPosition = 'center';  // 背景图片居中
      };
      reader.readAsDataURL(bgImage);
    }
  }


  return (
    <main className="grid grid-cols-none grid-rows-6 md:grid-rows-none md:grid-cols-12 h-screen w-screen gap-6 p-6 bg-zinc-800 text-zinc-100">
      <div className='row-span-2 md:col-span-6'>
        <section id='ChartArea' className='aspect-video bg-white p-2 w-[95%] my-0 mx-[auto] md:w-full'>
          <EChartsComponent option={option} onChartReady={chart => chartRef.current = chart} width='auto' height='auto' />
        </section>
        <div className='grid grid-cols-2 gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={handleClick} className='block py-1 px-2 text-md text-main border-main border-2 rounded-lg' data-umami-event="playMotion">Play DataMotion</button>
        </div>
        <div className='grid grid-cols-6 gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={setWhiteBg} className='block py-1 px-1 text-xs text-white border-white border-2 rounded-lg'>White Screen</button>
          <button onClick={setBlueBg} className='block py-1 px-1 text-xs text-blue-500 border-blue-500 border-2 rounded-lg'>Blue Screen</button>
          <button onClick={setGreenBg} className='block py-1 px-1 text-xs text-green-500 border-green-500 border-2 rounded-lg'>Green Screen</button>
          <input type="file" accept="image/*" onChange={setImageBg} className='block py-1 px-1 text-xs text-green-500 border-green-500 bg-transparent border-2 rounded-lg'></input>
        </div>
        <div className='flex flex-row gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
          <button onClick={handleNewFrame} className='flex-1 py-1 px-2 text-md  border-2 rounded-lg' data-umami-event="newBlankDataFrame">New Blank DataFrame</button>
          <button onClick={newTemplateFrame} className='flex-1 py-1 px-2 text-md  border-2 rounded-lg' data-umami-event="newTemplateDataFrame">New Template DataFrame</button>
        </div>
        <Combobox value={chartMode} onChange={setChartMode}>
          <div className='flex flex-row gap-2'>
            <Combobox.Input onChange={(event) => setQuery(event.target.value)} className='grow bg-zinc-800 py-1 border-2 text-center rounded-lg' />
            <Combobox.Button className="bg-zinc-800 px-2 py-1 border-2 text-center rounded-lg">Choose Template</Combobox.Button>
          </div>
          <Combobox.Options className='relative text-center shadow-lg bg-zinc-800 mt-2 py-1 border rounded-lg'>
            {filteredChartMode.map((chartMode) => (
              <Combobox.Option key={chartMode} value={chartMode}>
                {chartMode}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>
      </div>
      <section id="EditArea" className='row-span-4 md:col-span-6'>
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
              frameTimeRefs={frameTimeRefs}
              frameRefs={frameRefs}
              chartMode={chartMode} // chartMode 用于记录当前的图表模式
            />
          ))}
        </div>
        <div id='EditFloatButton' className='flex gap-2 my-4 w-[95%] md:w-full mx-[auto]'>
        </div>
      </section>
    </main >
  );
}

export default HomePage;
