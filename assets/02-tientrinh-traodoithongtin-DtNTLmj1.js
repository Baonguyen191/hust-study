var e={version:1,subject:`HPT`,lesson:`02-tientrinh-traodoithongtin`,title:`Chương 2 – Tiến trình & trao đổi thông tin`,summary:`## 1. Tiến trình và luồng
- **Tiến trình (process)** là chương trình đang chạy [tr. 5](#p5).
  - Mỗi tiến trình có **virtual processor** và **virtual memory** riêng, đảm bảo **trong suốt tương tranh**.
  - Tạo tiến trình và **chuyển ngữ cảnh (context switch)** đều tốn kém.
- **Luồng (thread)** là một luồng thực thi của tiến trình [tr. 6](#p6). Tiến trình nhiều luồng gọi là **đa luồng**.
  - Các luồng dùng chung môi trường của tiến trình và trao đổi qua **biến chia sẻ**.
  - Tính an toàn khi các luồng tương tác do **lập trình viên** quyết định.
  - Đa luồng = tăng hiệu năng, đổi lại tăng chi phí lập trình.
- So sánh đa tiến trình và đa luồng trên hệ tập trung theo 3 tiêu chí: chi phí lập trình, chi phí chuyển ngữ cảnh, **lời gọi hệ thống dừng (blocking system call)** [tr. 7](#p7).
- **Cài đặt luồng**: thread package lo tạo, huỷ, đồng bộ luồng [tr. 8](#p8).
  - Ở chế độ người dùng (user mode): một thao tác vào/ra sẽ **block cả tiến trình**.
  - Ở chế độ nhân (kernel mode): tốn kém.
- **Linux** kết hợp LWP (lightweight process) mức kernel với luồng mức user [tr. 9](#p9)–[tr. 10](#p10).
  - Luồng user theo chuẩn **POSIX** (thư viện pthread), ánh xạ **1-1** với một LWP.
  - Linux dùng \`clone()\` thay cho \`fork()\`.

## 2. Server và client trong hệ phân tán
- **Server đơn luồng**: mỗi lúc xử lý một yêu cầu, xử lý tuần tự, không đảm bảo trong suốt. **Server đa luồng** khắc phục điều này [tr. 12](#p12)–[tr. 13](#p13).
- **Mô hình dispatcher/worker** [tr. 14](#p14): luồng dispatcher nhận yêu cầu và giao cho worker.
- Các mô hình đa luồng [tr. 15](#p15):
  - **Thread-per-request**: mỗi yêu cầu một luồng.
  - **Thread-per-connection**: mỗi kết nối một luồng.
  - **Thread-per-object**: mỗi đối tượng từ xa một luồng.
- **Máy trạng thái hữu hạn (FSM)** [tr. 16](#p16):
  - Yêu cầu xếp hàng, server **đơn luồng**, các lời gọi là **không dừng (non-blocking)**.
  - Bất đồng bộ, hướng sự kiện, co giãn tốt. Ví dụ **Node.js**.
- So sánh [tr. 17](#p17):
  - **Đa luồng**: song song, blocking system call.
  - **Đơn luồng**: không song song, blocking.
  - **FSM**: song song, **non-blocking**.
- Vấn đề thiết kế server [tr. 18](#p18):
  - Server **lặp** hay **đồng thời**.
  - Xác định server qua **end-point (port)**, **daemon**, **superserver**.
  - Cách ngắt server.
  - **Stateless** hay **stateful**.
- **inetd** là một superserver [tr. 19](#p19)–[tr. 21](#p21):
  - Cấu hình trong \`/etc/inetd.conf\` gồm tên dịch vụ, kiểu socket, giao thức, wait/nowait, user, đường dẫn, tham số.
  - Khai báo port trong \`/etc/services\`, vd \`errorLogger 9999/udp\`.
- **Client đa luồng** [tr. 22](#p22): tách giao diện khỏi xử lý, tránh các thao tác chờ nhau, tăng tốc khi làm việc với nhiều server. Ví dụ tải trang web.
- **Thin-client: X Window** [tr. 23](#p23)–[tr. 24](#p24):
  - X-server chạy ở máy người dùng (điều khiển màn hình). X-client là ứng dụng.
  - Khó tách logic ứng dụng khỏi lệnh giao diện. Giải pháp là **nén thông điệp**.
- Phần mềm phía client hỗ trợ trong suốt: truy cập, di trú, sao lưu, che giấu lỗi [tr. 25](#p25).

## 3. Trao đổi thông tin giữa các tiến trình
- Giao thức quy định cấu trúc, kích cỡ, thứ tự thông điệp, cách phát hiện thông điệp hỏng/mất. Giao thức được phân tầng [tr. 27](#p27).
  - Các loại: hướng kết nối / không hướng kết nối, tin cậy / không tin cậy.
  - Primitive send/receive: đồng bộ / không đồng bộ, dừng / không dừng.
- **Socket = địa chỉ IP + port** [tr. 28](#p28). Java dùng \`InetAddress.getByName(...)\` [tr. 36](#p36).
- **UDP** [tr. 37](#p37)–[tr. 39](#p39):
  - Không hướng kết nối, không tin cậy, không đồng bộ.
  - Vấn đề: kích cỡ thông điệp (buffer 1000 byte trong ví dụ), **send không dừng nhưng receive bị dừng**, timeout, nhận từ bất kỳ nguồn nào.
  - Java: \`DatagramSocket\`, \`DatagramPacket\`. Server echo ở port 6789.
- **TCP** [tr. 40](#p40)–[tr. 43](#p43):
  - **Bắt tay 3 bước**: SYN → SYNACK → ACK (ACK có thể kèm dữ liệu).
  - Đóng kết nối bằng FIN/ACK. Cả hai bên đều có thể chủ động đóng. Bên đóng trước vào trạng thái "timed wait".
  - Java: \`ServerSocket.accept()\` sinh mỗi kết nối một luồng \`Connection\`, đọc/ghi bằng \`readUTF\`/\`writeUTF\`. Port 7896.

## 4. Lời gọi thủ tục từ xa (RPC)
- **Giao thức yêu cầu–trả lời** [tr. 45](#p45)–[tr. 49](#p49):
  - Cao hơn truyền thông điệp thuần: 2 thông báo gửi/nhận liên tiếp, đồng bộ, tin cậy.
  - **Không cần báo nhận riêng, không cần kiểm soát luồng**.
  - 3 thủ tục: \`doOperation\`, \`getRequest\`, \`sendReply\`.
  - Đơn vị dữ liệu gồm messageType (0 = Request, 1 = Reply), requestId, remoteReference, operationId, arguments.
  - HTTP là một ví dụ.
- **RPC** là cơ chế gọi thủ tục ở máy khác **trong suốt** như gọi cục bộ [tr. 50](#p50)–[tr. 51](#p51).
  - Vấn đề: hệ thống không đồng nhất, không gian nhớ khác nhau, biểu diễn dữ liệu khác nhau, có lỗi xảy ra.
- **Cơ chế RPC** qua **client stub** và **server stub** [tr. 52](#p52)–[tr. 54](#p54):
  1. Client gọi thủ tục, vd \`add(i,j)\`.
  2. Client stub đóng gói thông điệp: tên thủ tục và tham số. Bước này gọi là **marshalling**.
  3. Thông điệp được gửi qua mạng.
  4. HĐH phía server chuyển thông điệp cho server stub.
  5. Server stub mở gói.
  6. Server stub gọi cục bộ hàm \`add\`.
  - Kết quả trả về theo chiều ngược lại.
- **Truyền tham số** [tr. 55](#p55)–[tr. 57](#p57):
  - **Tham trị**: lệch do biểu diễn dữ liệu khác nhau, vd **little endian (Intel) vs big endian (SPARC)**.
  - **Tham chiếu**: không dùng được trực tiếp vì bộ nhớ phân tán. Thay bằng **copy/restore**, nhưng tốn băng thông và khó với dữ liệu có cấu trúc.
  - Hai bên cần thống nhất định dạng thông điệp, cách biểu diễn dữ liệu, kiểu trao đổi, và cài đặt stub.
- **Tính mở của RPC**: dùng **IDL** để mô tả giao diện trung lập, không phụ thuộc ngôn ngữ [tr. 58](#p58).
- **Các mô hình RPC** [tr. 59](#p59):
  - **Synchronous**: client chờ kết quả.
  - **Nowait**: không chờ, reply void.
  - **Callback**: server gọi lại client.
  - **Batch**: gom nhiều lời gọi không chờ, chờ ở lời gọi cuối.
- **DCE RPC** (Open Group) [tr. 61](#p61)–[tr. 64](#p64):
  - Tầng middleware client–server có các dịch vụ file phân tán, thư mục, thời gian.
  - Trên Windows: viết IDL → trình biên dịch **MIDL** sinh stub → viết client/server → liên kết với RPC runtime.
- **RMI (Remote Method Invocation)** [tr. 65](#p65)–[tr. 71](#p71):
  - Giống RPC: lập trình theo giao diện, dựa trên request/reply, có mức trong suốt.
  - Khác RPC: khai thác được OOP, truyền **tham chiếu đối tượng** bằng định danh duy nhất.
  - Vấn đề cần giải quyết: định vị đối tượng từ xa, trao đổi thông tin, gọi phương thức.
  - Kiến trúc: Application → **Stub** (client) / **Skeleton** (server) → **Remote Reference Layer** → Transport.
  - Ưu: đơn giản, trong suốt, tin cậy, an toàn nhờ JVM. Nhược: **chỉ dùng cho Java**.

## 5. Trao đổi thông tin hướng thông điệp
- **Tạm thời (transient)** – Berkeley socket [tr. 73](#p73)–[tr. 91](#p91):
  - \`socket()\` tạo socket.
  - \`connect()\` (client) khởi động bắt tay 3 bước. Lỗi có thể gặp: \`ETIMEDOUT\` (không có trả lời sau 75 s), \`ECONNREFUSED\` (nhận RST, không có tiến trình nghe), \`EHOSTUNREACH\`/\`ENETUNREACH\` (ICMP unreachable).
  - \`bind()\` gán địa chỉ local. Client không cần bind trước connect vì kernel tự chọn ephemeral port.
  - \`listen(sockfd, backlog)\` chuyển socket sang **passive** (CLOSED → LISTEN). \`backlog\` là số kết nối tối đa trong **2 hàng đợi**: incomplete và completed.
  - \`accept()\` lấy kết nối đã hoàn tất ở đầu hàng đợi. Nếu hàng đợi rỗng, tiến trình **ngủ**.
  - **Concurrent server** dùng \`fork()\`: gọi một lần, **trả về hai lần** (0 ở con, PID con ở cha). Sau fork, cha đóng connected socket, con đóng listening socket. Nếu cha không close, reference count còn 1 và **kết nối không đóng được**.
  - **MPI**: các hàm truyền thông điệp cho tính toán song song [tr. 92](#p92).
- **Bền vững (persistent)** – **MOM (Message-Oriented Middleware)** [tr. 93](#p93)–[tr. 98](#p98):
  - Hệ thống **hàng đợi thông điệp**, giao tiếp **không đồng bộ, bền vững**, có lưu trữ trung gian, chấp nhận độ trễ cao. Ví dụ email.
  - Định địa chỉ mức hàng đợi ánh xạ sang mức mạng. Có router chuyển tiếp thông điệp.
  - **Message broker** chuyển đổi định dạng giữa các ứng dụng. Ví dụ **RabbitMQ**.

## 6. Trao đổi thông tin hướng dòng (stream)
- Phương tiện truyền thông có loại **liên tục** (audio, video) và **rời rạc** [tr. 100](#p100).
- **Dòng dữ liệu** là chuỗi đơn vị dữ liệu liên tục [tr. 101](#p101).
  - 3 chế độ truyền:
    - **Không đồng bộ**: không ràng buộc thời gian.
    - **Đồng bộ**: có độ trễ tối đa.
    - **Đẳng thời (isochronous)**: có cả độ trễ tối đa lẫn tối thiểu.
  - Dòng đơn hoặc dòng phức.
  - Vấn đề: nén, kiểm soát chất lượng, đồng bộ.
- Đa phương tiện [tr. 103](#p103)–[tr. 105](#p105):
  - Streaming lưu trữ: phát phần đầu trong khi server còn gửi phần sau.
  - Có tương tác kiểu VCR: chấp nhận trễ ban đầu 10 s, lệnh có hiệu lực sau 1–2 s.
  - Thời gian thực tương tác (IP telephony, hội nghị video): độ trễ audio **< 150 ms tốt, < 400 ms chấp nhận được**.
- Nén [tr. 106](#p106)–[tr. 107](#p107):
  - Audio: điện thoại 8000 mẫu/s × 8 bit = **64 kbps**. CD 1,411 Mbps. MP3 96–160 kbps.
  - Video: dư thừa không gian và thời gian. MPEG1 1,5 Mbps, MPEG2 3–6 Mbps, MPEG4 dưới 1 Mbps.
- **QoS**: bit-rate, delay, e2e delay, **jitter**, round-trip delay. IP chỉ là best-effort [tr. 108](#p108).
  - Cách thực thi: **Differentiated services**, **bộ đệm để giảm jitter**, **FEC**, **interleaved transmission** [tr. 109](#p109)–[tr. 111](#p111).
- **Đồng bộ dòng** [tr. 113](#p113)–[tr. 117](#p117):
  - Hai kiểu: dòng rời rạc với dòng liên tục, hoặc hai dòng liên tục (vd **lip sync** giữa tiếng và hình).
  - Đồng bộ ở mức đơn vị dữ liệu, hoặc qua giao diện mức cao.`,keyConcepts:[{term:`Tiến trình`,definition:`Chương trình đang hoạt động, có virtual processor và virtual memory riêng; tạo và chuyển ngữ cảnh tốn kém.`,pages:[5],source:`slide`},{term:`Luồng (thread)`,definition:`Luồng thực thi trong tiến trình, dùng chung môi trường tiến trình, trao đổi qua biến chia sẻ.`,pages:[6],source:`slide`},{term:`Blocking system call`,definition:`Lời gọi hệ thống làm dừng luồng/tiến trình gọi cho tới khi xong (vd I/O).`,pages:[7,17],source:`slide`},{term:`Luồng mức user vs mức nhân`,definition:`User: rẻ nhưng một I/O block cả tiến trình; nhân: không bị vậy nhưng tốn kém.`,pages:[8],source:`slide`},{term:`LWP trong Linux`,definition:`Lightweight process mức kernel; luồng POSIX (pthread) ánh xạ 1-1 với LWP; dùng clone() thay fork().`,pages:[9,10],source:`slide`},{term:`Dispatcher/worker`,definition:`Mô hình server đa luồng: dispatcher nhận yêu cầu, giao cho worker xử lý.`,pages:[14],source:`slide`},{term:`Thread-per-request / per-connection / per-object`,definition:`Ba cách gán luồng trong server đa luồng.`,pages:[15],source:`slide`},{term:`Máy trạng thái hữu hạn (FSM server)`,definition:`Server đơn luồng, xếp hàng yêu cầu, dùng lời gọi không dừng; bất đồng bộ, hướng sự kiện (vd Node.js).`,pages:[16],source:`slide`},{term:`Server lặp vs đồng thời`,definition:`Lặp: tự xử lý từng yêu cầu; đồng thời: chuyển yêu cầu cho luồng/tiến trình khác.`,pages:[18],source:`slide`},{term:`Superserver / inetd`,definition:`Tiến trình lắng nghe nhiều port, khởi chạy dịch vụ tương ứng khi có yêu cầu; cấu hình /etc/inetd.conf.`,pages:[18,19],source:`slide`},{term:`Stateless vs stateful server`,definition:`Stateless không lưu thông tin về client giữa các yêu cầu; stateful có lưu.`,pages:[18],source:`slide`},{term:`X Window`,definition:`Giải pháp thin-client: X-server điều khiển màn hình ở máy người dùng, X-client là ứng dụng.`,pages:[23,24],source:`slide`},{term:`Socket`,definition:`Điểm cuối giao tiếp = địa chỉ IP + port.`,pages:[28],source:`slide`},{term:`UDP`,definition:`Không hướng kết nối, không tin cậy, không đồng bộ; send không dừng, receive dừng.`,pages:[37],source:`slide`},{term:`TCP 3-way handshake`,definition:`SYN → SYNACK → ACK để thiết lập kết nối.`,pages:[40,76],source:`slide`},{term:`Đóng kết nối TCP`,definition:`FIN/ACK hai chiều; bên đóng trước vào trạng thái timed wait; bên nào cũng có thể chủ động đóng.`,pages:[41],source:`slide`},{term:`Giao thức yêu cầu–trả lời`,definition:`Hai thông báo gửi/nhận liên tiếp, đồng bộ, tin cậy, không cần báo nhận và kiểm soát luồng; doOperation/getRequest/sendReply.`,pages:[45,46,47],source:`slide`},{term:`RPC`,definition:`Remote Procedure Call – gọi thủ tục trên máy khác trong suốt như gọi cục bộ.`,pages:[50,51],source:`slide`},{term:`Client stub / server stub`,definition:`Stub phía client đóng gói tham số (marshalling) gửi đi; stub phía server mở gói và gọi thủ tục thật.`,pages:[52],source:`slide`},{term:`Marshalling`,definition:`Đóng gói tên thủ tục và tham số thành thông điệp để truyền qua mạng.`,pages:[52],source:`bổ sung`},{term:`Little endian vs big endian`,definition:`Thứ tự byte khác nhau (Intel vs SPARC) gây sai lệch khi truyền tham trị.`,pages:[56],source:`slide`},{term:`Copy/restore`,definition:`Thay truyền tham chiếu bằng sao chép dữ liệu đi và chép kết quả về; tốn băng thông.`,pages:[55],source:`slide`},{term:`IDL trong RPC`,definition:`Ngôn ngữ mô tả giao diện trung lập giúp client, server từ nhà sản xuất khác nhau phối hợp.`,pages:[58],source:`slide`},{term:`Synchronous / nowait / callback / batch RPC`,definition:`Chờ kết quả; không chờ; server gọi lại client; gom nhiều lời gọi không chờ.`,pages:[59],source:`slide`},{term:`DCE RPC`,definition:`Middleware của Open Group dựa trên RPC; dịch vụ file phân tán, thư mục, thời gian.`,pages:[61],source:`slide`},{term:`RMI`,definition:`Remote Method Invocation của Java – gọi phương thức đối tượng từ xa, truyền tham chiếu đối tượng; chỉ dùng cho Java.`,pages:[65,69],source:`slide`},{term:`Stub / skeleton / remote reference layer`,definition:`Kiến trúc RMI: stub phía client, skeleton phía server, lớp tham chiếu từ xa, tầng transport.`,pages:[70],source:`slide`},{term:`Berkeley sockets`,definition:`API truyền thông điệp tạm thời: socket, bind, listen, accept, connect, close.`,pages:[73,74],source:`slide`},{term:`listen backlog`,definition:`Số kết nối tối đa kernel xếp hàng (incomplete + completed queue) cho listening socket.`,pages:[79,80],source:`slide`},{term:`fork()`,definition:`Gọi một lần trả về hai lần: 0 ở tiến trình con, PID con ở tiến trình cha; dùng cho concurrent server.`,pages:[84,86],source:`slide`},{term:`MPI`,definition:`Message-Passing Interface – các hàm truyền thông điệp cho tính toán song song.`,pages:[92],source:`slide`},{term:`MOM`,definition:`Message-Oriented Middleware – hệ thống hàng đợi thông điệp, giao tiếp không đồng bộ bền vững.`,pages:[93],source:`slide`},{term:`Message broker`,definition:`Thành phần chuyển đổi/định tuyến thông điệp giữa ứng dụng; vd RabbitMQ.`,pages:[97,98],source:`slide`},{term:`Dòng dữ liệu (stream)`,definition:`Chuỗi đơn vị dữ liệu liên tục; truyền không đồng bộ, đồng bộ, đẳng thời.`,pages:[101],source:`slide`},{term:`Isochronous transmission`,definition:`Truyền đẳng thời: ràng buộc cả độ trễ tối đa và tối thiểu.`,pages:[101],source:`slide`},{term:`QoS`,definition:`Chất lượng dịch vụ: bit-rate, delay, e2e delay, jitter, round-trip delay.`,pages:[108],source:`slide`},{term:`Jitter`,definition:`Độ biến thiên độ trễ giữa các gói; giảm bằng bộ đệm.`,pages:[108,110],source:`slide`},{term:`FEC / interleaving`,definition:`Forward error correction và truyền đan xen để giảm ảnh hưởng mất gói.`,pages:[111],source:`slide`},{term:`Lip synchronization`,definition:`Đồng bộ hai dòng liên tục âm thanh và hình ảnh.`,pages:[114],source:`slide`}],codeExamples:[{title:`UDP echo server và client (Java)`,language:`java`,code:`// UDPServer
DatagramSocket aSocket = new DatagramSocket(6789);
byte[] buffer = new byte[1000];
while (true) {
    DatagramPacket request = new DatagramPacket(buffer, buffer.length);
    aSocket.receive(request);                      // dừng chờ
    DatagramPacket reply = new DatagramPacket(request.getData(),
        request.getLength(), request.getAddress(), request.getPort());
    aSocket.send(reply);                           // không dừng
}

// UDPClient
DatagramSocket s = new DatagramSocket();
byte[] m = args[0].getBytes();
InetAddress aHost = InetAddress.getByName(args[1]);
s.send(new DatagramPacket(m, m.length, aHost, 6789));
DatagramPacket reply = new DatagramPacket(new byte[1000], 1000);
s.receive(reply);
System.out.println("Reply: " + new String(reply.getData()));`,explanation:`Không có kết nối: mỗi gói mang địa chỉ đích. Server trả lại đúng nội dung tới địa chỉ/port của người gửi.`,parts:[{lines:`2-3`,note:`Socket gắn port 6789, buffer 1000 byte giới hạn kích cỡ thông điệp.`},{lines:`6`,note:`receive là thao tác dừng.`},{lines:`7-9`,note:`Lấy địa chỉ, port người gửi từ gói nhận được để trả lời.`},{lines:`13-16`,note:`Client: socket port tuỳ ý, phân giải tên máy, gửi gói.`},{lines:`17-19`,note:`Chờ trả lời (có thể treo mãi nếu gói mất – cần timeout).`}],pages:[38,39],source:`slide`},{title:`TCP echo server đa luồng (Java)`,language:`java`,code:`ServerSocket listenSocket = new ServerSocket(7896);
while (true) {
    Socket clientSocket = listenSocket.accept();   // chờ kết nối
    new Connection(clientSocket);                  // mỗi kết nối một luồng
}

class Connection extends Thread {
    DataInputStream in; DataOutputStream out; Socket clientSocket;
    public Connection(Socket s) throws IOException {
        clientSocket = s;
        in = new DataInputStream(s.getInputStream());
        out = new DataOutputStream(s.getOutputStream());
        this.start();
    }
    public void run() {
        try {
            String data = in.readUTF();
            out.writeUTF(data);                    // echo
        } catch (IOException e) { /* ... */ }
        finally { try { clientSocket.close(); } catch (IOException e) {} }
    }
}`,explanation:`Mô hình thread-per-connection: luồng chính chỉ accept, mỗi kết nối được xử lý bởi một luồng Connection riêng.`,parts:[{lines:`1`,note:`ServerSocket nghe port 7896.`},{lines:`3-4`,note:`accept trả về socket cho kết nối mới và tạo luồng xử lý.`},{lines:`9-14`,note:`Lấy stream vào/ra, start() chạy run() ở luồng mới.`},{lines:`17-18`,note:`Đọc chuỗi UTF và gửi lại.`},{lines:`20`,note:`Luôn đóng socket.`}],pages:[42],source:`slide`},{title:`Concurrent server dùng fork() (C)`,language:`c`,code:`listenfd = socket(AF_INET, SOCK_STREAM, 0);
bind(listenfd, (struct sockaddr *) &servaddr, sizeof(servaddr));
listen(listenfd, LISTENQ);
for ( ; ; ) {
    connfd = accept(listenfd, NULL, NULL);   /* ngủ nếu hàng đợi rỗng */
    if ( (pid = fork()) == 0) {              /* tiến trình con */
        close(listenfd);                     /* con đóng listening socket */
        doit(connfd);                        /* xử lý client */
        close(connfd);
        exit(0);
    }
    close(connfd);                           /* cha đóng connected socket */
}`,explanation:`Mỗi client được một tiến trình con phục vụ. Nếu cha không close(connfd), reference count không về 0 và kết nối TCP không bao giờ kết thúc.`,parts:[{lines:`1-3`,note:`socket → bind → listen: socket chuyển sang trạng thái LISTEN.`},{lines:`5`,note:`accept lấy kết nối đã hoàn tất từ completed queue.`},{lines:`6`,note:`fork trả 0 trong con.`},{lines:`7-10`,note:`Con chỉ giữ connfd.`},{lines:`12`,note:`Cha chỉ giữ listenfd để accept tiếp.`}],pages:[78,82,86,91],source:`bổ sung`}],figures:[{page:15,caption:`Ba mô hình server đa luồng`},{page:17,caption:`So sánh đa luồng, đơn luồng, FSM`},{page:40,caption:`Bắt tay 3 bước TCP`},{page:52,caption:`Cơ chế RPC qua client stub và server stub`},{page:59,caption:`Các mô hình RPC: synchronous, nowait, callback, batch`},{page:70,caption:`Kiến trúc RMI`},{page:81,caption:`Hai hàng đợi của listening socket`},{page:94,caption:`Mô hình hàng đợi thông điệp`}],flashcards:[{id:`fc-01`,front:`Tiến trình là gì?`,back:`Chương trình đang hoạt động, có virtual processor và virtual memory riêng.`,pages:[5],source:`slide`},{id:`fc-02`,front:`Các luồng trong một tiến trình trao đổi thông tin bằng gì?`,back:`Biến chia sẻ (dùng chung môi trường của tiến trình).`,pages:[6],source:`slide`},{id:`fc-03`,front:`Nhược điểm của luồng mức người dùng?`,back:`Một thao tác I/O (blocking) sẽ block cả tiến trình.`,pages:[8],source:`slide`},{id:`fc-04`,front:`Linux tạo luồng/tiến trình nhẹ bằng hàm nào?`,back:`clone() thay vì fork(); luồng pthread ánh xạ 1-1 với LWP.`,pages:[10],source:`slide`},{id:`fc-05`,front:`3 mô hình server đa luồng?`,back:`Thread-per-request, thread-per-connection, thread-per-object.`,pages:[15],source:`slide`},{id:`fc-06`,front:`Đặc điểm của server máy trạng thái hữu hạn?`,back:`Đơn luồng, xếp hàng yêu cầu, lời gọi không dừng, hướng sự kiện (vd Node.js).`,pages:[16],source:`slide`},{id:`fc-07`,front:`So sánh đa luồng, đơn luồng, FSM?`,back:`Đa luồng: song song + blocking; đơn luồng: không song song + blocking; FSM: song song + non-blocking.`,pages:[17],source:`slide`},{id:`fc-08`,front:`inetd là gì? Cấu hình ở đâu?`,back:`Superserver khởi chạy dịch vụ theo yêu cầu; /etc/inetd.conf (port trong /etc/services).`,pages:[19,21],source:`slide`},{id:`fc-09`,front:`Vì sao cần client đa luồng?`,back:`Tách UI và xử lý, tránh chờ nhau, tăng tốc khi làm việc với nhiều server (vd tải trang web).`,pages:[22],source:`slide`},{id:`fc-10`,front:`Socket gồm những gì?`,back:`Địa chỉ IP + số port.`,pages:[28],source:`slide`},{id:`fc-11`,front:`Đặc điểm UDP?`,back:`Không hướng kết nối, không tin cậy, không đồng bộ.`,pages:[37],source:`slide`},{id:`fc-12`,front:`Trong UDP Java, thao tác nào dừng, thao tác nào không?`,back:`send không dừng; receive dừng.`,pages:[37],source:`slide`},{id:`fc-13`,front:`3 bước bắt tay TCP?`,back:`SYN → SYNACK → ACK.`,pages:[40],source:`slide`},{id:`fc-14`,front:`Đặc điểm giao thức yêu cầu–trả lời?`,back:`Đồng bộ, tin cậy, không cần báo nhận và kiểm soát luồng riêng.`,pages:[45,46],source:`slide`},{id:`fc-15`,front:`3 thủ tục của giao thức yêu cầu–trả lời?`,back:`doOperation, getRequest, sendReply.`,pages:[47],source:`slide`},{id:`fc-16`,front:`Vấn đề chính của RPC?`,back:`Hệ thống không đồng nhất, không gian nhớ khác nhau, biểu diễn dữ liệu khác nhau, lỗi.`,pages:[51],source:`slide`},{id:`fc-17`,front:`Thứ tự 6 bước đầu của RPC?`,back:`Client gọi → stub đóng gói → gửi qua mạng → OS server giao stub → stub mở gói → stub gọi hàm cục bộ.`,pages:[52],source:`slide`},{id:`fc-18`,front:`Vì sao truyền tham chiếu khó trong RPC?`,back:`Bộ nhớ phân tán – con trỏ không có nghĩa ở máy khác; dùng copy/restore (tốn băng thông).`,pages:[55],source:`slide`},{id:`fc-19`,front:`Ví dụ sai lệch khi truyền tham trị?`,back:`Little endian (Intel) vs big endian (SPARC).`,pages:[56],source:`slide`},{id:`fc-20`,front:`4 mô hình RPC?`,back:`Synchronous, nowait, callback, batch.`,pages:[59],source:`slide`},{id:`fc-21`,front:`Các bước xây dựng RPC trên Windows?`,back:`Viết IDL/ACF → MIDL sinh stub → viết client, server → liên kết với RPC runtime.`,pages:[64],source:`slide`},{id:`fc-22`,front:`RMI khác RPC ở điểm nào?`,back:`Hướng đối tượng, truyền tham chiếu đối tượng bằng định danh duy nhất.`,pages:[65],source:`slide`},{id:`fc-23`,front:`Kiến trúc RMI gồm những tầng nào?`,back:`Stub/Skeleton, Remote Reference Layer, Transport.`,pages:[70],source:`slide`},{id:`fc-24`,front:`Nhược điểm của RMI?`,back:`Chỉ dùng cho Java.`,pages:[69],source:`slide`},{id:`fc-25`,front:`listen() làm gì?`,back:`Chuyển socket thành passive (CLOSED → LISTEN); backlog = số kết nối tối đa xếp hàng.`,pages:[79,80],source:`slide`},{id:`fc-26`,front:`accept() khi hàng đợi kết nối rỗng thì sao?`,back:`Tiến trình bị cho ngủ (sleep).`,pages:[82],source:`slide`},{id:`fc-27`,front:`fork() trả về gì?`,back:`0 trong con, PID của con trong cha, -1 nếu lỗi – gọi một lần, trả về hai lần.`,pages:[84],source:`slide`},{id:`fc-28`,front:`Vì sao cha phải close(connfd) sau fork?`,back:`Nếu không, reference count còn 1 và kết nối TCP không bao giờ đóng.`,pages:[91],source:`slide`},{id:`fc-29`,front:`MOM là gì?`,back:`Message-Oriented Middleware – hàng đợi thông điệp, giao tiếp không đồng bộ, bền vững.`,pages:[93],source:`slide`},{id:`fc-30`,front:`Truyền đẳng thời (isochronous) là gì?`,back:`Có ràng buộc cả độ trễ tối đa và tối thiểu giữa các đơn vị dữ liệu.`,pages:[101],source:`slide`}],quiz:[{id:`q-01`,level:`hiểu`,question:`Vì sao luồng cài đặt hoàn toàn ở chế độ người dùng có nhược điểm khi gặp thao tác vào/ra?`,options:[`Vì không chia sẻ được biến`,`Vì một lời gọi I/O blocking làm dừng cả tiến trình`,`Vì tốn bộ nhớ nhân`,`Vì không tạo được luồng mới`],answer:1,explanation:`Chế độ NSD: có thao tác vào ra → block cả tiến trình; chế độ nhân thì tốn kém.`,pages:[8],source:`slide`},{id:`q-02`,level:`nhớ`,question:`Trong Linux, luồng mức user (pthread) ánh xạ thế nào với LWP?`,options:[`n-1`,`1-n`,`1-1`,`Không ánh xạ`],answer:2,explanation:`Ánh xạ 1-1 từ mỗi thread và 1 LWP; dùng clone() thay fork().`,pages:[10],source:`slide`},{id:`q-03`,level:`hiểu`,question:`Mô hình server nào đạt song song với lời gọi hệ thống không dừng?`,options:[`Đa luồng`,`Đơn luồng`,`Máy trạng thái hữu hạn`,`Server lặp`],answer:2,explanation:`Bảng so sánh: FSM – song song, lời gọi hệ thống không dừng.`,pages:[17],source:`slide`},{id:`q-04`,level:`vận dụng`,question:`Một web server tạo một luồng mới cho mỗi kết nối TCP và luồng đó phục vụ mọi request trên kết nối đó. Đây là mô hình?`,options:[`Thread-per-request`,`Thread-per-connection`,`Thread-per-object`,`FSM`],answer:1,explanation:`Mỗi kết nối một luồng – thread-per-connection (như TCPServer với lớp Connection).`,pages:[15,42],source:`slide`},{id:`q-05`,level:`nhớ`,question:`Đặc điểm nào đúng với UDP?`,options:[`Hướng kết nối, tin cậy`,`Không hướng kết nối, không tin cậy, không đồng bộ`,`Bắt tay 3 bước`,`Đảm bảo thứ tự gói`],answer:1,explanation:`UDP: không hướng kết nối, không tin cậy, không đồng bộ.`,pages:[37],source:`slide`},{id:`q-06`,level:`vận dụng`,question:`UDPClient gửi gói nhưng gói bị mất trên đường. Điều gì xảy ra với lời gọi aSocket.receive(reply)?`,options:[`Ném ngoại lệ ngay`,`Trả về gói rỗng`,`Bị dừng chờ mãi (cần đặt timeout)`,`Tự gửi lại gói`],answer:2,explanation:`receive là thao tác dừng; UDP không tin cậy nên phải xử lý timeout.`,pages:[37,39],source:`slide`},{id:`q-07`,level:`nhớ`,question:`Thứ tự bắt tay 3 bước của TCP?`,options:[`ACK → SYN → SYNACK`,`SYN → ACK → FIN`,`SYN → SYNACK → ACK`,`FIN → ACK → SYN`],answer:2,explanation:`A gửi SYN, B trả SYNACK, A trả ACK (có thể kèm dữ liệu).`,pages:[40,76],source:`slide`},{id:`q-08`,level:`hiểu`,question:`Giao thức yêu cầu–trả lời không cần cơ chế nào?`,options:[`Gửi request`,`Định danh request (requestId)`,`Báo nhận riêng và kiểm soát luồng`,`Gửi reply`],answer:2,explanation:`Đặc điểm: không cần báo nhận, không cần kiểm soát luồng – reply chính là báo nhận.`,pages:[46],source:`slide`},{id:`q-09`,level:`hiểu`,question:`Trong cơ chế RPC, ai đóng gói tên thủ tục và tham số thành thông điệp?`,options:[`Server stub`,`Client stub`,`Hệ điều hành server`,`Thủ tục add trên server`],answer:1,explanation:`Bước 2: Stub builds message (client stub).`,pages:[52],source:`slide`},{id:`q-10`,level:`vận dụng`,question:`Client Intel gửi số nguyên 1 (0x00000001) cho server SPARC qua RPC mà không chuyển đổi. Server có thể đọc được giá trị nào?`,options:[`1`,`16777216 (0x01000000)`,`-1`,`0`],answer:1,explanation:`Little endian vs big endian đảo thứ tự byte: 01 00 00 00 được đọc thành 0x01000000. Vì vậy hai bên phải thống nhất biểu diễn dữ liệu.`,pages:[56,57],source:`slide`},{id:`q-11`,level:`hiểu`,question:`Giải pháp thay cho truyền tham chiếu trong RPC và nhược điểm của nó?`,options:[`Dùng con trỏ toàn cục – không an toàn`,`Copy/restore – tốn băng thông`,`Bỏ tham số – mất chức năng`,`Dùng UDP – không tin cậy`],answer:1,explanation:`Tham chiếu thay bằng copy/restore; vấn đề: tốn băng thông, khó với dữ liệu có cấu trúc.`,pages:[55],source:`slide`},{id:`q-12`,level:`hiểu`,question:`Trong mô hình batch RPC, client chờ kết quả khi nào?`,options:[`Sau mỗi lời gọi`,`Không bao giờ`,`Chỉ ở lời gọi cuối cùng của lô`,`Khi server callback`],answer:2,explanation:`Batch: các lời gọi sub1, sub2 nhận void reply, chỉ sub3 trả kết quả.`,pages:[59],source:`slide`},{id:`q-13`,level:`nhớ`,question:`Thành phần phía server trong kiến trúc RMI tương ứng với stub phía client là?`,options:[`Skeleton`,`Proxy`,`Broker`,`Daemon`],answer:0,explanation:`Client: Stubs; Server: Skeletons; dưới là Remote Reference Layer và Transport.`,pages:[70],source:`slide`},{id:`q-14`,level:`hiểu`,question:`Nhược điểm chính của RMI so với RPC/CORBA?`,options:[`Không trong suốt`,`Không hỗ trợ đối tượng`,`Chỉ dùng cho Java`,`Không dựa trên request/reply`],answer:2,explanation:`Nhược điểm: chỉ dùng cho Java.`,pages:[69],source:`slide`},{id:`q-15`,level:`vận dụng`,question:`TCP client gọi connect() tới một host có tồn tại nhưng không có tiến trình nào lắng nghe ở port đó. Lỗi trả về?`,options:[`ETIMEDOUT`,`EHOSTUNREACH`,`ECONNREFUSED`,`Thành công`],answer:2,explanation:`Server trả RST → không có tiến trình chờ kết nối ở port → ECONNREFUSED.`,pages:[77],source:`slide`},{id:`q-16`,level:`vận dụng`,question:`Đoạn code concurrent server sau có lỗi gì?`,code:{language:`c`,code:`for ( ; ; ) {
  connfd = accept(listenfd, NULL, NULL);
  if ((pid = fork()) == 0) {
    close(listenfd);
    doit(connfd);
    close(connfd);
    exit(0);
  }
  /* cha không làm gì */
}`},options:[`Con không được đóng listenfd`,`Cha không close(connfd) nên kết nối không bao giờ kết thúc và cha rò rỉ descriptor`,`Phải gọi bind trong vòng lặp`,`fork trả PID trong con`],answer:1,explanation:`Nếu cha không đóng connected socket, reference count còn 1 sau khi con đóng → TCP không thực hiện kết thúc kết nối.`,pages:[90,91],source:`slide`},{id:`q-17`,level:`hiểu`,question:`Đặc điểm của trao đổi thông tin hướng thông điệp bền vững (MOM)?`,options:[`Đồng bộ, không lưu trữ trung gian`,`Không đồng bộ, có lưu trữ trung gian, chấp nhận trễ cao`,`Chỉ dùng cho streaming`,`Yêu cầu hai bên cùng hoạt động`],answer:1,explanation:`MOM: hàng đợi thông điệp, không đồng bộ bền vững, lưu trữ trung gian, chấp nhận độ trễ cao (vd email).`,pages:[93],source:`slide`},{id:`q-18`,level:`vận dụng`,question:`Âm thanh điện thoại lấy 8000 mẫu/giây, mỗi mẫu lượng tử hoá 256 mức. Bit-rate?`,options:[`8 kbps`,`256 kbps`,`64 kbps`,`1,411 Mbps`],answer:2,explanation:`256 mức = 8 bit; 8000 × 8 = 64 000 bps.`,pages:[106],source:`slide`},{id:`q-19`,level:`hiểu`,question:`Biện pháp nào giảm jitter khi phát dòng đa phương tiện?`,options:[`Tăng kích thước gói`,`Dùng bộ đệm phía nhận`,`Bỏ nén`,`Dùng TCP handshake`],answer:1,explanation:`Thực thi QoS: sử dụng bộ đệm để giảm jitter.`,pages:[110],source:`slide`},{id:`q-20`,level:`hiểu`,question:`Truyền đẳng thời (isochronous) khác truyền đồng bộ ở điểm nào?`,options:[`Không ràng buộc thời gian`,`Ràng buộc cả độ trễ tối đa lẫn tối thiểu`,`Chỉ có độ trễ tối thiểu`,`Không dùng cho audio`],answer:1,explanation:`Đồng bộ: có trễ tối đa; đẳng thời: có cả trễ tối đa và tối thiểu (kiến thức chuẩn, slide liệt kê 3 chế độ).`,pages:[101],source:`bổ sung`}],examQuestions:[{id:`ex-01`,question:`Phân biệt tiến trình và luồng. So sánh ba mô hình tổ chức server: đa luồng, đơn luồng và máy trạng thái hữu hạn; nêu ví dụ thực tế cho mô hình FSM.`,hints:`- Tiến trình, luồng, chi phí [tr. 5](#p5)–[tr. 7](#p7).
- Dispatcher/worker, thread-per-request/connection/object [tr. 14](#p14)–[tr. 15](#p15).
- FSM: đơn luồng, non-blocking, Node.js [tr. 16](#p16); bảng so sánh [tr. 17](#p17).`,pages:[5,6,15,16,17],source:`slide`},{id:`ex-02`,question:`Trình bày cơ chế RPC qua client stub và server stub. Phân tích các vấn đề khi truyền tham số (tham trị, tham chiếu) và giải pháp.`,hints:`- Khái niệm, vấn đề không đồng nhất [tr. 51](#p51).
- 6 bước + chiều trả về [tr. 52](#p52).
- Tham trị: endian [tr. 56](#p56); tham chiếu: copy/restore [tr. 55](#p55).
- Thống nhất đặc tả, IDL [tr. 57](#p57)–[tr. 58](#p58).
- Các mô hình RPC [tr. 59](#p59).`,pages:[51,52,55,56,57,59],source:`slide`},{id:`ex-03`,question:`So sánh RPC và RMI. Trình bày kiến trúc của Java RMI.`,hints:`- Giống/khác [tr. 65](#p65); vấn đề cần giải quyết [tr. 66](#p66).
- Ưu nhược [tr. 69](#p69).
- Stub, skeleton, remote reference layer, transport [tr. 70](#p70).`,pages:[65,66,69,70],source:`slide`},{id:`ex-04`,question:`Mô tả trình tự các lời gọi Berkeley socket phía TCP server và client. Giải thích cách xây dựng concurrent server bằng fork() và vì sao tiến trình cha phải đóng connected socket.`,hints:`- Server: socket → bind → listen → accept; client: socket → connect [tr. 74](#p74)–[tr. 82](#p82).
- 3-way handshake, lỗi connect [tr. 76](#p76)–[tr. 77](#p77); backlog và 2 hàng đợi [tr. 80](#p80).
- fork trả hai lần [tr. 84](#p84); trạng thái trước/sau fork [tr. 86](#p86)–[tr. 90](#p90); close và reference count [tr. 91](#p91).`,pages:[74,79,82,84,86,91],source:`slide`},{id:`ex-05`,question:`So sánh trao đổi thông tin hướng thông điệp tạm thời và bền vững. Trình bày các yêu cầu QoS và kỹ thuật đảm bảo QoS trong trao đổi thông tin hướng dòng.`,hints:`- Tạm thời: socket, MPI [tr. 73](#p73), [tr. 92](#p92); bền vững: MOM, hàng đợi, broker, RabbitMQ [tr. 93](#p93)–[tr. 98](#p98).
- Dòng: không đồng bộ/đồng bộ/đẳng thời [tr. 101](#p101).
- QoS: bit-rate, delay, jitter [tr. 108](#p108); DiffServ, bộ đệm, FEC, interleaving [tr. 109](#p109)–[tr. 111](#p111); đồng bộ dòng [tr. 113](#p113).`,pages:[93,101,108,110,111,113],source:`slide`}]};export{e as default};