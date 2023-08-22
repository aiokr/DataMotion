import style from './app.module.css'
import { Listbox } from '@headlessui/react'

interface AppHeaderProps {
  handleClick: () => void;
  newTemplateFrame: (chartModeId: number) => void;
  chartMode
  chartModeList;
  exportFile: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ handleClick, newTemplateFrame, chartMode, chartModeList, exportFile }) => {

  return (
    <section className={`${style.header} z-50 fixed w-full h-[56px] top-0 left-0 right-0 p-2 opacity-65 shadow-xl rounded-b-lg bg-slate-100 text-slate-500 dark:bg-stone-800`}>
      <div className='flex flex-row gap-4'>
        <button className="block p-2 text-main hover:bg-slate-200 transition-all" onClick={handleClick} data-umami-event="playMotion">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
          </svg>

        </button>
        <Listbox value={chartMode}>
          <Listbox.Button className="relative block p-2 text-sub hover:bg-slate-200 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          </Listbox.Button>
          <Listbox.Options className="absolute translate-x-12 translate-y-10 bg-slate-50 py-4 border rounded-md">
            {chartModeList.map((chartMode) => (
              <Listbox.Option data-umami-event="newFrame"
                key={chartMode.id} className="font-sm px-4 p-1 z-20 hover:bg-slate-200 hover:text-main transition-all"
                value={chartMode.id}
                onClick={() =>
                  newTemplateFrame(chartMode.id)}
              >
                {chartMode.id}. {chartMode.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
        <button className="block p-2 text-sub hover:bg-slate-200 transition-all" onClick={exportFile} data-umami-event="exportFile">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>

        </button>
      </div>
    </section>
  )
}

export default AppHeader