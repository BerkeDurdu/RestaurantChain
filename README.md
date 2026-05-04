# ChainOps / RestaurantChain

Restoran zinciri operasyonlarını izlemek için hazırlanmış, Express + SQLite tabanlı bir demo uygulaması.
Uygulama; şube durumları, stok takibi, uyarılar, saatlik sipariş grafikleri ve tarih aralıklı raporlar sunar.

## Gereksinimler

- Node.js 18 veya daha yeni bir sürüm
- npm

Ek bir veritabanı kurulumu gerekmez. Uygulama yerel SQLite veritabanını ilk açılışta oluşturur.

## Kurulum

1. Proje klasörüne geçin:

```bash
cd RestaurantChain
```

2. Bağımlılıkları kurun:

```bash
npm install
```

3. Uygulamayı başlatın:

```bash
npm start
```

Geliştirme sırasında otomatik yeniden başlatma için:

```bash
npm run dev
```

## Uygulamayı Açma

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır.

- Ana ekran: `http://localhost:3000/`
- Giriş ekranı: `http://localhost:3000/login.html`

Giriş yapmamış kullanıcılar ana sayfaya gitmeye çalıştığında otomatik olarak giriş ekranına yönlendirilir.

## İlk Kullanım

1. `login.html` sayfasını açın.
2. `Kayıt Ol` sekmesinden yeni bir yönetici hesabı oluşturun.
3. Kayıttan sonra sistem otomatik olarak giriş yapar ve ana panele yönlendirir.

İlk çalıştırmada uygulama ayrıca bir bootstrap yönetici hesabı oluşturabilir. Bu durumda kullanıcı adı ve şifre terminal çıktısında gösterilir.

## Özellikler

- Şube bazlı operasyon izleme
- Canlı POS ve mutfak gecikme metrikleri
- Stok ve kritik stok listesi
- Uyarı akışı
- Günlük, haftalık, aylık ve yıllık raporlar
- Şube ekleme ve stok ürünü ekleme

## Önemli Notlar

- `server/simulator.js` arka planda her 3 saniyede bir sipariş, stok, POS ve uyarı verilerini günceller. Bu yüzden ekran değerleri test sırasında sürekli değişebilir.
- Veritabanı dosyası `server/chainops.db` altında oluşur ve repoya eklenmemelidir.
- İsteğe bağlı ortam değişkenleri:
  - `PORT`: Sunucunun çalışacağı port
  - `JWT_SECRET`: Oturum doğrulama anahtarı

## Proje Yapısı

```text
app.js
index.html
login.css
login.html
login.js
styles.css
server/
  auth.js
  db.js
  reports.js
  server.js
  simulator.js
```

## Sorun Giderme

- `npm start` çalışmıyorsa önce `npm install` komutunu tekrar çalıştırın.
- Login sonrası ana sayfa açılmıyorsa tarayıcı çerezlerini temizleyin ve tekrar deneyin.
- Veriler beklenmedik şekilde değişiyorsa bunun nedeni canlı simülatördür; bu davranış normaldir.
