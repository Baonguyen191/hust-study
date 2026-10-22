var e={version:1,subject:`CNWeb`,lesson:`lec-12-web-security`,title:`Bài 12 – Web Security`,summary:`## 1. Web security là gì? [tr. 3](#p3)–[tr. 5](#p5)
- Định nghĩa của Mozilla: **bảo vệ website khỏi truy cập, sử dụng, sửa đổi, phá huỷ hoặc gián đoạn trái phép**.
- Bảo mật hiệu quả cần thiết kế trên **toàn bộ** website:
  - Ứng dụng web.
  - Cấu hình web server.
  - Chính sách tạo và đổi mật khẩu.
  - Code phía client.
- Một số số liệu:
  - Cứ **39 giây** có một cuộc tấn công.
  - 43% tấn công nhắm vào doanh nghiệp nhỏ.
  - **95% vi phạm bảo mật do lỗi con người**.
  - Hơn 77% tổ chức không có kế hoạch ứng phó sự cố.
  - Doanh nghiệp mất gần 6 tháng mới phát hiện rò rỉ. Giá cổ phiếu giảm trung bình 7,27% sau sự cố.

## 2. HTTPS [tr. 7](#p7)–[tr. 8](#p8)
- **HTTPS** là phiên bản bảo mật của HTTP: dữ liệu giữa browser và website được **mã hoá**. HTTPS đặc biệt quan trọng khi gửi dữ liệu nhạy cảm như đăng nhập ngân hàng, email, bảo hiểm y tế.
- Giao thức mã hoá là **TLS (Transport Layer Security)**, tên cũ là **SSL**. TLS dùng cặp khoá:
  - **Private key**: chủ website giữ bí mật trên server, dùng để **giải mã** dữ liệu đã mã hoá bằng public key.
  - **Public key**: công khai cho mọi người. Dữ liệu mã hoá bằng public key **chỉ giải mã được bằng private key**.
- *Bổ sung*: thực tế cặp khoá bất đối xứng chủ yếu dùng lúc **bắt tay (handshake)** để trao đổi khoá phiên. Dữ liệu sau đó được mã hoá đối xứng bằng khoá phiên cho nhanh.

## 3. Session management [tr. 10](#p10)–[tr. 12](#p12)
- **Web session** là chuỗi giao dịch HTTP request/response **gắn với cùng một người dùng**.
- Ứng dụng web cần lưu trạng thái của người dùng (quyền truy cập, cài đặt ngôn ngữ…) xuyên nhiều request. Ứng dụng có thể tạo session cho cả người dùng ẩn danh ngay từ request đầu tiên.
- Session ID bị lộ, bị bắt, bị đoán, bị brute force hoặc bị cố định (**fixation**) đều dẫn tới **session hijacking (sidejacking)**. Khi đó kẻ tấn công **mạo danh hoàn toàn** nạn nhân.
- Có hai loại hijacking: **targeted** (nhắm một người) và **generic** (bất kỳ ai).

## 4. Authentication [tr. 14](#p14)–[tr. 17](#p17)
- Hai nhóm vấn đề chính:
  - Ngăn người không có quyền truy cập dữ liệu nhạy cảm:
    - **Authentication**: xác định người dùng có phải người được phép không.
    - **Access control**: tài nguyên nào cần bảo vệ và ai được truy cập.
  - Ngăn đánh cắp dữ liệu trên đường truyền bằng **mã hoá** (SSL).
- Quy trình xác thực:
  1. Thu thập thông tin đăng nhập (username/password) qua giao diện browser.
  2. Chuyển tới server qua HTTP (không an toàn) hoặc **HTTPS** (an toàn).
  3. Đối chiếu với **Realm** (cơ sở dữ liệu bảo mật chứa username, password, role…; tổ chức bằng LDAP, RDBMS hoặc flat-file).
  4. Theo dõi người dùng đã xác thực cho các request sau.
- Header \`WWW-Authenticate: Basic realm="defaultRealm"\`. Realm chứa Users, Groups và **ACL** (Access Control List).
- **Basic Authentication**:
  - userid/password chỉ được **mã hoá base64**, tương đương gửi plain text.
  - Kẻ tấn công không cần giải mã, chỉ cần **gửi lại khối dữ liệu đã đánh cắp** nhiều lần. Đây là **replay attack**.
- **Digest Authentication**:
  - Server gửi một **nonce** khác nhau mỗi lần.
  - Browser đưa nonce cùng userid/password qua **hàm một chiều** (MD5, SHA-1), nên giá trị gửi đi chỉ dùng được **một lần**.
  - Browser phổ biến không dùng Digest, nhưng applet thì có thể.

## 5. Các tấn công web phổ biến [tr. 19](#p19)
- Phía **client**: XSS, CSRF.
- Phía **server**: SQLi, Brute-force, File upload, Command injection.

### XSS – Cross-Site Scripting [tr. 20](#p20)–[tr. 24](#p24)
- Kẻ tấn công **chèn code client-side độc hại** vào website. Code chạy trên máy nạn nhân, giúp kẻ tấn công vượt access control và mạo danh người dùng. Theo OWASP, XSS đứng thứ 7 năm 2017.
- Ví dụ: link \`…/comment?message=<script src=https://evil…/badscript.js><\/script>\` đánh cắp mật khẩu và dữ liệu nhạy cảm.
- 3 loại:
  - **Reflected**: script đến từ HTTP request hiện tại.
  - **Stored**: script nằm trong database của site.
  - **DOM-based**: lỗ hổng nằm trong code client-side.
- Phòng chống:
  - **Lọc input** khi nhận.
  - **Encode output** khi xuất.
  - Đặt response header phù hợp.
  - Dùng **Content Security Policy**.

### CSRF – Cross-Site Request Forgery [tr. 25](#p25)–[tr. 26](#p26)
- Ép người dùng **đang đăng nhập** thực hiện hành động ngoài ý muốn trên ứng dụng.
- Phòng chống: thêm **CSRF token** vào các request quan trọng. Token phải:
  - Không đoán được, entropy cao.
  - Gắn với session người dùng.
  - Được kiểm tra chặt chẽ trước khi thực hiện hành động.

### SQL Injection [tr. 27](#p27)–[tr. 31](#p31)
- Chèn câu SQL qua dữ liệu input, từ đó **chạy SQL tuỳ ý** trên database: đọc, sửa, xoá dữ liệu bất kể quyền.
- Ví dụ: nhập \`' UNION SELECT username, password FROM users--\` vào ô category. Câu truy vấn trở thành \`… WHERE category = 'Gifts' UNION SELECT username, password FROM users--\` và trả về toàn bộ tài khoản.
- Phòng chống: dùng **parameterized query / PreparedStatement** thay cho nối chuỗi.

### Brute force [tr. 32](#p32)–[tr. 33](#p33)
- Còn gọi là **exhaustive search**: đoán lần lượt các tổ hợp (chữ + số, dictionary) tới khi đúng mật khẩu.
- Phòng chống: mật khẩu dài và phức tạp, **khoá tài khoản (account lockout)** khi sai nhiều lần.

### File upload [tr. 34](#p34)–[tr. 36](#p36)
- Bước đầu của nhiều cuộc tấn công là đưa code lên hệ thống, sau đó tìm cách thực thi code đó.
- Phòng chống:
  - Chỉ cho phép loại file cần thiết, dùng **whitelist phần mở rộng**.
  - Lọc và kiểm tra nội dung file.
  - Bỏ ký tự điều khiển/Unicode trong tên file. Giới hạn độ dài tên.
  - Thư mục upload **không có quyền execute**.
  - Giới hạn kích thước tối đa (chống DoS) và tối thiểu.
  - Dùng biện pháp chống CSRF.

### Command injection [tr. 37](#p37)–[tr. 39](#p39)
- Thực thi **lệnh tuỳ ý trên hệ điều hành host** qua ứng dụng có lỗ hổng. Ví dụ: chức năng "Ping a device" trong DVWA, nhập \`8.8.8.8; cat /etc/passwd\`.
- Phòng chống: validate theo **whitelist**, kiểm tra input là số hoặc chỉ gồm ký tự chữ-số (không cú pháp, không khoảng trắng).`,keyConcepts:[{term:`Website security`,definition:`Bảo vệ website khỏi truy cập, sử dụng, sửa đổi, phá huỷ, gián đoạn trái phép; cần thiết kế ở mọi tầng.`,pages:[3],source:`slide`},{term:`HTTPS`,definition:`HTTP bảo mật – dữ liệu giữa browser và website được mã hoá bằng TLS.`,pages:[7,8],source:`slide`},{term:`TLS / SSL`,definition:`Giao thức mã hoá của HTTPS; TLS là tên mới, SSL là tên cũ.`,pages:[8],source:`slide`},{term:`Public key / private key`,definition:`Public key công khai để mã hoá; private key bí mật trên server để giải mã.`,pages:[8],source:`slide`},{term:`Khoá phiên trong TLS`,definition:`Mã hoá bất đối xứng dùng khi bắt tay để trao đổi khoá; dữ liệu sau đó mã hoá đối xứng bằng khoá phiên.`,pages:[8],source:`bổ sung`},{term:`Web session`,definition:`Chuỗi HTTP request/response gắn với cùng một người dùng, lưu trạng thái như quyền truy cập, ngôn ngữ.`,pages:[10],source:`slide`},{term:`Session hijacking`,definition:`Lộ/bắt/đoán/brute force/fixation session ID giúp kẻ tấn công mạo danh hoàn toàn nạn nhân; targeted hoặc generic.`,pages:[12],source:`slide`},{term:`Authentication vs access control`,definition:`Authentication: xác định người dùng hợp lệ; access control: tài nguyên nào được bảo vệ, ai được truy cập.`,pages:[14],source:`slide`},{term:`Realm`,definition:`Cơ sở dữ liệu bảo mật chứa username, password, role (LDAP, RDBMS, flat-file); chứa users, groups, ACL.`,pages:[15,16],source:`slide`},{term:`ACL`,definition:`Access Control List – danh sách quyền truy cập trong realm.`,pages:[16],source:`slide`},{term:`Basic Authentication`,definition:`Gửi userid/password mã base64 (gần như plain text); dễ bị replay attack.`,pages:[16],source:`slide`},{term:`Replay attack`,definition:`Kẻ tấn công gửi lại khối thông tin xác thực đã đánh cắp mà không cần giải mã.`,pages:[16],source:`slide`},{term:`Digest Authentication`,definition:`Dùng nonce khác nhau mỗi lần và hàm băm một chiều (MD5, SHA-1) để giá trị gửi đi chỉ dùng một lần.`,pages:[17],source:`slide`},{term:`Nonce`,definition:`Chuỗi do server sinh, khác nhau mỗi lần, dùng trong Digest Authentication.`,pages:[17],source:`slide`},{term:`XSS`,definition:`Chèn script độc hại vào website, chạy trên máy nạn nhân để đánh cắp dữ liệu/mạo danh.`,pages:[20],source:`slide`},{term:`Reflected / Stored / DOM-based XSS`,definition:`Script từ request hiện tại; từ database; lỗ hổng trong code phía client.`,pages:[22],source:`slide`},{term:`Content Security Policy`,definition:`Header giới hạn nguồn script/tài nguyên được phép chạy – một biện pháp chống XSS.`,pages:[23],source:`slide`},{term:`CSRF`,definition:`Buộc người dùng đã đăng nhập thực hiện hành động ngoài ý muốn trên ứng dụng.`,pages:[25],source:`slide`},{term:`CSRF token`,definition:`Token không đoán được, gắn với session, kiểm tra nghiêm ngặt trước mỗi hành động quan trọng.`,pages:[26],source:`slide`},{term:`SQL Injection`,definition:`Chèn câu SQL qua input để chạy SQL tuỳ ý trên database.`,pages:[27,28],source:`slide`},{term:`Prepared statement`,definition:`Truy vấn tham số hoá: tách câu SQL khỏi dữ liệu, chống SQL injection.`,pages:[30],source:`slide`},{term:`Brute force`,definition:`Đoán thử mọi tổ hợp/dictionary tới khi ra mật khẩu; chống bằng mật khẩu mạnh và khoá tài khoản.`,pages:[32],source:`slide`},{term:`File upload attack`,definition:`Đưa file chứa code lên server rồi tìm cách thực thi; chống bằng whitelist, kiểm tra nội dung, thư mục không quyền execute.`,pages:[34,35],source:`slide`},{term:`Command injection`,definition:`Thực thi lệnh tuỳ ý trên hệ điều hành host qua ứng dụng; chống bằng whitelist và kiểm tra định dạng input.`,pages:[37,38],source:`slide`}],codeExamples:[{title:`SQL Injection: nối chuỗi vs PreparedStatement`,language:`java`,code:`// Before – dễ bị SQL injection
String query = "SELECT * FROM products WHERE category = '" + input + "'";
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery(query);

// After – parameterized query
PreparedStatement statement = connection.prepareStatement(
    "SELECT * FROM products WHERE category = ?");
statement.setString(1, input);
ResultSet resultSet = statement.executeQuery();`,explanation:`Nối input vào chuỗi SQL cho phép kẻ tấn công thay đổi cấu trúc câu lệnh; PreparedStatement gửi dữ liệu tách biệt nên input chỉ là giá trị.`,parts:[{lines:`2`,note:`Nếu input = Gifts' UNION SELECT username, password FROM users-- thì câu SQL bị biến đổi.`},{lines:`7-8`,note:`Dấu ? là placeholder.`},{lines:`9`,note:`setString gán giá trị – được escape tự động.`}],pages:[28,30],source:`slide`},{title:`Encode output chống XSS (minh hoạ)`,language:`php`,code:`<?php
// Sai: in thẳng dữ liệu người dùng
echo "Comment: " . $_GET['message'];

// Đúng: encode khi xuất ra HTML
echo "Comment: " . htmlspecialchars($_GET['message'], ENT_QUOTES, 'UTF-8');

// Thêm header Content-Security-Policy
header("Content-Security-Policy: script-src 'self'");
?>`,explanation:`Biện pháp "Encode data on output" và "Content Security Policy" trên slide: ký tự < > " ' được chuyển thành entity nên script không chạy.`,parts:[{lines:`3`,note:`message=<script…> sẽ được thực thi trong browser nạn nhân (reflected XSS).`},{lines:`6`,note:`htmlspecialchars biến <script> thành &lt;script&gt;.`},{lines:`9`,note:`Chỉ cho phép script từ cùng origin.`}],pages:[21,23],source:`bổ sung`},{title:`CSRF token trong form (minh hoạ)`,language:`html`,code:`<form action="/transfer" method="post">
  <input type="hidden" name="csrf_token" value="f3a9c1…random…">
  <input name="to"> <input name="amount">
  <button>Chuyển tiền</button>
</form>
<!-- Server: so sánh csrf_token với token lưu trong session trước khi chuyển tiền -->`,explanation:`Trang độc hại ở site khác không biết token nên request giả mạo bị từ chối.`,parts:[{lines:`2`,note:`Token ngẫu nhiên, entropy cao, gắn với session.`},{lines:`6`,note:`Kiểm tra nghiêm ngặt trước khi thực hiện hành động.`}],pages:[26],source:`bổ sung`}],figures:[{page:19,caption:`Phân loại tấn công phía client và server`},{page:21,caption:`Kịch bản tấn công XSS`},{page:25,caption:`Kịch bản CSRF`},{page:28,caption:`SQL Injection với UNION SELECT`},{page:37,caption:`Command injection`}],flashcards:[{id:`fc-01`,front:`Định nghĩa website security (Mozilla)?`,back:`Bảo vệ website khỏi truy cập, sử dụng, sửa đổi, phá huỷ, gián đoạn trái phép.`,pages:[3],source:`slide`},{id:`fc-02`,front:`4 thành phần cần thiết kế bảo mật?`,back:`Ứng dụng web; cấu hình web server; chính sách mật khẩu; code phía client.`,pages:[3],source:`slide`},{id:`fc-03`,front:`Bao nhiêu % vi phạm bảo mật do lỗi con người?`,back:`95%.`,pages:[5],source:`slide`},{id:`fc-04`,front:`HTTPS dùng giao thức mã hoá nào?`,back:`TLS (trước đây là SSL).`,pages:[8],source:`slide`},{id:`fc-05`,front:`Dữ liệu mã hoá bằng public key giải mã bằng gì?`,back:`Chỉ bằng private key (giữ bí mật trên server).`,pages:[8],source:`slide`},{id:`fc-06`,front:`Web session là gì?`,back:`Chuỗi giao dịch HTTP request/response gắn với cùng một người dùng.`,pages:[10],source:`slide`},{id:`fc-07`,front:`Nguyên nhân dẫn đến session hijacking?`,back:`Session ID bị lộ, bắt, đoán, brute force hoặc fixation.`,pages:[12],source:`slide`},{id:`fc-08`,front:`Authentication khác access control?`,back:`Authentication: xác định danh tính hợp lệ; access control: ai được truy cập tài nguyên nào.`,pages:[14],source:`slide`},{id:`fc-09`,front:`Realm là gì?`,back:`Cơ sở dữ liệu bảo mật chứa username, password, role (LDAP, RDBMS, flat-file…).`,pages:[15],source:`slide`},{id:`fc-10`,front:`Basic Authentication mã hoá mật khẩu thế nào?`,back:`Chỉ base64 – gần như plain text.`,pages:[16],source:`slide`},{id:`fc-11`,front:`Replay attack là gì?`,back:`Gửi lại khối thông tin xác thực đánh cắp được mà không cần giải mã.`,pages:[16],source:`slide`},{id:`fc-12`,front:`Digest Authentication cải thiện Basic thế nào?`,back:`Dùng nonce khác nhau + hàm băm một chiều nên giá trị chỉ dùng được một lần.`,pages:[17],source:`slide`},{id:`fc-13`,front:`Tấn công phía client và phía server trên slide?`,back:`Client: XSS, CSRF. Server: SQLi, brute-force, file upload, command injection.`,pages:[19],source:`slide`},{id:`fc-14`,front:`3 loại XSS?`,back:`Reflected, Stored, DOM-based.`,pages:[22],source:`slide`},{id:`fc-15`,front:`4 cách phòng chống XSS?`,back:`Lọc input; encode output; header phù hợp; Content Security Policy.`,pages:[23],source:`slide`},{id:`fc-16`,front:`CSRF là gì?`,back:`Buộc người dùng đã đăng nhập thực hiện hành động ngoài ý muốn.`,pages:[25],source:`slide`},{id:`fc-17`,front:`3 yêu cầu với CSRF token?`,back:`Không đoán được (entropy cao); gắn với session; kiểm tra nghiêm ngặt trước hành động.`,pages:[26],source:`slide`},{id:`fc-18`,front:`Cách phòng chống SQL injection chính?`,back:`Parameterized query / prepared statement thay vì nối chuỗi.`,pages:[30],source:`slide`},{id:`fc-19`,front:`Payload SQLi trên slide để lấy tài khoản?`,back:"`' UNION SELECT username, password FROM users--`",pages:[28],source:`slide`},{id:`fc-20`,front:`Brute force còn gọi là gì? Phòng chống?`,back:`Exhaustive search; mật khẩu dài/phức tạp và account lockout.`,pages:[32],source:`slide`},{id:`fc-21`,front:`Thư mục chứa file upload cần cấu hình gì?`,back:`Không có quyền execute, gỡ các script handler.`,pages:[35],source:`slide`},{id:`fc-22`,front:`Vì sao giới hạn kích thước file upload?`,back:`Chống tấn công từ chối dịch vụ (DoS).`,pages:[35],source:`slide`},{id:`fc-23`,front:`Command injection là gì?`,back:`Thực thi lệnh tuỳ ý trên OS host qua ứng dụng có lỗ hổng.`,pages:[37],source:`slide`},{id:`fc-24`,front:`Phòng chống command injection?`,back:`Validate theo whitelist; kiểm tra input là số hoặc chỉ chữ-số, không cú pháp/khoảng trắng.`,pages:[38],source:`slide`}],quiz:[{id:`q-01`,level:`nhớ`,question:`Giao thức mã hoá mà HTTPS sử dụng hiện nay?`,options:[`TLS (trước đây là SSL)`,`SSH`,`IPSec`,`FTP`],answer:0,explanation:`The protocol is called Transport Layer Security (TLS), formerly SSL.`,pages:[8],source:`slide`},{id:`q-02`,level:`hiểu`,question:`Trong cặp khoá của HTTPS, phát biểu nào đúng?`,options:[`Private key công khai cho mọi client`,`Dữ liệu mã hoá bằng public key chỉ giải mã được bằng private key`,`Public key dùng để giải mã dữ liệu từ server`,`Hai khoá giống nhau`],answer:1,explanation:`Private key giữ trên server để giải mã thông tin mã hoá bằng public key.`,pages:[8],source:`slide`},{id:`q-03`,level:`hiểu`,question:`Hậu quả khi session ID bị lộ hoặc đoán được?`,options:[`Server tự khởi động lại`,`Trang bị lỗi 404`,`Session hijacking – kẻ tấn công mạo danh hoàn toàn nạn nhân`,`Mật khẩu bị đổi tự động`],answer:2,explanation:`Disclosure/capture/prediction/brute force/fixation of session ID → session hijacking.`,pages:[12],source:`slide`},{id:`q-04`,level:`hiểu`,question:`Vì sao Basic Authentication không an toàn trên HTTP?`,options:[`Vì dùng MD5`,`Vì không có realm`,`Vì cần nonce`,`Vì userid/password chỉ mã base64, kẻ tấn công có thể replay`],answer:3,explanation:`Base64 "might as well be plain text"; hacker chỉ cần replay blob đánh cắp.`,pages:[16],source:`slide`},{id:`q-05`,level:`hiểu`,question:`Thành phần nào giúp Digest Authentication chống replay?`,options:[`Nonce khác nhau mỗi lần kết hợp hàm băm một chiều`,`Cookie`,`Base64`,`Realm`],answer:0,explanation:`Nonce + 1-way function làm password good for only one time.`,pages:[17],source:`slide`},{id:`q-06`,level:`nhớ`,question:`Tấn công nào được slide xếp vào phía client?`,options:[`SQL injection`,`XSS và CSRF`,`Command injection`,`File upload`],answer:1,explanation:`Client side: XSS, CSRF; server side: SQLi, brute-force, file upload, command injection.`,pages:[19],source:`slide`},{id:`q-07`,level:`vận dụng`,question:"Website lưu bình luận vào database và hiển thị cho mọi người. Một bình luận chứa `<script>…<\/script>` chạy trên máy mọi người xem. Đây là loại XSS nào?",options:[`Reflected XSS`,`DOM-based XSS`,`Stored XSS`,`CSRF`],answer:2,explanation:`Stored XSS: malicious script comes from the website's database.`,pages:[22],source:`slide`},{id:`q-08`,level:`vận dụng`,question:`Đoạn PHP sau có lỗ hổng gì?`,code:{language:`php`,code:`echo "Hello " . $_GET['name'];`},options:[`SQL injection`,`File upload`,`Brute force`,`Reflected XSS – in thẳng input không encode`],answer:3,explanation:`Dữ liệu từ request hiện tại được xuất ra HTML không encode → reflected XSS. Khắc phục: encode output.`,pages:[22,23],source:`slide`},{id:`q-09`,level:`hiểu`,question:`Biện pháp chính chống CSRF theo slide?`,options:[`Đưa CSRF token không đoán được, gắn session, vào request và kiểm tra trước khi xử lý`,`Mã hoá base64 form`,`Dùng GET thay POST`,`Tắt JavaScript`],answer:0,explanation:`Include a CSRF token within relevant requests (unpredictable, tied to session, strictly validated).`,pages:[26],source:`slide`},{id:`q-10`,level:`vận dụng`,question:`Với query \`"SELECT * FROM products WHERE category = '" + input + "'"\`, giá trị input nào làm lộ bảng users?`,options:[`Gifts`,`' UNION SELECT username, password FROM users--`,`SELECT users`,`<script>alert(1)<\/script>`],answer:1,explanation:`Dấu ' đóng chuỗi, UNION nối thêm truy vấn, -- comment phần còn lại.`,pages:[28],source:`slide`},{id:`q-11`,level:`vận dụng`,question:`Đoạn Java nào an toàn trước SQL injection?`,options:[`statement.executeQuery("... WHERE id = " + id)`,`query.replace("'", "")`,`connection.prepareStatement("... WHERE id = ?") rồi setString(1, id)`,`executeQuery(id)`],answer:2,explanation:`Parameterized query tách dữ liệu khỏi câu lệnh.`,pages:[30],source:`slide`},{id:`q-12`,level:`hiểu`,question:`Biện pháp nào chống brute force mật khẩu theo slide?`,options:[`Dùng HTTP thay HTTPS`,`Tắt cookie`,`Cho phép mọi ký tự trong tên file`,`Mật khẩu dài phức tạp và khoá tài khoản khi sai nhiều lần`],answer:3,explanation:`Prevent password cracking: long and complex password; account lock out.`,pages:[32],source:`slide`},{id:`q-13`,level:`vận dụng`,question:`Cấu hình nào KHÔNG nên có cho chức năng upload ảnh đại diện?`,options:[`Thư mục upload có quyền execute script`,`Giới hạn kích thước file`,`Whitelist .jpg, .png`,`Loại bỏ ký tự điều khiển trong tên file`],answer:0,explanation:`Uploaded directory should not have any execute permission.`,pages:[35],source:`slide`},{id:`q-14`,level:`vận dụng`,question:'Form "Ping a device" chạy `ping <input>` trên server. Input `8.8.8.8; cat /etc/passwd` khai thác lỗ hổng gì và chống thế nào?',options:[`XSS – encode output`,`Command injection – validate input chỉ là địa chỉ IP hợp lệ (whitelist)`,`CSRF – dùng token`,`SQLi – prepared statement`],answer:1,explanation:`Ký tự ; cho phép nối lệnh tuỳ ý trên OS; validate theo whitelist/định dạng.`,pages:[37,38,39],source:`slide`},{id:`q-15`,level:`nhớ`,question:`Theo OWASP 2017, XSS đứng thứ mấy trong các lỗ hổng web phổ biến (theo slide)?`,options:[`Thứ nhất`,`Thứ ba`,`Thứ bảy`,`Thứ mười`],answer:2,explanation:`XSS was the seventh most common Web app vulnerability in 2017 – OWASP.`,pages:[20],source:`slide`}],examQuestions:[{id:`ex-01`,question:`Trình bày nguyên lý hoạt động của HTTPS và vai trò của public key, private key. Vì sao cần HTTPS khi xác thực người dùng?`,hints:`- HTTPS = HTTP mã hoá, TLS/SSL [tr. 7](#p7)–[tr. 8](#p8).
- Public key mã hoá, private key giải mã; (bổ sung) handshake + khoá phiên.
- Basic auth qua HTTP chỉ base64 → dễ bị nghe lén/replay [tr. 15](#p15)–[tr. 16](#p16).`,pages:[7,8,15,16],source:`slide`},{id:`ex-02`,question:`So sánh Basic Authentication và Digest Authentication. Giải thích replay attack.`,hints:`- Header WWW-Authenticate, realm, ACL [tr. 16](#p16).
- Basic: base64, replay attack [tr. 16](#p16).
- Digest: nonce, hàm một chiều MD5/SHA-1, dùng một lần [tr. 17](#p17).`,pages:[16,17],source:`slide`},{id:`ex-03`,question:`Trình bày tấn công XSS: khái niệm, 3 loại và các biện pháp phòng chống. Cho ví dụ đoạn code có lỗ hổng và cách sửa.`,hints:`- Định nghĩa, kịch bản [tr. 20](#p20)–[tr. 21](#p21).
- Reflected / Stored / DOM-based [tr. 22](#p22).
- Lọc input, encode output, header, CSP [tr. 23](#p23).
- Ví dụ echo $_GET → htmlspecialchars.`,pages:[20,21,22,23],source:`slide`},{id:`ex-04`,question:`SQL injection là gì? Phân tích ví dụ UNION SELECT trên slide và trình bày cách phòng chống bằng prepared statement.`,hints:`- Định nghĩa [tr. 27](#p27).
- Payload \`' UNION SELECT username, password FROM users--\` biến đổi câu truy vấn [tr. 28](#p28).
- Before/After PreparedStatement [tr. 30](#p30).`,pages:[27,28,30],source:`slide`},{id:`ex-05`,question:`Liệt kê và giải thích các biện pháp bảo vệ chức năng upload file và chống command injection.`,hints:`- Rủi ro: đưa code lên rồi thực thi [tr. 34](#p34).
- Whitelist, kiểm tra nội dung, bỏ ký tự điều khiển, giới hạn tên/kích thước, thư mục không execute, chống CSRF [tr. 35](#p35).
- Command injection: whitelist, số, chữ-số [tr. 37](#p37)–[tr. 38](#p38).`,pages:[34,35,37,38],source:`slide`}]};export{e as default};