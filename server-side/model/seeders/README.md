cd server-side

# Step 1: Seed all data
node server-side/model/seeders/masterSeeder.js

# Step 2: Verify data
node server-side/model/seeders/seederChecker.js

# Step 3: Wipe All data
node server-side/model/seeders/wipeAllSeeder.js

# Single Admin Seed
node server-side/model/seeders/adminSeeder.js


cd server-side
node server-side/model/seeders/zonalSeeder.js    
node server-side/model/seeders/branchSeeder.js
node server-side/model/seeders/adminSeeder.js    
node server-side/model/seeders/masterSeeder.js  
