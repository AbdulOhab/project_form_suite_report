cd server-side

# Step 1: Seed all data
node server-side/model/seeders/masterSeeder.js

# Step 2: Verify data
node server-side/model/seeders/seederChecker.js

# Step 3: Wipe All data
node server-side/model/seeders/wipeAllSeeder.js

# Single Admin Seed
node server-side/model/seeders/adminSeeder.js



node server-side/model/seeders/wipeAllSeeder.js
node server-side/model/seeders/zonalSeeder.js    
node server-side/model/seeders/branchSeeder.js
node server-side/model/seeders/adminSeeder.js    
node server-side/model/seeders/masterSeeder.js


cd server-side

node seeder.js seed     # Seed ALL users (3 admin + 5 zonal + 15 branch + 45 thana)
node seeder.js admin    # Seed admins only
node seeder.js zonal    # Seed zonals only
node seeder.js branch   # Seed branches only
node seeder.js check    # Verify seeded data integrity
node seeder.js wipe     # Delete ALL data from database


cd server-side && node seeder.js seed

node server-side/model/seeders/noticeSeeder.js

