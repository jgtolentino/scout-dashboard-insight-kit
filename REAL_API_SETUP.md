# Real API Setup Guide

## ✅ **Mock Removal Complete**

All MSW mocks have been removed and the frontend is now configured to call the real Flask backend API.

### **🔧 What Was Changed**

1. **Removed MSW Components:**
   - ✅ Deleted `src/mocks/` directory
   - ✅ Cleaned up `src/main.tsx` (removed MSW initialization)
   - ✅ Updated `vite.config.ts` (removed MSW-specific config)

2. **API Configuration:**
   - ✅ Updated `src/config/api.ts` to use `VITE_API_URL`
   - ✅ Added Vite proxy: `/api` → `http://localhost:5000`
   - ✅ Created `.env.development` and `.env.production`

3. **Environment Variables:**
   ```bash
   # Development
   VITE_API_URL=http://localhost:5000
   
   # Production  
   VITE_API_URL=https://scout-analytics-api.azurewebsites.net
   ```

---

## 🚀 **How to Test End-to-End**

### **Step 1: Start the Backend**
```bash
cd backend
. venv/bin/activate
python app.py
```

You should see:
```
* Running on http://0.0.0.0:5000
```

### **Step 2: Test Backend Health**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-06-22T...",
  "service": "scout-analytics-api"
}
```

### **Step 3: Start the Frontend**
```bash
# In the main project directory
npm run dev
```

You should see:
```
Local:   http://localhost:8080/
Network: http://[::]:8080/
```

### **Step 4: Test API Connection**

Open browser dev tools and navigate to the Scout Dashboard. You should see:

✅ **Success indicators:**
- Network tab shows `200` responses from `/api/...` endpoints
- No `404 Not Found` errors for API calls
- Data loading in dashboard components

❌ **Failure indicators:**
- `ECONNREFUSED` errors (backend not running)
- `404` errors (endpoints not implemented)
- CORS errors (backend not properly configured)

---

## 📊 **API Endpoints Available**

The Flask backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/transactions` | GET | Transaction data with pagination |
| `/api/products` | GET | Product catalog |
| `/api/regions` | GET | Region hierarchy |
| `/api/analytics/summary` | GET | Analytics summary |
| `/api/analytics/brand-performance` | GET | Brand performance metrics |
| `/api/analytics/consumer-insights` | GET | Consumer insights |

---

## 🔄 **Development Workflow**

1. **Backend Development:**
   ```bash
   cd backend
   . venv/bin/activate
   python app.py  # Auto-reloads on changes
   ```

2. **Frontend Development:**
   ```bash
   npm run dev  # Auto-reloads on changes
   ```

3. **API Testing:**
   ```bash
   # Test specific endpoints
   curl http://localhost:5000/api/transactions
   curl http://localhost:5000/api/products
   curl http://localhost:5000/api/analytics/summary
   ```

---

## 🚀 **Production Deployment**

### **Docker Deployment:**
```bash
# Build and run both services
docker-compose up

# Or production mode
docker-compose --profile production up app
```

### **Manual Deployment:**
```bash
# Deploy to Azure Stack
./deploy-azure-stack.sh
```

---

## 🔧 **Troubleshooting**

### **Backend not responding:**
- Check if Python virtual environment is activated
- Verify port 5000 is not in use: `lsof -i :5000`
- Check backend logs for errors

### **CORS issues:**
- Ensure Flask-CORS is installed and configured
- Check browser console for CORS error messages

### **404 errors:**
- Verify backend endpoints match frontend API calls
- Check Vite proxy configuration in `vite.config.ts`

### **Environment variables:**
- Confirm `.env.development` is loaded
- Check `import.meta.env.VITE_API_URL` in browser console

---

## ✅ **Success Criteria**

When everything is working correctly:

1. ✅ Backend health check returns `200 OK`
2. ✅ Frontend loads without console errors
3. ✅ Dashboard displays real data from backend
4. ✅ Network tab shows successful API calls
5. ✅ No mock data or `404` errors

**🎉 You now have a real full-stack Scout Analytics application!**