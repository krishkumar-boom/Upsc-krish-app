import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

export function LineChart({ labels, datasets, height = 300 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 20, font: { size: 12, family: 'Inter' } }
      }
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } }
    }
  }

  return (
    <div style={{ height }}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  )
}

export function BarChart({ labels, datasets, height = 300 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } }
    }
  }

  return (
    <div style={{ height }}>
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  )
}

export function DoughnutChart({ labels, data, colors, height = 300 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 12, font: { size: 11, family: 'Inter' } }
      }
    }
  }

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map(c => c + '40'),
      borderColor: colors,
      borderWidth: 2,
    }]
  }

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
export default ChartWrapper;
