import React from 'react';
import { useState, useRef, useEffect, createRef, RefObject } from 'react';

interface DataFrameEditorProps {
  frameKey: number;
  index: number;
  handleMoveUp: (key: number) => void;
  handleMoveDown: (key: number) => void;
  toggleTextarea: (key: number) => void;
  toggleNewEditor: (key: number) => void;
  textareaVisibility: { [key: number]: boolean };
  NeoEditVisibility: { [key: number]: boolean };
  preivewFrame: (key: number) => void;
  duplicateFrame: (key: number) => void;
  handleDeleteFrame: (key: number) => void;
  frameTimeRefs: RefObject<{ current: number }[]>;
  frameRefs: RefObject<{ current: string }[]>;
  chartMode: string;
}

const DataFrameEditor: React.FC<DataFrameEditorProps> = ({ frameKey, index, handleMoveUp, handleMoveDown, toggleTextarea, toggleNewEditor, textareaVisibility, NeoEditVisibility, preivewFrame, duplicateFrame, handleDeleteFrame, frameTimeRefs, frameRefs, chartMode }) => {
  const [dataFrameNum, setDataFrameNum] = useState<number | null>(null);
  const [dataFrameType, setDataFrameType] = useState<string | null>(null);
  const [hiddenDataArea, setHiddenDataArea] = useState<any>(null);
  const [frameTime, setFrameTime] = useState(frameTimeRefs.current[index]?.current || 0);
  const [frame, setFrame] = useState(frameRefs.current[index]?.current);


  // 获取数据帧输入，并格式化和解析
  const getDataFrame = () => {
    if (chartMode !== 'Customize') { // 当 Others 时，不格式化代码
      try {
        const optionRawText = frameRefs[index].current.value; // 获取数据帧的代码
        const time = frameTimeRefs; // 获取数据帧的持续时间代码
        const optionJsCode = eval('(' + optionRawText + ')'); // 解析数据帧的代码
        let optionTextJson = JSON.stringify(optionJsCode, null, 2);  // 将数据帧的代码转换为 JSON 格式
        let optionStatus = JSON.parse(optionTextJson); // 解析 JSON 格式的数据帧为 JS 对象

        console.log(time)

        if (optionStatus.series[0].data !== null) {
          setDataFrameNum(optionStatus.series[0].data);
        }
        if (optionStatus.series[0].type !== null) {
          setDataFrameType(optionStatus.series[0].type);
        }

        const newOptionTextJson = JSON.stringify(optionStatus, null, 2); // 将 JS 对象转换为 JSON 格式
        frameRefs[index].current.value = newOptionTextJson; // 回输数据帧的代码

      } catch (error) {
        // 这里可以处理错误，例如显示一条错误消息
        console.error('An error occurred:', error);
      }
    }
  }

  let hiddenData = (function () {
    let storedData = []; // 这个数组将存储所有传入的数据
    return function (data) {
      storedData.push(data); // 将新数据添加到数组
      console.log(storedData);
      return storedData; // 返回存储的数据
    }
  })();

  return (
    <div className='w-full bg-zinc-600 px-4 py-3 mb-5 transition rounded-lg block'>
      <div className='grid grid-cols-12 pb-2'>
        <div className='col-span-11'>
          <div className='text-md md:text-lg font-bold pb-2'>DataFrame Key: {frameKey} / Index: {index}</div>
          <div className='flex flex-row items-center'>Duration Seconds
            <input
              type="number"
              value={frameTimeRefs.current[index].current || 0}
              onChange={e => {
                setFrameTime(Number(e.target.value));
                frameTimeRefs.current[index].current = Number(e.target.value);
              }}
              className='inline border-2 border-zinc-700 bg-zinc-600 mx-2 px-2 py-1 w-12  text-center rounded-lg text-sm'
              style={{ display: textareaVisibility[frameKey] ? 'none' : 'block' }}
            />
          </div>
        </div>
        <div className='col-span-1 grid grid-rows-2 gap-1 pb-4'>
          <button onClick={() => handleMoveUp(frameKey)} className='bg-zinc-500 rounded-lg text-sm'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 m-[auto]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button onClick={() => handleMoveDown(frameKey)} className='bg-zinc-500 rounded-lg text-sm'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 m-[auto]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
      {/* 编辑器显示/隐藏按钮 */}
      <div className='mt-4 flex gap-2'>
        <button onClick={() => toggleTextarea(frameKey)} className="flex-1 rounded-lg text-sm py-1 border-2 border-zinc-700">
          Code Editor
        </button>
        <button onClick={() => toggleNewEditor(frameKey)} className="flex-1 rounded-lg text-sm py-1 border-2 border-zinc-700">
          Neo Editor
        </button>
      </div>
      {/* 代码编辑器 */}
      <textarea
        value={frameRefs.current[index].current}
        onChange={e => {
          setFrame(e.target.value);
          frameRefs.current[index].current = e.target.value;
        }}
        className='w-full h-48 p-2 my-2 rounded-lg bg-zinc-800 focus:outline-main'
        style={{ display: textareaVisibility[frameKey] ? 'none' : 'block' }}
      />
      {/* 可视化编辑器 */}
      <div
        className='w-full p-2 my-2 rounded-lg border-2 border-main'
        style={{ display: NeoEditVisibility[frameKey] ? 'block' : 'none' }}>
        Neo Editor (Codeing……)
      </div>
      <div className='mt-2 flex gap-2'>
        <button onClick={() => preivewFrame(frameKey)} className='flex-1 py-1 px-2 text-sm border-2 border-zinc-700 rounded-lg'>Preivew</button>
        <button onClick={() => duplicateFrame(frameKey)} className='flex-1 py-1 px-2 text-sm  border-2 border-zinc-700 rounded-lg'>Duplicate</button>
        <button onClick={() => handleDeleteFrame(frameKey)} className='py-1 px-2 text-sm text-red-400 border-red-500 border-2 rounded-lg float-right'>Delete</button>
      </div>
    </div>
  );
};

export default DataFrameEditor;