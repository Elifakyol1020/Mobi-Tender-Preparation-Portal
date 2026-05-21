Mobivisor Tender Preparation Portal

Bu proje, teknik dokümanların merkezi bir sistem üzerinden yönetilmesini sağlar. ReactJS, Spring Boot, MySQL, Elasticsearch ve Docker Compose teknolojileri ile geliştirilmiştir.

-Proje Bileşenleri

- **Frontend**: React (Vite)
- **Backend**: Spring Boot (Java 17+)
- **Veritabanı**: MySQL
- **Arama Motoru**: Elasticsearch
- **PhpMyAdmin**: MySQL yönetimi için
- **Docker**: Tüm bileşenleri konteyner ortamında ayağa kaldırmak için

-Google Cloud VM'de Yayınlama

1. VM üzerinde Docker ve Docker Compose kurulu olmalı.
2. Google Cloud firewall tarafında dışarı açılacak portları izinli hale getirin:
   - Frontend: `80` veya `.env` içinde verdiğiniz `FRONTEND_PORT`
   - Backend API: `8081` veya `.env` içinde verdiğiniz `BACKEND_PORT`
3. Elasticsearch için VM'de şu ayar gerekebilir:
   ```bash
   sudo sysctl -w vm.max_map_count=262144
   ```
4. Kök dizinde `.env.example` dosyasını `.env` olarak kopyalayın ve `YOUR_VM_EXTERNAL_IP` alanlarını VM dış IP'niz veya domaininizle değiştirin.
5. Servisleri başlatın:
   ```bash
   docker compose up --build -d
   ```

Önemli ortam değişkenleri:

- `APP_FRONTEND_URL`: Backend'in OAuth sonrası yönlendireceği frontend adresi.
- `VITE_API_URL`: React uygulamasının tarayıcıdan ulaşacağı backend API adresi. Bu değer image build sırasında gömülür; değiştirince frontend image'ını yeniden build edin.
- `CORS_ALLOWED_ORIGINS`: Backend'in izin verdiği frontend origin listesi. Birden fazla origin için virgül kullanabilirsiniz.
- `JWT_SECRET_KEY`: Production'da mutlaka güçlü, Base64 formatında ayrı bir değer verin.
- `JWT_ACCESS_TOKEN_EXPIRATION`: Access token süresi. Varsayılan `900000` ms, yani 15 dakika.
- `JWT_REFRESH_TOKEN_EXPIRATION`: Refresh token süresi. Varsayılan `604800000` ms, yani 7 gün.
- `REFRESH_COOKIE_SECURE`: HTTPS kullanırken `true`, düz HTTP/IP testlerinde `false` olmalı.
- `REFRESH_COOKIE_SAME_SITE`: Aynı domain/IP ve farklı port için genelde `Lax`; farklı domain/subdomain kurgusunda `None` + secure gerekir.
- `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD`: İlk admin hesabını oluşturmak veya şifresini güncellemek için kullanılır.

-Başlarken

1. Depoyu Klonla
git clone [https://github.com/kullanici-adin/proje-adi.git](https://github.com/Elifakyol1020/MobiVisor-Tender-Preparation-Portal.git)

2. Ortam Değişkenlerini Ayarla
Lokal geliştirme için frontend `.env` içinde:
env
VITE_API_URL=http://localhost:8081

3. Docker Compose ile Başlat
Tüm sistemi ayağa kaldırmak için:
bash
docker compose up --build

Aşağıdaki servisler çalışır hale gelir:

Frontend → http://localhost:5173

Backend → http://localhost:8081

PhpMyAdmin → http://localhost:5050

Elasticsearch → http://localhost:9200


-Kullanım Senaryoları
1. Admin, Excel dosyası üzerinden şartname yükleyebilir.
2. Admin, sisteme kullanıcı ekleyebilir.
3. Kullanıcılar, yeni bir şartname oluşturabilir ve sonrasında indirebilir.
4. Kullanıcılar, anahtar kelimelere göre arama yaparak uygunluk durumunu görebilir.
5. Aramalar Elasticsearch üzerinden hızlı şekilde yapılır.
6. PhpMyAdmin ile veritabanı yönetimi mümkündür.

-Kimlik Doğrulama
1. Email/şifre ile register ve login akışı kullanılmaktadır.
2. Login ve register cevapları JWT access token döner.
3. Admin kullanıcı sisteme giriş yaparak yeni kullanıcılar oluşturabilir.

-Docker Komutları
Tüm servisleri başlat:
bash
docker-compose up --build
Servisleri durdur:
bash
docker compose down

-Katkıda Bulunmak
Katkıda bulunmak isterseniz, lütfen projeyi forklayıp değişikliklerinizi bir Pull Request olarak gönderin.

-İletişim
Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin:
📩 eakyol1020@gmail.com
