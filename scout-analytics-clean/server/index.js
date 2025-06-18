import express from 'express';
import cors from 'cors';
const app = express();

// Enable CORS for local development
app.use(cors({
  origin: 'http://localhost:4173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Sample API routes for Scout Analytics
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    totalRevenue: 1250000,
    totalTransactions: 15420,
    averageBasketSize: 185.50,
    customerCount: 8945
  });
});

app.get('/api/dashboard/charts', (req, res) => {
  res.json({
    salesTrend: [
      { date: '2024-01', sales: 850000 },
      { date: '2024-02', sales: 920000 },
      { date: '2024-03', sales: 1100000 },
      { date: '2024-04', sales: 1250000 }
    ],
    topProducts: [
      { name: 'Product A', sales: 350000 },
      { name: 'Product B', sales: 280000 },
      { name: 'Product C', sales: 220000 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Scout Analytics API server running on port ${PORT}`);
});