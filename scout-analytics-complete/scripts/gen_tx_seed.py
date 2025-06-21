import csv, random, uuid, datetime, argparse
parser = argparse.ArgumentParser()
parser.add_argument('--rows', type=int, default=15000)
parser.add_argument('--out', default='transactions.csv')
args = parser.parse_args()
random.seed(42)
header = ["id","created_at","store_id","brand_id","category","amount"]
categories = ["Beverages","Snacks","Dairy","Bakery","Frozen"]
base_time = datetime.datetime(2025,5,1,8,0,0)
with open(args.out,'w',newline='') as f:
    w = csv.writer(f); w.writerow(header)
    for _ in range(args.rows):
        dt = base_time + datetime.timedelta(minutes=random.randint(0,60*24*60))
        w.writerow([uuid.uuid4().hex[:8],
                    dt.isoformat(),
                    random.randint(1,10),
                    random.randint(1,50),
                    random.choice(categories),
                    round(random.uniform(5.0,250.0),2)])
print(f'Generated {args.rows} rows to {args.out}')
