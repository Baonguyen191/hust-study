var e={version:1,subject:`CNWeb`,lesson:`lec-1-introduction`,title:`Bài 1 – Giới thiệu Web Technologies`,summary:`## 1. Web ≠ Internet [tr. 4](#p4)
- **Internet**: mạng vật lý nối hàng triệu máy tính dùng chung bộ giao thức **TCP/IP**. Thực chất Internet là "mạng của các mạng nhỏ hơn".
- **World Wide Web**: tập hợp tài liệu đa phương tiện liên kết với nhau (interlinked). Các tài liệu này lưu trên Internet và được truy cập qua giao thức chung **HTTP**.
- Điểm khác biệt chính: Internet là **phần cứng/hạ tầng**. Web là **phần mềm** cùng dữ liệu, tài liệu và media.
- Internet còn nhiều ứng dụng khác ngoài Web: email, telnet, ftp, usenet, instant messaging, chia sẻ file…

## 2. Lịch sử Internet
- Thập niên 60 xuất hiện ý tưởng mạng máy tính đường dài [tr. 5](#p5):
  - J. Licklider (MIT): "time-sharing network of computers".
  - Paul Baran (Rand): mạng "survivable", vẫn liên lạc được sau tấn công hạt nhân.
  - Donald Davies (NPL, Anh).
- Bộ Quốc phòng Mỹ (DoD) muốn có mạng **phân tán, phi tập trung (decentralized)** để đạt hai tính chất [tr. 5](#p5):
  - **survivability**: vẫn hoạt động khi bị tấn công cục bộ.
  - **fault-tolerance**: vẫn hoạt động khi có hỏng hóc cục bộ.
  - Hai tính chất này trái ngược với hệ thống điện thoại hay lưới điện vốn tập trung.
- **1969 – ARPANET** do ARPA tài trợ, nối 4 nơi: UCLA, UCSB, SRI, Univ. of Utah [tr. 6](#p6).
  - Tốc độ đường truyền 56 Kb/s, so với 110 b/s qua đường điện thoại.
  - Là một trong những nỗ lực đầu tiên nối các máy tính khác loại (heterogeneous), đặt ở nhiều nơi.
  - Email: e-mail ARPANET đầu tiên năm 1971 [tr. 8](#p8). Email phổ biến trên ARPANET từ 1972 [tr. 6](#p6).
- **NSFNET (1985–1995)** [tr. 7](#p7):
  - Mục đích chính: nối các trung tâm siêu máy tính (6 trung tâm).
  - Mục đích phụ: làm backbone nối các mạng vùng.
  - Ngoài ra có các mạng mở như SURAnet và CSNET.
- Tăng trưởng [tr. 8](#p8):
  - Thập niên 70, ARPANET tăng gấp đôi mỗi năm.
  - **TCP/IP** ra đời giữa thập niên 70. ARPANET chuyển hẳn sang TCP/IP ngày **1/1/1983**.
  - Khoảng 1000 host năm 1984. Khoảng 1 triệu máy năm 1992.
  - Năm 1992, quyền quản lý chuyển cho các tổ chức phi lợi nhuận: Internet Society, IETF, IAB, IANA, **W3C**.
- Internet tăng trưởng theo hàm mũ, gấp đôi sau mỗi 1–2 năm [tr. 9](#p9).

## 3. Lịch sử Web
- Ý tưởng **hypertext** (tài liệu liên kết chéo) có từ Vannevar Bush (thập niên 1940). Các hệ hypertext online xuất hiện từ thập niên 60: HES, NLS. Năm 1987 Apple ra **HyperCard** [tr. 10](#p10).
- **1989 – Tim Berners-Lee (CERN)** thiết kế hệ hypertext liên kết tài liệu qua Internet [tr. 10](#p10):
  - Ngôn ngữ mô tả nội dung, phát triển thành **HTML**.
  - Giao thức tải tài liệu, phát triển thành **HTTP**.
  - Trình duyệt đầu tiên: dạng text, không có media nhúng.
- **1993 – Mosaic** do Marc Andreessen & Eric Bina viết ở NCSA. Đây là browser đồ hoạ phổ biến hoá WWW (trước đó đã có Erwise, ViolaWWW) [tr. 11](#p11).
- Các mốc tiếp theo [tr. 11](#p11):
  - 1994: Netscape (75% thị phần năm 1996).
  - 1995: Internet Explorer. 1996: Opera.
  - 1998: AOL mua Netscape. 2004: Firefox 1.0. 2008: Google Chrome.
- Sơ đồ tiến hoá [tr. 12](#p12): The Web (connects information) → Social Software (connects people) → Semantic Web (connects knowledge) → Metaweb (connects intelligence).

## 4. World Wide Web, client và server [tr. 13](#p13)
- Web là tập các máy (**Web server**) trên Internet cung cấp thông tin, nhất là tài liệu HTML, qua HTTP.
- Máy truy cập thông tin là **Web client**. **Web browser** là phần mềm người dùng cuối dùng để truy cập Web.

## 5. HTTP – Hypertext Transfer Protocol
- Mô hình **request–response**: client gửi request, server trả response [tr. 14](#p14).
- HTTP là giao thức **stateless**: server không phải nhớ gì về client giữa các request [tr. 14](#p14).
- Thường chạy trên **TCP, cổng 80** [tr. 15](#p15). Một lượt tương tác điển hình:
  1. Người dùng nhập địa chỉ.
  2. Browser dùng **DNS** tìm IP.
  3. Browser mở kết nối TCP.
  4. Browser gửi request.
  5. Server gửi response.
  6. Browser hiển thị body ở client area.
- **Request** gồm: start line, các header field, một dòng trống, body (tuỳ chọn) [tr. 16](#p16).
  - Start line, vd \`GET / HTTP/1.1\`, có 3 phần: **method**, **Request-URI**, **HTTP version** [tr. 18](#p18).
  - Request-URI là phần URI sau host name. Host name do header bắt buộc **Host** cung cấp [tr. 21](#p21).
- **Response** gồm: status line, header field, dòng trống, body (tuỳ chọn) [tr. 23](#p23).
  - Status line, vd \`HTTP/1.1 200 OK\`, gồm: version, **status code**, **reason phrase** (cho người đọc) [tr. 25](#p25).
  - Status code có 3 chữ số. Chữ số đầu là lớp mã [tr. 26](#p26):
    - 1xx Informational, 2xx Success.
    - 3xx Redirection (có URL thay thế).
    - 4xx Client Error, 5xx Server Error.
  - Header thường gặp [tr. 28](#p28):
    - \`Connection\`, \`Content-Type\`, \`Content-Length\`.
    - \`Date\` (bắt buộc).
    - \`Location\` (URI mới khi redirect).
    - \`Last-Modified\`, \`Expires\`.
    - \`ETag\` (định danh phiên bản tài nguyên, đổi khi tài nguyên đổi).
- Có thể thử HTTP thủ công bằng \`telnet www.example.org 80\` [tr. 29](#p29).

## 6. URI, URN, URL [tr. 21](#p21)–[tr. 22](#p22)
- Cú pháp URI: \`scheme : scheme-dependent-part\`.
- **URN** (Uniform Resource Name): định danh tài nguyên bằng tên duy nhất (vd sách theo ISBN). Scheme là \`urn\`.
- **URL** (Uniform Resource Locator): chỉ **vị trí** tìm thấy tài nguyên. Các scheme gồm \`http\`, \`https\`, \`ftp\`, \`mailto\`, \`file\`.

## 7. Tăng trưởng Web và địa chỉ IP
- Số máy và web server tăng vọt qua các năm, gắn với các mốc browser: Mosaic, Netscape, IE/Opera, Firefox, Chrome, Safari [tr. 30](#p30).
- **IPv4** (1981) dùng địa chỉ 32 bit, khoảng 4,29 tỷ địa chỉ [tr. 31](#p31).
  - IANA cạn địa chỉ ngày 31/1/2011. APNIC cạn ngày 15/4/2011. RIPE NCC cạn ngày 14/9/2012.
- **IPv6** dùng địa chỉ **128 bit** và được thiết kế lại để định tuyến hiệu quả hơn [tr. 31](#p31).

## 8. Browser, trang tĩnh/động, client và server
- Các thành phần của cửa sổ browser: title bar, menu bar, navigation toolbar, **client area**, status bar [tr. 33](#p33).
- Nhiệm vụ chính của browser [tr. 34](#p34):
  - Chuyển URL thành HTTP request.
  - Giao tiếp với server qua HTTP.
  - **Render** tài liệu nhận về.
- **Static page**: nội dung giống nhau mỗi lần truy cập. **Dynamic page**: thay đổi, phản ứng theo hành động người dùng, xử lý thông tin, cá nhân hoá (vd amazon.com). Môn học tập trung vào trang và ứng dụng động [tr. 35](#p35).
- Web client không chỉ là browser: còn có lynx (text-only), điện thoại, **robot/crawler** của search engine [tr. 36](#p36).
- Chức năng cơ bản của **Web server** [tr. 37](#p37):
  1. Nhận HTTP request qua TCP.
  2. Ánh xạ header Host tới **virtual host** (nhiều host name dùng chung 1 IP).
  3. Ánh xạ Request-URI tới tài nguyên: nếu là **file** thì trả file, nếu là **program** thì chạy và trả output.
  4. Chọn **MIME type** để đặt header \`Content-Type\`.
  5. Ghi log.
- Các web server [tr. 38](#p38):
  - httpd (UIUC).
  - **Apache** ("a patchy" httpd), phổ biến nhất, nhất là trên Linux.
  - **IIS** của Microsoft.
  - **Tomcat**: chạy Java, container **Catalina** chạy servlet, có thể chạy độc lập với front-end **Coyote**.
- **Cache** phía client [tr. 39](#p39)–[tr. 43](#p43): browser lưu ảnh đã tải vào cache. Khi cần lại, browser lấy từ cache hoặc gửi request tới server lần nữa.

## 9. Web Developer Roadmap [tr. 44](#p44)–[tr. 47](#p47)
Lộ trình 2020 gồm 3 nhánh: **Front-end** (HTML/CSS/JS → package manager, framework như React/Angular/Vue, bundler như webpack, testing…), **Back-end** và **DevOps**.`,keyConcepts:[{term:`Internet`,definition:`Mạng vật lý (mạng của các mạng) nối hàng triệu máy tính dùng chung giao thức TCP/IP – phần hạ tầng.`,pages:[4],source:`slide`},{term:`World Wide Web`,definition:`Tập hợp tài liệu đa phương tiện liên kết với nhau, lưu trên Internet và truy cập bằng HTTP – phần mềm + dữ liệu.`,pages:[4,13],source:`slide`},{term:`ARPANET`,definition:`Mạng do ARPA tài trợ năm 1969, nối UCLA, UCSB, SRI, Utah; tiền thân Internet; chuyển sang TCP/IP ngày 1/1/1983.`,pages:[6,8],source:`slide`},{term:`Survivability / fault-tolerance`,definition:`Lý do DoD muốn mạng phi tập trung: vẫn hoạt động khi bị tấn công hoặc hỏng cục bộ.`,pages:[5],source:`slide`},{term:`NSFNET`,definition:`Mạng 1985–1995 nối các trung tâm siêu máy tính, làm backbone cho các mạng vùng.`,pages:[7],source:`slide`},{term:`Hypertext`,definition:`Tài liệu liên kết chéo với nhau; ý tưởng từ Vannevar Bush (1940s).`,pages:[10],source:`slide`},{term:`Tim Berners-Lee`,definition:`Tại CERN năm 1989 thiết kế hệ hypertext qua Internet, tạo ra HTML, HTTP và browser đầu tiên.`,pages:[10],source:`slide`},{term:`Mosaic`,definition:`Browser đồ hoạ (1993, Andreessen & Bina, NCSA) phổ biến hoá WWW cho công chúng.`,pages:[11],source:`slide`},{term:`Web server / Web client / Web browser`,definition:`Server cung cấp tài liệu qua HTTP; client là máy truy cập; browser là phần mềm người dùng cuối dùng để truy cập Web.`,pages:[13],source:`slide`},{term:`HTTP request–response`,definition:`Mô hình giao tiếp: client gửi request, server trả response; chạy trên TCP cổng 80.`,pages:[14,15],source:`slide`},{term:`Stateless protocol`,definition:`Server không cần nhớ thông tin về client giữa các request.`,pages:[14],source:`slide`},{term:`Cấu trúc HTTP request`,definition:`Start line (method, Request-URI, version) + header fields + dòng trống + body tuỳ chọn.`,pages:[16,18],source:`slide`},{term:`Header Host`,definition:`Header bắt buộc (HTTP/1.1) cho biết host name; Request-URI là phần sau host name.`,pages:[21],source:`slide`},{term:`Cấu trúc HTTP response`,definition:`Status line (version, status code, reason phrase) + header fields + dòng trống + body tuỳ chọn.`,pages:[23,25],source:`slide`},{term:`Status code`,definition:`Số 3 chữ số; chữ số đầu: 1 Informational, 2 Success, 3 Redirection, 4 Client Error, 5 Server Error.`,pages:[26],source:`slide`},{term:`ETag`,definition:`Header định danh duy nhất cho phiên bản tài nguyên; thay đổi khi tài nguyên thay đổi.`,pages:[28],source:`slide`},{term:`URI / URN / URL`,definition:`URI = định danh tài nguyên; URN định danh bằng tên duy nhất (scheme urn); URL chỉ vị trí (http, https, ftp, mailto, file).`,pages:[21,22],source:`slide`},{term:`IPv4 vs IPv6`,definition:`IPv4 (1981) địa chỉ 32 bit ≈ 4,29 tỷ, đã cạn; IPv6 địa chỉ 128 bit, định tuyến hiệu quả hơn.`,pages:[31],source:`slide`},{term:`Static vs dynamic page`,definition:`Trang tĩnh có nội dung cố định mỗi lần truy cập; trang động thay đổi, phản ứng theo người dùng.`,pages:[35],source:`slide`},{term:`Virtual host`,definition:`Một trong nhiều host name dùng chung một địa chỉ IP; server chọn dựa trên header Host.`,pages:[37],source:`slide`},{term:`MIME type`,definition:`Kiểu tài nguyên, server dùng để đặt header Content-Type trong response.`,pages:[37],source:`slide`},{term:`Apache / IIS / Tomcat`,definition:`Apache – server phổ biến nhất; IIS – của Microsoft; Tomcat – server Java với container Catalina chạy servlet, front-end Coyote.`,pages:[38],source:`slide`},{term:`Browser cache`,definition:`Browser lưu tài nguyên (vd ảnh) đã tải để dùng lại thay vì request lại server.`,pages:[40,43],source:`slide`}],codeExamples:[{title:`Gửi HTTP request thủ công bằng telnet`,language:`http`,code:`$ telnet www.example.org 80
Trying 192.0.34.166...
Connected to www.example.com (192.0.34.166).
Escape character is '^]'.
GET / HTTP/1.1
Host: www.example.org

HTTP/1.1 200 OK
Date: Thu, 09 Oct 2003 20:30:49 GMT
...`,explanation:`Mở kết nối TCP tới cổng 80, gõ tay một HTTP request và đọc response trả về – minh hoạ trực tiếp cấu trúc request/response.`,parts:[{lines:`1-4`,note:`Connect: mở kết nối TCP tới server cổng 80.`},{lines:`5-7`,note:"Send request: start line `GET / HTTP/1.1`, header bắt buộc `Host`, rồi một dòng trống kết thúc phần header."},{lines:`8-10`,note:"Receive response: status line `HTTP/1.1 200 OK` (version, status code, reason phrase) và header `Date`."}],pages:[29],source:`slide`}],figures:[{page:12,caption:`Sơ đồ tiến hoá: Web → Social Software → Semantic Web → Metaweb`},{page:29,caption:`Ví dụ HTTP request/response qua telnet`},{page:30,caption:`Bảng tăng trưởng số máy và web server theo năm`},{page:33,caption:`Các thành phần cửa sổ trình duyệt`},{page:45,caption:`Front-end developer roadmap`}],flashcards:[{id:`fc-01`,front:`Khác biệt cốt lõi giữa Internet và Web?`,back:`Internet là hạ tầng phần cứng (mạng TCP/IP); Web là phần mềm + tài liệu liên kết truy cập qua HTTP.`,pages:[4],source:`slide`},{id:`fc-02`,front:`Kể 3 ứng dụng Internet không phải Web.`,back:`Email, telnet, ftp (ngoài ra: usenet, instant messaging, file-sharing).`,pages:[4],source:`slide`},{id:`fc-03`,front:`Hai tính chất DoD mong muốn ở mạng phi tập trung?`,back:`Survivability và fault-tolerance.`,pages:[5],source:`slide`},{id:`fc-04`,front:`ARPANET ra đời năm nào, nối những nơi nào?`,back:`1969; UCLA, UC Santa Barbara, Stanford Research Institute, University of Utah.`,pages:[6],source:`slide`},{id:`fc-05`,front:`ARPANET chuyển hẳn sang TCP/IP khi nào?`,back:`Ngày 1/1/1983.`,pages:[8],source:`slide`},{id:`fc-06`,front:`Mục đích chính của NSFNET?`,back:`Nối các trung tâm siêu máy tính; phụ: làm backbone cho mạng vùng.`,pages:[7],source:`slide`},{id:`fc-07`,front:`Ai phát minh ra Web, ở đâu, năm nào?`,back:`Tim Berners-Lee, CERN, 1989.`,pages:[10],source:`slide`},{id:`fc-08`,front:`Browser nào phổ biến hoá WWW năm 1993?`,back:`Mosaic (Marc Andreessen & Eric Bina, NCSA).`,pages:[11],source:`slide`},{id:`fc-09`,front:`HTTP dùng mô hình giao tiếp gì?`,back:`Request–response.`,pages:[14],source:`slide`},{id:`fc-10`,front:`"HTTP là stateless" nghĩa là gì?`,back:`Server không bắt buộc nhớ gì về client giữa các request.`,pages:[14],source:`slide`},{id:`fc-11`,front:`Cổng chuẩn của HTTP?`,back:`80 (trên TCP).`,pages:[15],source:`slide`},{id:`fc-12`,front:`Các bước khi người dùng nhập một địa chỉ web?`,back:`DNS tìm IP → mở TCP → gửi HTTP request → nhận response → hiển thị body trong client area.`,pages:[15],source:`slide`},{id:`fc-13`,front:`4 phần của một HTTP request?`,back:`Start line, header field(s), dòng trống, body (tuỳ chọn).`,pages:[16],source:`slide`},{id:`fc-14`,front:"3 phần của start line `GET / HTTP/1.1`?",back:`Method (GET), Request-URI (/), HTTP version (HTTP/1.1).`,pages:[18],source:`slide`},{id:`fc-15`,front:"3 phần của status line `HTTP/1.1 200 OK`?",back:`HTTP version, status code, reason phrase.`,pages:[25],source:`slide`},{id:`fc-16`,front:`Ý nghĩa chữ số đầu của status code?`,back:`1 Informational, 2 Success, 3 Redirection, 4 Client Error, 5 Server Error.`,pages:[26],source:`slide`},{id:`fc-17`,front:`Header nào bắt buộc trong response và chứa gì?`,back:"`Date` – thời điểm sinh response.",pages:[28],source:`slide`},{id:`fc-18`,front:"Header `Location` dùng khi nào?",back:`Khi status là redirection – chứa URI thay thế.`,pages:[28],source:`slide`},{id:`fc-19`,front:`URN khác URL thế nào?`,back:`URN định danh bằng tên duy nhất (vd ISBN); URL chỉ vị trí tìm thấy tài nguyên.`,pages:[22],source:`slide`},{id:`fc-20`,front:`Độ dài địa chỉ IPv4 và IPv6?`,back:`IPv4: 32 bit (~4,29 tỷ địa chỉ); IPv6: 128 bit.`,pages:[31],source:`slide`},{id:`fc-21`,front:`3 nhiệm vụ chính của web browser?`,back:`Chuyển URL thành HTTP request; giao tiếp với server qua HTTP; render tài liệu trả về.`,pages:[34],source:`slide`},{id:`fc-22`,front:`Ví dụ web client không phải browser đồ hoạ?`,back:`lynx (text-only), điện thoại di động, robot/crawler của search engine.`,pages:[36],source:`slide`},{id:`fc-23`,front:`Server dùng gì để đặt header Content-Type?`,back:`MIME type của tài nguyên.`,pages:[37],source:`slide`},{id:`fc-24`,front:`Tomcat là gì?`,back:`Web server Java; container Catalina chạy servlet, có thể đứng sau Apache/IIS hoặc chạy độc lập với Coyote.`,pages:[38],source:`slide`}],quiz:[{id:`q-01`,level:`nhớ`,question:`Phát biểu nào đúng về Internet và Web?`,options:[`Web là hạ tầng phần cứng, Internet là phần mềm`,`Internet là mạng vật lý dùng TCP/IP, Web là tập tài liệu liên kết truy cập qua HTTP`,`Internet và Web là một`,`Web ra đời trước Internet`],answer:1,explanation:`Slide: Internet is hardware; Web is software along with data, documents, and other media.`,pages:[4],source:`slide`},{id:`q-02`,level:`nhớ`,question:`ARPANET ra đời năm nào?`,options:[`1959`,`1983`,`1969`,`1989`],answer:2,explanation:`ARPA tài trợ ARPANET năm 1969; 1983 là năm chuyển sang TCP/IP; 1989 là năm Berners-Lee đề xuất Web.`,pages:[6,8],source:`slide`},{id:`q-03`,level:`hiểu`,question:`Vì sao Bộ Quốc phòng Mỹ quan tâm tới mạng phân tán, phi tập trung?`,options:[`Để giảm chi phí đường truyền điện thoại`,`Để mạng vẫn hoạt động khi bị tấn công hay hỏng hóc cục bộ`,`Để tăng tốc độ email`,`Để thay thế hệ thống điện`],answer:1,explanation:`Mục tiêu là survivability và fault-tolerance, trái với hệ thống tập trung như điện thoại/điện lực.`,pages:[5],source:`slide`},{id:`q-04`,level:`nhớ`,question:`Tim Berners-Lee tạo ra những gì khi thiết kế Web tại CERN?`,options:[`TCP/IP và DNS`,`Mosaic và Netscape`,`HTML, HTTP và browser đầu tiên (dạng text)`,`ARPANET và email`],answer:2,explanation:`Ông thiết kế ngôn ngữ mô tả tài liệu (→ HTML), giao thức tải tài liệu (→ HTTP) và viết browser text đầu tiên.`,pages:[10],source:`slide`},{id:`q-05`,level:`hiểu`,question:`"HTTP là giao thức stateless" có nghĩa là:`,options:[`Server không phải nhớ thông tin gì về client giữa các request`,`HTTP không dùng TCP`,`Mỗi request phải mang theo body`,`Server không thể gửi cookie`],answer:0,explanation:`Stateless: protocol không yêu cầu server ghi nhớ client giữa các request.`,pages:[14],source:`slide`},{id:`q-06`,level:`vận dụng`,question:`Người dùng gõ một URL vào browser. Thứ tự nào đúng?`,options:[`Mở TCP → DNS → gửi request → hiển thị`,`Gửi request → DNS → mở TCP → hiển thị`,`DNS → gửi request → mở TCP → nhận response`,`DNS tìm IP → mở TCP → gửi HTTP request → nhận response → hiển thị body`],answer:3,explanation:`Phải có IP (DNS) mới mở được kết nối TCP, rồi mới gửi request qua kết nối đó.`,pages:[15],source:`slide`},{id:`q-07`,level:`vận dụng`,question:`Trong request dưới đây, Request-URI là gì?`,code:{language:`http`,code:`GET /docs/index.html HTTP/1.1
Host: www.example.com`},options:[`www.example.com`,`/docs/index.html`,`GET`,`http://www.example.com/docs/index.html`],answer:1,explanation:`Start line gồm method, Request-URI, version. Request-URI là phần sau host name; host name nằm ở header Host.`,pages:[18,21],source:`slide`},{id:`q-08`,level:`vận dụng`,question:`Server trả status code 404. Lỗi thuộc lớp nào?`,options:[`Server Error`,`Redirection`,`Client Error`,`Informational`],answer:2,explanation:`Chữ số đầu 4 = Client Error.`,pages:[26],source:`slide`},{id:`q-09`,level:`vận dụng`,question:`Response có status 301 kèm header nào để browser biết địa chỉ mới?`,options:[`ETag`,`Last-Modified`,`Content-Length`,`Location`],answer:3,explanation:`3xx = Redirection; header Location chứa URI thay thế.`,pages:[26,28],source:`slide`},{id:`q-10`,level:`hiểu`,question:`Header ETag dùng để làm gì?`,options:[`Định danh duy nhất cho phiên bản hiện tại của tài nguyên, thay đổi khi tài nguyên đổi`,`Cho biết kích thước body`,`Cho biết kiểu MIME`,`Cho biết thời điểm hết hạn bản sao ở client`],answer:0,explanation:`ETag: unique identifier for this version of the requested resource; Expires mới là thời điểm hết hạn.`,pages:[28],source:`slide`},{id:`q-11`,level:`hiểu`,question:`Đâu là ví dụ về URN?`,options:[`http://example.com`,`mailto:a@b.com`,`urn:isbn:0451450523`,`file:///C:/a.txt`],answer:2,explanation:`URN định danh bằng tên duy nhất như ISBN, scheme là urn; các lựa chọn còn lại là URL.`,pages:[22],source:`slide`},{id:`q-12`,level:`nhớ`,question:`Địa chỉ IPv6 dài bao nhiêu bit?`,options:[`32`,`64`,`48`,`128`],answer:3,explanation:`IPv4 dùng 32 bit, IPv6 dùng 128 bit.`,pages:[31],source:`slide`},{id:`q-13`,level:`hiểu`,question:`Nhiều website dùng chung 1 địa chỉ IP trên cùng server. Server phân biệt chúng dựa vào đâu?`,options:[`Header Host → virtual host`,`Status code`,`Cổng TCP khác nhau bắt buộc`,`Header ETag`],answer:0,explanation:`Server map host header (domain name) tới virtual host – một trong nhiều host name chia sẻ một IP.`,pages:[37],source:`slide`},{id:`q-14`,level:`hiểu`,question:`Khi Request-URI trỏ tới một chương trình (program) thay vì file tĩnh, web server làm gì?`,options:[`Trả mã nguồn chương trình`,`Từ chối request`,`Chạy chương trình và trả output trong HTTP response`,`Chuyển request sang DNS`],answer:2,explanation:`File → trả file; Program → chạy và trả output.`,pages:[37],source:`slide`},{id:`q-15`,level:`nhớ`,question:`Container chạy Java servlet trong Tomcat tên là gì?`,options:[`Coyote`,`Catalina`,`Apache`,`IIS`],answer:1,explanation:`Catalina là servlet container; Coyote là HTTP front-end khi chạy độc lập.`,pages:[38],source:`slide`},{id:`q-16`,level:`hiểu`,question:`Lợi ích của browser cache trong chuỗi slide Web server/client?`,options:[`Mã hoá ảnh`,`Tăng bảo mật cookie`,`Bắt buộc server gửi lại ảnh`,`Có thể lấy lại ảnh từ cache thay vì gửi request lại cho server`],answer:3,explanation:`Ảnh được lưu ở cache sau lần tải đầu; lần sau browser có thể dùng bản trong cache.`,pages:[40,43],source:`slide`}],examQuestions:[{id:`ex-01`,question:`Phân biệt Internet và World Wide Web. Trình bày tóm tắt các mốc chính trong lịch sử hình thành Internet và Web.`,hints:`- Internet: mạng vật lý TCP/IP, mạng của các mạng; Web: tài liệu liên kết truy cập qua HTTP [tr. 4](#p4).
- Internet: ý tưởng thập niên 60 (Licklider, Baran, Davies), ARPANET 1969, TCP/IP 1983, NSFNET 1985–1995, chuyển quản lý cho tổ chức phi lợi nhuận 1992 [tr. 5](#p5)–[tr. 8](#p8).
- Web: hypertext (Bush), Berners-Lee 1989 (HTML, HTTP, browser), Mosaic 1993, Netscape, IE, Firefox, Chrome [tr. 10](#p10)–[tr. 11](#p11).`,pages:[4,6,8,10,11],source:`slide`},{id:`ex-02`,question:`Mô tả cấu trúc của HTTP request và HTTP response. Cho ví dụ cụ thể và giải thích ý nghĩa của status code theo từng lớp.`,hints:"- Request: start line (method, Request-URI, version) + headers (Host bắt buộc) + dòng trống + body [tr. 16](#p16)–[tr. 21](#p21).\n- Response: status line (version, code, reason phrase) + headers (Date, Content-Type, Location, ETag…) + dòng trống + body [tr. 23](#p23)–[tr. 28](#p28).\n- Ví dụ telnet: `GET / HTTP/1.1`, `Host: www.example.org` → `HTTP/1.1 200 OK` [tr. 29](#p29).\n- Lớp 1xx–5xx [tr. 26](#p26).",pages:[16,18,25,26,28,29],source:`slide`},{id:`ex-03`,question:`Trình bày các bước diễn ra từ khi người dùng nhập địa chỉ web vào trình duyệt đến khi trang hiển thị, và các chức năng cơ bản của một web server.`,hints:`- Browser: DNS → TCP (cổng 80) → gửi request → nhận response → render body [tr. 15](#p15); nhiệm vụ browser [tr. 34](#p34).
- Server: nhận request qua TCP, map Host → virtual host, map Request-URI → file/program, đặt Content-Type theo MIME, ghi log [tr. 37](#p37).
- Có thể nhắc cache phía client [tr. 40](#p40).`,pages:[15,34,37,40],source:`slide`},{id:`ex-04`,question:`Phân biệt URI, URL, URN và trang web tĩnh với trang web động. Vì sao môn học tập trung vào trang web động?`,hints:`- URI: scheme:scheme-dependent-part; URN theo tên (urn, ISBN); URL theo vị trí (http, https, ftp, mailto, file) [tr. 21](#p21)–[tr. 22](#p22).
- Tĩnh: nội dung cố định; động: thay đổi, phản ứng người dùng, xử lý thông tin, cá nhân hoá (amazon.com) [tr. 35](#p35).
- Web chuyển dịch sang dịch vụ online, e-commerce → cần nội dung động.`,pages:[21,22,35],source:`slide`}]};export{e as default};