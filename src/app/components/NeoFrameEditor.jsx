import { useState, useRef, useEffect, createRef } from 'react';
const DataFrameEditor = ({ frameKey, index, handleMoveUp, handleMoveDown, toggleTextarea, toggleNewEditor, textareaVisibility, NeoEditVisibility, preivewFrame, duplicateFrame, handleDeleteFrame, frameTimes, frameRefs }) => {
  return (
    <div className='w-full bg-zinc-600 p-4 mb-4 transition rounded-lg block'>
      <div className='py-2 grid grid-cols-12'>
        <div className='col-span-11'>
          <div className='text-lg md:text-xl font-bold pb-2'>DataFrame Key: {frameKey} / Index: {index}</div>
          <div>
            Time <input ref={frameTimes.current[index]} defaultValue={frameTimes.current[index].current} className='bg-zinc-800 p-2 ml-2 rounded-lg'></input>          </div>
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
      <div className='grid grid-cols-2 gap-4'>
        <button onClick={() => toggleTextarea(frameKey)} className="bg-zinc-500 rounded-lg py-2 w-full">
          Code Editor
        </button>
        <button onClick={() => toggleNewEditor(frameKey)} className="bg-zinc-500 rounded-lg py-2 w-full">
          Neo Editor
        </button>
      </div>
      {/* 代码编辑器 */}
      <textarea
        ref={frameRefs.current[index]}
        defaultValue={frameRefs.current[index].current}
        className='w-full h-48 p-2 my-2 rounded-lg bg-zinc-800'
        style={{ display: textareaVisibility[frameKey] ? 'none' : 'block' }}
      />
      {/* 可视化编辑器 */}
      <div
        className='w-full p-2 my-2 '
        style={{ display: NeoEditVisibility[frameKey] ? 'block' : 'none' }}>Neo Editor (Codeing……) </div>
      <div className='mt-4 flex gap-2'>
        <button onClick={() => preivewFrame(frameKey)} className='flex-1 py-1 px-2 text-sm  border-2 rounded-lg'>Preivew</button>
        <button onClick={() => duplicateFrame(frameKey)} className='flex-1 py-1 px-2 text-sm  border-2 rounded-lg'>Duplicate</button>
        <button onClick={() => handleDeleteFrame(frameKey)} className='py-1 px-2 text-sm text-red-400 border-red-500 border-2 rounded-lg float-right'>Delete</button>
      </div>
    </div>
  );
};

export default DataFrameEditor;