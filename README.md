# ebebek-carousel-case
Ebebek Ürün Karoseli (Product Carousel) Vaka Çalışması
Geliştirici: Halenur Özcan Dosya Adı: Halenur_Ozcan.js

Bu proje, ebebek.com ana sayfasında var olan tasarıma tamamen uyumlu, tamamen saf JavaScript (Vanilla JS) kullanılarak geliştirilmiş özel bir ürün karoselinin entegrasyonu için hazırlanmıştır. Çözüm, tek bir JavaScript dosyası içerir ve Chrome Geliştirici Araçları Konsolu üzerinden çalıştırılacak şekilde tasarlanmıştır.
Projenin temel amacı, mevcut web sitesi tasarımına piksel uyumlu bir karosel oluşturmak ve onu dinamik DOM yapısında istenen kritik konuma yerleştirmektir:

Konum: Ana sayfa Hero Banner'ın hemen altında ve mevcut "Sizin İçin Seçtiklerimiz" bloğunun hemen üzerinde.
Başlık: "Beğenebileceğinizi düşündüklerimiz"

Teknoloji: Sadece Saf JavaScript (Vanilla JS) kullanılmıştır. 3. parti kütüphane kullanımından kaçınılmıştır.

Veri Yönetimi (Local Storage):
Ürün listesi ilk çalıştırmada API'den çekilir; sonraki çalıştırmalarda Local Storage'dan alınır.
Kullanıcının favori ürünleri Local Storage'da saklanır ve sayfa yenilense bile korunur.

İşlevsellik:
Fiyat ve İndirim yüzdesi (%X İndirim) hesaplanarak gösterilmiştir.
Favori ikonuna (♥) tıklandığında renk değişir ve favori durumu saklanır.
Ürün kartına tıklandığında ilgili ürün sayfası yeni sekmede açılır.

Entegrasyon:
Kod, kesinlikle sadece ebebek.com ana sayfasında çalışacak şekilde kontrol edilmiştir.
HTML ve CSS yapıları, Vanilla JavaScript kullanılarak oluşturulmuş ve DOM'a enjekte edilmiştir.
Tasarım, mobil cihazlara uyumlu (responsive) olarak geliştirilmiştir.

Kodu Nasıl Çalıştırılır (Test Adımları)
Kodun test edilmesi için aşağıdaki adımları takip edin:
Tarayıcınızda ebebek.com ana sayfasına gidin.
Geliştirici Araçlarını (F12 veya Cmd+Option+J) açın ve Console (Konsol) sekmesine geçin.
Halenur_Ozcan.js dosyasının tüm içeriğini kopyalayın.
Kopyaladığınız kodu Konsol'a yapıştırın ve Enter tuşuna basın.
Karosel, sayfanın ana banner'ı ile "Sizin İçin Seçtiklerimiz" başlığı arasında belirecektir.

**
Karosel, yerleşim sorunlarını kesin olarak çözmek için ebebek ana sayfasındaki "Sizin için Seçtiklerimiz" başlığının metnine dayanarak, elementin tam olarak önüne eklenmiştir. Bu, sitenin dinamik yapısına karşı geliştirilmiş sağlam bir yerleştirme çözümüdür.
