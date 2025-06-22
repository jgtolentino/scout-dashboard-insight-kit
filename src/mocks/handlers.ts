import { http, HttpResponse } from 'msw';

// Generate realistic mock data for Scout Analytics API
const generateTransactions = (count = 100) => {
  const transactions = [];
  const products = [
    'Coca-Cola 500ml', 'Pepsi 500ml', 'Sprite 500ml', '7-Up 500ml',
    'Lays Classic 75g', 'Pringles Original 165g', 'Oreo Cookies 137g',
    'Head & Shoulders 400ml', 'Pantene 400ml', 'Dove Soap 100g',
    'Tide Powder 1kg', 'Ariel Powder 1kg', 'Surf Powder 1kg',
    'Lucky Me Pancit Canton', 'Maggi Noodles', 'Del Monte Corned Beef'
  ];
  
  const regions = ['NCR', 'Region VII', 'Region XI', 'Region VI', 'CAR'];
  const customers = Array.from({ length: 50 }, (_, i) => `customer_${i + 1}`);
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
    
    transactions.push({
      id: `txn_${i + 1}`,
      customer_id: customers[Math.floor(Math.random() * customers.length)],
      product_name: products[Math.floor(Math.random() * products.length)],
      total_amount: Math.floor(Math.random() * 500) + 50, // 50-550 PHP
      quantity: Math.floor(Math.random() * 5) + 1,
      date: date.toISOString(),
      timestamp: date.toISOString(),
      region: regions[Math.floor(Math.random() * regions.length)],
      store_location: regions[Math.floor(Math.random() * regions.length)],
      category: getProductCategory(products[Math.floor(Math.random() * products.length)])
    });
  }
  
  return transactions;
};

const getProductCategory = (productName: string): string => {
  const name = productName.toLowerCase();
  if (name.includes('cola') || name.includes('pepsi') || name.includes('sprite') || name.includes('7-up')) {
    return 'beverages';
  }
  if (name.includes('lays') || name.includes('pringles') || name.includes('oreo')) {
    return 'snacks';
  }
  if (name.includes('head') || name.includes('pantene') || name.includes('dove')) {
    return 'personal_care';
  }
  if (name.includes('tide') || name.includes('ariel') || name.includes('surf')) {
    return 'household';
  }
  if (name.includes('lucky') || name.includes('maggi') || name.includes('del monte')) {
    return 'food_staples';
  }
  return 'other';
};

const generateRegionalData = () => {
  return [
    { region: 'NCR', name: 'NCR', revenue: 2500000, transactions: 1200, amount: 2500000 },
    { region: 'Region VII', name: 'Region VII', revenue: 1800000, transactions: 900, amount: 1800000 },
    { region: 'Region XI', name: 'Region XI', revenue: 1500000, transactions: 750, amount: 1500000 },
    { region: 'Region VI', name: 'Region VI', revenue: 1200000, transactions: 600, amount: 1200000 },
    { region: 'CAR', name: 'CAR', revenue: 800000, transactions: 400, amount: 800000 }
  ];
};

const generateCategoryData = () => {
  return [
    { category: 'beverages', revenue: 1500000, transactions: 800, share: 25.5 },
    { category: 'snacks', revenue: 1200000, transactions: 600, share: 20.3 },
    { category: 'personal_care', revenue: 1000000, transactions: 500, share: 17.1 },
    { category: 'household', revenue: 900000, transactions: 450, share: 15.2 },
    { category: 'food_staples', revenue: 800000, transactions: 400, share: 13.6 },
    { category: 'other', revenue: 500000, transactions: 250, share: 8.3 }
  ];
};

export const handlers = [
  // Authentication endpoint
  http.post(`${process.env.VITE_API_BASE_URL || 'http://localhost:3002'}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      token: 'dev-mock-token-12345',
      user: { id: 1, email: 'demo@scout.com', name: 'Demo User' }
    });
  }),

  // Main Scout Analytics endpoint
  http.get(`${process.env.VITE_API_BASE_URL || 'http://localhost:3002'}/scout/analytics`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    const transactions = generateTransactions(limit);
    const regions = generateRegionalData();
    const categories = generateCategoryData();
    
    // Calculate summary metrics
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalTransactions = transactions.length;
    const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;
    const avgOrderValue = totalRevenue / totalTransactions;
    
    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions,
          uniqueCustomers,
          avgOrderValue,
          growth: {
            revenue: 12.3,
            transactions: 8.2,
            customers: 15.4,
            avgOrderValue: -2.1
          }
        },
        transactions: {
          data: transactions,
          pagination: {
            page: 1,
            limit,
            total: transactions.length,
            totalPages: 1
          }
        },
        regions,
        categories,
        trends: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 100000) + 50000,
            transactions: Math.floor(Math.random() * 100) + 50
          })),
          hourly: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            revenue: Math.floor(Math.random() * 50000) + 10000,
            transactions: Math.floor(Math.random() * 50) + 10
          }))
        }
      }
    });
  }),

  // Transactions endpoint
  http.get(`${process.env.VITE_API_BASE_URL || 'http://localhost:3002'}/api/transactions`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const transactions = generateTransactions(limit);
    
    return HttpResponse.json({
      data: transactions,
      pagination: {
        page: 1,
        limit,
        total: transactions.length,
        totalPages: 1
      }
    });
  }),

  // Volume data endpoint
  http.get(`${process.env.VITE_API_BASE_URL || 'http://localhost:3002'}/api/volume`, () => {
    return HttpResponse.json({
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        volume: Math.floor(Math.random() * 1000) + 500,
        units: Math.floor(Math.random() * 500) + 200
      }))
    });
  }),

  // Category mix endpoint
  http.get(`${process.env.VITE_API_BASE_URL || 'http://localhost:3002'}/api/category-mix`, () => {
    return HttpResponse.json({
      data: generateCategoryData()
    });
  }),

  // Regional performance endpoint
  http.get(`${process.env.VITE_API_BASE_URL || 'http://localhost:3002'}/api/regional-performance`, () => {
    return HttpResponse.json({
      data: generateRegionalData()
    });
  }),

  // Catch-all for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
];