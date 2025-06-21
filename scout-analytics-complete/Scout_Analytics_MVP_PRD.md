## 1. Executive Summary

(unchanged)

---

## 2. Business Objectives

(unchanged)

---

## 3. Success Metrics

(unchanged)

---

## 4. Architecture Overview

(unchanged — adds RetailBot micro-service under backend.ai)

```yaml
architecture:
  frontend:
    pages: [overview, transaction_trends, product_mix, consumer_insights, retailbot_insights]
  backend:
    ai:
      retailbot_service: “/api/retailbot”
      openai: [gpt-4, gpt-35-turbo, embeddings]
```

---

## 5. Data Architecture & Backend Requirements

(unchanged, except add RetailBot logs table)

### 5.1 Core Tables

...

| Table | Columns |
| :--- | :--- |
| `adbot_logs` | `id` (UUID), `timestamp`, `input_filters` (JSONB), `prompt` (TEXT), `response` (JSONB), `user_id` |

---

## 6. API Layer

Added endpoint:

**POST /api/retailbot:**
  *   **description:** Run the “RetailBot / AdBot” assistant over current filters to generate targeted recommendations, diagnostics, and action items.
  *   **body:**
      *   `filters`: `FilterState`  # same shape as global filters
      *   `query`: `string?`        # optional user question override
  *   **returns:**
    ```json
    {
      "actions": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "confidence": "number",
          "category": "pricing"|"promotion"|"inventory"|"ops"
        }, …
      ],
      "diagnostics": {
        "data_quality": "good"|"warn"|"bad",
        "latency_ms": "number"
      }
    }
    ```

---

## 7. Feature Requirements

### 7.1 Global Filter System

(unchanged)

### 7.2 Page & Visual Matrix

| Page | Key Visuals | Toggles & Drill-downs |
| :--- | :--- | :--- |
| L0: Overview | 4 KPI cards, sparkline, top 5 products bar | KPI card → trends |
| L1: Transaction Trends | line, box, heatmap | hour → hour filter + same page |
| L1: Product Mix | pie, stacked bar, Sankey | slice/flow → category/brand |
| L1: Consumer Insights | donut, funnel, geo-heatmap | segment/map → gender/barangay |
| L1: RetailBot & AdBot | – Chat interface with model selector<br>– Action-card panel<br>– Performance diagnostics | • “Ask RetailBot” → POST /api/retailbot<br>• Click action → add corresponding filter (e.g. “price”) and auto-narrow charts<br>• Toggle between “Pricing”, “Promotions”, “Inventory”, “Operations” categories |
| L2: Drawer Details | full-size chart + data table | open via double-click |
| L3: Modal Data | raw transaction table + export buttons | open via double-click or drill-down link |

### 7.3 RetailBot & AdBot Page (NEW, P1)

**User Story**

> As a retail manager, I want to interact with a dedicated AI assistant—RetailBot—so I can ask domain-specific questions and get prioritized, confidence-scored action items and diagnostics.

**Acceptance Criteria**

[ ] Dedicated `/retailbot` route under Dash/React Router

[ ] Chat input + model selector (GPT-4 vs GPT-3.5)

[ ] On send: POST /api/retailbot with current global filters + query

[ ] Display list of Action Cards: title, description, confidence bar, “Apply” button

[ ] Display Diagnostics: data quality, query latency

[ ] Panel persists filters context and logs to `adbot_logs` table

[ ] “Refresh” button to re-invoke with latest data

**Interactions & Drill-downs**

Apply on an action card → sets any embedded filter keys (e.g. price_band=“high”) and navigates back to Overview or relevant L1 page

Diagnostics link → expands JSON view in L3 modal

---

## 8. Security & Compliance

(unchanged)

---

## 9. Monitoring & Alerting

(unchanged, plus monitor /api/retailbot)

---

## 10. Quality Assurance

(update E2E to cover RetailBot flows)

Playwright: test chat ↔ action card ↔ drill-down

---

## 11. Implementation Timeline

| Phase | Deliverables | ETA |
| :--- | :--- | :--- |
| Phase 1 | … | Jun 17 AM |
| Phase 2 | … | Jun 18 PM |
| Phase 3 | Drill-downs & AI panel | Jun 19 AM |
| Phase 4 | RetailBot page + `/api/retailbot` | Jun 20 AM |
| Phase 5 & 6 | … | Jun 22–23 |

---

## 12. End-State YAML

```yaml
version: "1.2"
pages:
  - overview
  - transaction_trends
  - product_mix
  - consumer_insights
  - retailbot_insights
api:
  endpoints:
    - GET /api/...
    - POST /api/retailbot
backend:
  tables:
    - transactions
    - adbot_logs
features:
  retailbot_insights:
    route: /retailbot
    components:
      - chat_input
      - model_selector
      - action_cards
      - diagnostics_panel
    callbacks:
      send_query: POST /api/retailbot
      apply_action: setFilter + navigate
```

