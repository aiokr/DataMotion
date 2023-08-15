"use client"

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function EChartsComponent({ width, height, option }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);
    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, [option]);

  useEffect(() => {
    const chartInstance = echarts.getInstanceByDom(chartRef.current);
    chartInstance.resize({ width, height });
  }, [width, height]);

  return (<div ref={chartRef} style={{ width: '100%', height: '100%' }} />)
    ;
}