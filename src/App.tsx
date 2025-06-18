import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TagEditor } from './components/TagEditor';
import { RagChat } from './components/RagChat';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface SensorStatus {
  name: string;
  status: 'OK' | 'FAIL';
  lastRun: string;
  metrics?: {
    accuracy: number;
    latency: number;
    throughput: number;
  };
}

interface MetricHistory {
  timestamp: string;
  accuracy: number;
  latency: number;
  throughput: number;
}

function App() {
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [metricHistory, setMetricHistory] = useState<MetricHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, metricsRes] = await Promise.all([
          fetch('/api/sensors'),
          fetch('/api/metrics/history')
        ]);
        
        const sensorsData = await sensorsRes.json();
        const metricsData = await metricsRes.json();
        
        setSensors(sensorsData);
        setMetricHistory(metricsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  Campaign Insights
                </Link>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/tagging"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Metadata Tagging
                </Link>
                <Link
                  to="/insights"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Campaign Insights
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/tagging" element={<TagEditor />} />
            <Route path="/insights" element={<RagChat />} />
            <Route
              path="/"
              element={
                <div className="text-center py-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to Campaign Insights
                  </h1>
                  <p className="text-xl text-gray-600">
                    Select a tool from the navigation above to get started.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Sensor Status Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {sensors.map((sensor) => (
              <div
                key={sensor.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    {sensor.status === 'OK' ? (
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-8 w-8 text-red-500" />
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{sensor.name}</h3>
                      <p className="text-sm text-gray-500">Last run: {new Date(sensor.lastRun).toLocaleString()}</p>
                    </div>
                  </div>
                  {sensor.metrics && (
                    <dl className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Accuracy</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {(sensor.metrics.accuracy * 100).toFixed(1)}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Latency</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {sensor.metrics.latency.toFixed(2)}ms
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Throughput</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          {sensor.metrics.throughput}/s
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Metrics Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h2>
            <div className="h-96">
              <LineChart
                width={800}
                height={400}
                data={metricHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#0ea5e9"
                  name="Accuracy"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="latency"
                  stroke="#10b981"
                  name="Latency (ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="throughput"
                  stroke="#f59e0b"
                  name="Throughput"
                />
              </LineChart>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App; 