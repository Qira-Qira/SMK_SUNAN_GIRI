'use client';

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatisticChartProps {
  title: string;
  data: Array<{ year: number; count: number }>;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  chartType?: 'line' | 'bar';
}

export default function StatisticChart({
  title,
  data,
  color = 'rgb(75, 192, 192)',
  backgroundColor = 'rgba(75, 192, 192, 0.1)',
  borderColor = 'rgb(75, 192, 192)',
  chartType = 'line',
}: StatisticChartProps) {
  const chartData = {
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: title,
        data: data.map((d) => d.count),
        borderColor,
        backgroundColor,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : undefined,
        borderWidth: 2,
        pointRadius: 6,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 11 },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow border border-emerald-100">
      <h3 className="text-lg font-bold text-emerald-900 mb-4">{title}</h3>
      <div className="relative h-80">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
