// backend/scripts/seedFull.js
/**
 * Full seeder: request_methods, unbranded_commodities,
 * stores, customers, products, devices, sessions,
 * transactions+items, sales_interactions, sales_interaction_brands,
 * session_matches.
 */

require('dotenv').config();
const { Pool }   = require('pg');
const { faker }  = require('@faker-js/faker');
const { v4: uuid } = require('uuid');

const STORE_COUNT        = 90;
const CUSTOMER_MULTIPLIER= 5;
const CUSTOMER_COUNT     = STORE_COUNT * CUSTOMER_MULTIPLIER; // 450
const PRODUCT_COUNT      = 50;
const TRANSACTION_COUNT  = 15000;
const SESSIONS_PER_CUST  = 3;  // sessions/customer

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async function seedFull() {
  const client = await pool.connect();
  try {
    console.log(`▶️  Seeding full dataset:
   • Stores:        ${STORE_COUNT}
   • Customers:     ${CUSTOMER_COUNT}
   • Products:      ${PRODUCT_COUNT}
   • Transactions:  ${TRANSACTION_COUNT}
   • Sessions/Cust: ${SESSIONS_PER_CUST}\n`);

    await client.query('BEGIN');

    // 1) request_methods
    console.log('  • request_methods…');
    const methods = ['verbal','visual','pointing','touch'];
    for (const m of methods) {
      await client.query(
        `INSERT INTO request_methods(method_name,description)
         VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [m, `Customer requested via ${m}`]
      );
    }

    // 2) unbranded_commodities
    console.log('  • unbranded_commodities…');
    const commodities = [
      {name:'yelo',term:'ice'},
      {name:'asin',term:'salt'},
      {name:'paltik',term:'cheapgun'},
      {name:'kape',term:'coffee'}
    ];
    for (const c of commodities) {
      await client.query(
        `INSERT INTO unbranded_commodities(commodity_name,local_term)
         VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [c.name, c.term]
      );
    }

    // 3) stores
    console.log('  • stores…');
    const regions = [
      { name:'NCR', weight:5, cities:['Manila','QC','Makati','Taguig'] },
      { name:'Region I', weight:1, cities:['San Fernando','Alaminos'] },
      { name:'Region II', weight:1, cities:['Tuguegarao','Santiago'] },
      { name:'Region III', weight:1, cities:['San Fernando','Olongapo'] },
      { name:'Region IV-A', weight:2, cities:['Batangas','Lipa','Lucena'] },
      { name:'Region IV-B', weight:1, cities:['Puerto Princesa','Calapan'] },
      { name:'Region V', weight:1, cities:['Legazpi','Naga','Sorsogon'] },
      { name:'Region VI', weight:1, cities:['Iloilo','Bacolod','Roxas'] },
      { name:'Region VII', weight:2, cities:['Cebu','Tagbilaran','Dumaguete'] },
      { name:'Region VIII', weight:1, cities:['Tacloban','Catbalogan'] },
      { name:'Region IX', weight:1, cities:['Zamboanga','Dipolog'] },
      { name:'Region X', weight:1, cities:['Cagayan de Oro','Iligan'] },
      { name:'Region XI', weight:1, cities:['Davao','Tagum'] },
      { name:'Region XII', weight:1, cities:['Koronadal','General Santos'] },
      { name:'CAR', weight:1, cities:['Baguio','Tabuk'] },
      { name:'ARMM', weight:1, cities:['Cotabato','Marawi'] }
    ];
    const barangays     = ['San Isidro','Bagong Pag-asa','Poblacion','Sinagtala','Maligaya','Del Pilar'];
    const storePrefixes = ['Aleli','Golden','J&J','Reyes','Mabuhay','Super'];

    const storeIds = [];
    for (let i = 0; i < STORE_COUNT; i++) {
      // pick region weighted
      const totalW = regions.reduce((s,r)=>s+r.weight,0);
      let r = Math.random()*totalW, sel;
      for (const reg of regions) {
        if (r < reg.weight) { sel = reg; break; }
        r -= reg.weight;
      }
      const name     = `${faker.random.arrayElement(storePrefixes)} Sari-Sari`;
      const city     = faker.random.arrayElement(sel.cities);
      const barangay = faker.random.arrayElement(barangays);
      const lon      = parseFloat(faker.address.longitude());
      const lat      = parseFloat(faker.address.latitude());

      const { rows } = await client.query(
        `INSERT INTO stores(id,name,barangay,region,city,location)
         VALUES($1,$2,$3,$4,$5,ST_SetSRID(ST_MakePoint($6,$7),4326))
         RETURNING id`,
        [uuid(), name, barangay, sel.name, city, lon, lat]
      );
      storeIds.push(rows[0].id);
    }

    // 4) customers
    console.log('  • customers…');
    const segments    = ['Traditional','Modern','E-commerce'];
    const customerIds = [];
    for (let i = 0; i < CUSTOMER_COUNT; i++) {
      const id      = uuid();
      const segment = segments[i % segments.length];
      await client.query(
        `INSERT INTO customers(id,name,segment)
         VALUES($1,$2,$3)`,
        [id, faker.name.findName(), segment]
      );
      customerIds.push(id);
    }

    // 5) products
    console.log('  • products…');
    const clients    = ['NB','JTI','Alaska','Oishi','Peerless','Del Monte','Other'];
    const categories = ['Beverages','Snacks','Household','Personal Care'];
    const productIds = [];
    for (let i = 0; i < PRODUCT_COUNT; i++) {
      const id       = uuid();
      const category = faker.random.arrayElement(categories);
      const brand    = faker.random.arrayElement(clients);
      const name     = `${brand} ${faker.commerce.productName()}`;
      await client.query(
        `INSERT INTO products(id,name,category,brand_id)
         VALUES($1,$2,$3,$4)`,
        [id, name, category, brand]
      );
      productIds.push(id);
    }

    // 6) device_master (1 device/store)
    console.log('  • device_master…');
    const deviceMap = {}; // store_id → device_id
    for (const sid of storeIds) {
      const did = `dev-${uuid()}`;
      deviceMap[sid] = did;
      await client.query(
        `INSERT INTO device_master(device_id,store_id,mac_address,status)
         VALUES($1,$2,$3,'active')
         ON CONFLICT DO NOTHING`,
        [did, sid, faker.internet.mac()]
      );
    }

    // 7) sessions (per customer)
    console.log('  • sessions…');
    const sessionMap = {}; // customer_id → [session_ids]
    for (const cid of customerIds) {
      sessionMap[cid] = [];
      for (let j = 0; j < SESSIONS_PER_CUST; j++) {
        const sess = uuid();
        sessionMap[cid].push(sess);
        await client.query(
          `INSERT INTO sessions(id,customer_id,device_id)
           VALUES($1,$2,$3)`,
          [sess, cid, faker.random.arrayElement(Object.values(deviceMap))]
        );
      }
    }

    // 8) transactions + items + interactions + brands + matches
    console.log('  • transactions & downstream tables…');
    const interactionGenders = ['Male','Female'];
    const emotions   = ['happy','neutral','surprised','angry'];
    for (let i = 0; i < TRANSACTION_COUNT; i++) {
      // Transaction
      const txId       = uuid();
      const ts         = new Date(Date.now() - Math.random()*365*24*3600e3);
      const store_id   = faker.random.arrayElement(storeIds);
      const customer_id= faker.random.arrayElement(customerIds);
      const total      = parseFloat((Math.random()*450 + 50).toFixed(2));
      const session_id = faker.random.arrayElement(sessionMap[customer_id]);

      await client.query(
        `INSERT INTO transactions(id,created_at,store_id,customer_id,total_amount,session_id)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [txId, ts, store_id, customer_id, total, session_id]
      );

      // Items
      const itemCount = faker.datatype.number({min:1,max:5});
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const iid  = uuid();
        const pid  = faker.random.arrayElement(productIds);
        const qty  = faker.datatype.number({min:1,max:3});
        const prc  = parseFloat((total/itemCount).toFixed(2));
        items.push({id:iid, product_id:pid, quantity:qty, price:prc});

        await client.query(
          `INSERT INTO transaction_items(id,transaction_id,product_id,quantity,price)
           VALUES($1,$2,$3,$4,$5)`,
          [iid, txId, pid, qty, prc]
        );
      }

      // Sales Interaction
      const facial = uuid();
      const gender = faker.random.arrayElement(interactionGenders);
      const age    = faker.datatype.number({min:18,max:65});
      const emo    = faker.random.arrayElement(emotions);
      // transcript: join product names
      const transcript = items.map(it => faker.commerce.productName()).join(', ');

      await client.query(
        `INSERT INTO sales_interactions(
           interaction_id,store_id,device_id,facial_id,transaction_date,
           gender,age,emotional_state,transcription_text,session_id
         ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [txId, store_id, deviceMap[store_id], facial, ts,
         gender, age, emo, transcript, session_id]
      );

      // Brand Detections
      for (const it of items) {
        const brandName = faker.random.arrayElement(clients);
        const conf      = parseFloat((Math.random()*50 + 50).toFixed(2));
        await client.query(
          `INSERT INTO sales_interaction_brands(
             id,interaction_id,brand_id,brand_name,confidence,detection_timestamp
           ) VALUES($1,$2,$3,$4,$5,$6)`,
          [uuid(), txId, it.product_id, brandName, conf, new Date(ts.getTime() + faker.datatype.number({min:0,max:500}))]
        );

        // Session Match
        const matchConf = parseFloat((conf + faker.datatype.number({min:20,max:80}))/2 .toFixed(2));
        const offsetMs  = faker.datatype.number({min:-300, max:300});
        await client.query(
          `INSERT INTO session_matches(
             id,interaction_id,match_confidence,time_offset_ms,match_method
           ) VALUES($1,$2,$3,$4,'seeded')`,
          [uuid(), txId, matchConf, offsetMs]
        );
      }

      // Progress indicator
      if (i % 1000 === 0) {
        console.log(`    Progress: ${i + 1}/${TRANSACTION_COUNT} transactions`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Full seed complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
})();