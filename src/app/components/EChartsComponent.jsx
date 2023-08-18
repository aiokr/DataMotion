"use client"

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function EChartsComponent({ width, height, option, onChartReady }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current, null, { renderer: 'canvas' });;
    chartInstance.setOption(option);

    // 调用 onChartReady 函数，并将图表实例作为参数传递
    if (onChartReady) onChartReady(chartInstance);

    return () => {
      chartInstance.dispose();
    };
  }, [option]);

  useEffect(() => {
    const chartInstance = echarts.getInstanceByDom(chartRef.current);
    chartInstance.resize({ width, height });
  }, [width, height]);

  return (<div ref={chartRef} style={{ width: '100%', height: '100%' }} />);
}