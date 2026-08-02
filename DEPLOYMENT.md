# Production Deployment Note

এই অ্যাপটা **একটাই Docker image**-এ চলে — React SPA আর Express API একই container-এ,
একই origin-এ। সাথে MongoDB আরেকটা container। পুরো stack এক কমান্ডে ওঠে।

> এই মেশিনে `docker` নেই, `podman` ইনস্টল করা (`docker-compose` → `podman-compose`
> alias)। কমান্ড docker-compatible; নিচে `docker compose` লেখা থাকলে podman-এ
> `podman-compose` দিয়ে চালান।

---

## কীভাবে কাজ করে (আর্কিটেকচার)

```
                    ┌─────────────────────────────────────┐
   ব্রাউজার  ──────▶│  app container  (port 5053)          │
   :5053            │  ├─ Express — API রুট (/submit, ...)  │
                    │  └─ একই Express — React build serve   │
                    │        (GET / → SPA index.html)       │
                    └───────────────┬─────────────────────┘
                                    │ mongodb://mongodb:27017
                    ┌───────────────▼─────────────────────┐
                    │  mongodb container (internal only)    │
                    │  data → named volume (mongo_data)     │
                    └─────────────────────────────────────┘
```

- **এক origin:** SPA আর API একই পোর্টে (5053)। frontend relative URL-এ
  (`/check-user`) API কল করে — build-এ `REACT_APP_API_BASE_URL=""` সেট করা,
  তাই আলাদা backend ডোমেইন লাগে না, CORS ঝামেলা কম।
- **কোড image-এর ভেতরে:** সব কোড build-time-এ `COPY` হয়, bind-mount নেই।
  কোড বদলালে rebuild করতে হয় (`--build`)।
- **MongoDB internal:** host-এ 27017 পোর্ট খোলা নেই — Mongo শুধু container
  network-এ। তাই DB-তে যেকোনো কাজ (seeder ইত্যাদি) container-এর ভেতর থেকে চালাতে হয়।
- **ডেটা টেকে:** Mongo data (`mongo_data`) আর আপলোড করা ফাইল (`app_uploads`)
  named volume-এ থাকে, restart/rebuild-এ হারায় না।

---

## ধাপে ধাপে সার্ভারে তোলা

### ১. সার্ভারে Docker ইনস্টল
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER      # একবার logout/login
```

### ২. কোড সার্ভারে নিন
```bash
git clone <your-repo-url> report-app
cd report-app
```

### ৩. Production secret সেট করুন (সবচেয়ে জরুরি ধাপ)
`docker-compose.yml`-এ `JWT_SECRET`-এর ডিফল্ট `change-me-in-production` —
এটা **অবশ্যই** বদলাতে হবে, নাহলে যে কেউ লগইন টোকেন জাল করতে পারবে।
প্রজেক্ট রুটে একটা `.env` বানান (এটা gitignored, repo-তে যাবে না):

```bash
echo "JWT_SECRET=$(openssl rand -hex 64)" >> .env
echo "CORS_ORIGIN=https://yourdomain.com" >> .env
```

compose ফাইল `${JWT_SECRET}` আর `${CORS_ORIGIN}` স্বয়ংক্রিয়ভাবে `.env` থেকে নেবে।

### ৪. Build ও চালু করুন
```bash
docker compose up -d --build
docker compose ps                 # সব container healthy কিনা দেখুন
```

### ৫. প্রথমবার ডেটা seed করুন (container-এর ভেতরে)
> Mongo host থেকে reachable নয়, তাই seeder **container-এর ভেতরে** চালাতে হয়।
> container-এ WORKDIR `/app`, তাই path `model/seeders/...` (host-এর
> `server-side/...` নয়)।

```bash
docker compose exec app node model/seeders/masterSeeder.js    # users
docker compose exec app node model/seeders/noticeSeeder.js    # sample notices
docker compose exec app node seeder.js check                  # যাচাই
```
⚠️ seeder-গুলো আগে পুরনো ডেটা মুছে (`deleteMany`) নতুন বসায় — production-এ সাবধানে।

এখন অ্যাপ `http://<server-ip>:5053`-এ চলছে।

---

## ডোমেইন + HTTPS (production-এ আবশ্যক)

সরাসরি পোর্ট 5053 এক্সপোজ না করে সামনে একটা reverse proxy দিন, যাতে ডোমেইন +
HTTPS পাওয়া যায়। সবচেয়ে সহজ **Caddy** (অটো Let's Encrypt সার্টিফিকেট):

`/etc/caddy/Caddyfile`:
```
yourdomain.com {
    reverse_proxy localhost:5053
}
```

তারপর firewall-এ শুধু 80/443 খুলুন, 5053 বাইরে বন্ধ রাখুন:
```bash
sudo ufw allow 80,443/tcp
```

> HTTPS ডোমেইন ব্যবহার করলে `.env`-এ `CORS_ORIGIN=https://yourdomain.com`
> থাকতেই হবে — না হলে ব্রাউজার API কল ব্লক করবে।

---

## দৈনন্দিন কাজ (cheat-sheet)

| কাজ | কমান্ড |
|---|---|
| চালু করা | `docker compose up -d` |
| বন্ধ করা | `docker compose down` (ডেটা volume-এ থাকে) |
| কোড আপডেট + রিলিজ | `git pull && docker compose up -d --build` |
| লগ দেখা | `docker compose logs -f app` |
| container-এ ঢোকা | `docker compose exec app sh` |
| seeder চালানো | `docker compose exec app node model/seeders/<file>.js` |
| স্ট্যাটাস | `docker compose ps` |

---

## নিরাপত্তা চেকলিস্ট (হোস্ট করার আগে)

- [ ] `.env`-এ শক্ত `JWT_SECRET` (ডিফল্ট নয়)
- [ ] `CORS_ORIGIN` = আসল ডোমেইন
- [ ] সামনে HTTPS reverse proxy (Caddy/nginx), সরাসরি :5053 নয়
- [ ] firewall-এ শুধু 80/443 খোলা
- [ ] `SEED_CREDENTIALS.txt` / `.env` git-এ commit হয়নি (gitignored)
- [ ] প্রথম seed-এর পর ডিফল্ট পাসওয়ার্ড বদলানো

> বড় পরিসরে যাওয়ার আগে দেখুন `PRODUCTION_PLAN.md` — সেখানে auth middleware,
> rate-limiting, helmet ইত্যাদি নিয়ে বিস্তারিত আছে।
