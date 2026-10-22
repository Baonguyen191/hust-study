var e={version:1,subject:`HPT`,lesson:`04-dongbohoa-vie`,title:`Chương 4 – Đồng bộ hoá (Synchronization)`,summary:`## Mở đầu [tr. 4](#p4)
- Hai nhu cầu đồng bộ:
  - Nhiều tiến trình **lần lượt** dùng tài nguyên chung.
  - Các tiến trình **thống nhất thứ tự sự kiện**.
- Hai hướng giải quyết: đồng bộ theo **giá trị thời gian thực** (đồng hồ vật lý) hoặc theo **thứ tự sự kiện** (đồng hồ logic).

## 1. Đồng bộ hoá đồng hồ vật lý
- **Ví dụ make** [tr. 7](#p7):
  - \`output.c\` được sửa lúc 2143 theo đồng hồ máy soạn thảo.
  - \`output.o\` đã tạo lúc 2144 theo đồng hồ máy biên dịch (đồng hồ chạy nhanh hơn).
  - make thấy .o "mới hơn" .c nên **không biên dịch lại**. Lỗi xảy ra do đồng hồ không đồng bộ.
- **GPS** [tr. 8](#p8)–[tr. 9](#p9): khó khăn vì tín hiệu bị trễ qua khí quyển và đồng hồ thiết bị thu không đồng bộ với vệ tinh.
- **Đồng hồ vật lý** gồm timer, counter và holding register, sinh ra clock tick. Thường dùng chip **RTC** [tr. 10](#p10).
  - Cần đồng bộ với **thời gian thật**, và đồng bộ các đồng hồ **với nhau**.
- **NTP (Network Time Protocol)** [tr. 12](#p12):
  - A gửi request lúc $T_1$, B nhận lúc $T_2$, B trả lời lúc $T_3$, A nhận lúc $T_4$.
  - Độ lệch: $\\theta = \\frac{(T_2 - T_1) + (T_3 - T_4)}{2}$.
  - Độ trễ ước lượng: $\\delta = \\frac{(T_4 - T_1) - (T_3 - T_2)}{2}$ (*bổ sung*).
- **Cristian's algorithm** [tr. 13](#p13). Slide để trống, *bổ sung*: client hỏi time server, nhận thời gian $T_{server}$ rồi đặt $T = T_{server} + RTT/2$.
- **Berkeley** [tr. 14](#p14)–[tr. 16](#p16):
  1. **Time daemon** chủ động gửi giá trị đồng hồ của mình cho các máy.
  2. Các máy trả lời độ lệch của mình.
  3. Daemon **tính trung bình** rồi gửi cho **từng máy lượng cần hiệu chỉnh**, kể cả chính nó.
  - Không cần nguồn thời gian chuẩn bên ngoài: các máy chỉ cần **thống nhất với nhau**.
- **Mạng không dây – RBS (Reference Broadcast Synchronization)** [tr. 17](#p17)–[tr. 18](#p18):
  - Một nút **quảng bá** thông điệp tham chiếu. Các **nút nhận** so sánh thời điểm nhận với nhau để tính độ lệch tương đối.
  - Bên gửi không tham gia, nên loại được độ trễ phía gửi khỏi tính toán.

## 2. Đồng bộ hoá đồng hồ logic
- **Quan hệ "xảy ra trước" (happens-before, →)** [tr. 21](#p21):
  1. a, b cùng tiến trình và a xảy ra trước b thì a → b.
  2. a là sự kiện gửi, b là sự kiện nhận cùng thông điệp thì a → b.
  - Quan hệ có tính **bắc cầu**.
  - Hai sự kiện **tương tranh (concurrent)**: không có a → b, cũng không có b → a.
- **Đồng hồ logic Lamport** [tr. 23](#p23)–[tr. 25](#p25):
  1. Trước mỗi sự kiện: $C_i \\leftarrow C_i + 1$.
  2. Khi gửi m: đặt $ts(m) = C_i$.
  3. Khi nhận m: $C_j \\leftarrow \\max\\{C_j, ts(m)\\}$, rồi mới chuyển lên ứng dụng. Sự kiện nhận cũng là một sự kiện nên được tăng theo bước 1.
  - Đảm bảo: a → b thì C(a) < C(b). **Chiều ngược lại không đúng**.
  - Ví dụ [tr. 25](#p25): P3 gửi m3 lúc 60, P2 nhận khi đồng hồ là 56 thì chỉnh lên **61**. P2 gửi m4 lúc 69, P1 nhận khi đồng hồ là 54 thì chỉnh lên **70**.
- **Ứng dụng: Totally Ordered Multicasting** [tr. 26](#p26):
  - Mọi bản sao xử lý các cập nhật theo **cùng một thứ tự toàn cục**, vd 2 cập nhật tài khoản ngân hàng ở 2 replica.
  - Cách làm: gán timestamp Lamport, xếp hàng đợi theo timestamp, gửi ACK cho mọi tiến trình. Một thông điệp chỉ được xử lý khi nằm đầu hàng đợi và đã được tất cả ACK.
- **Vector clock** [tr. 27](#p27)–[tr. 29](#p29). Mỗi $P_i$ giữ vector $VC_i$:
  - $VC_i[i]$: số sự kiện đã xảy ra ở $P_i$, tức đồng hồ logic cục bộ.
  - $VC_i[j] = k$: $P_i$ biết đã có k sự kiện xảy ra ở $P_j$.
  - Cập nhật:
    1. Trước mỗi sự kiện: $VC_i[i]{+}{+}$.
    2. Khi gửi: $ts(m) = VC_i$.
    3. Khi nhận: $VC_j[k] \\leftarrow \\max\\{VC_j[k], ts(m)[k]\\}$ với mọi k.
  - Vector clock **nắm bắt được quan hệ nhân quả**, điều mà Lamport không làm được.
- **Gửi theo nhân quả (causally ordered multicast)** [tr. 30](#p30). $P_j$ chỉ chuyển thông điệp m từ $P_i$ lên ứng dụng khi:
  1. $ts(m)[i] = VC_j[i] + 1$: m là thông điệp kế tiếp $P_j$ đang chờ từ $P_i$.
  2. $ts(m)[k] \\le VC_j[k]$ với mọi $k \\ne i$: $P_j$ đã thấy mọi thông điệp mà $P_i$ đã thấy trước khi gửi m.
  - Ví dụ: P2 nhận m* = (1,1,0) khi VC2 = (0,0,0) thì **phải hoãn**, vì chưa nhận m = (1,0,0) từ P0.

## 3. Loại trừ lẫn nhau (mutual exclusion)
- **Tập trung** [tr. 33](#p33)–[tr. 35](#p35):
  - Một **coordinator** cấp quyền. Tài nguyên rảnh thì trả OK. Đang bận thì **không trả lời** (hoặc từ chối) và xếp vào hàng đợi. Khi tài nguyên được trả, coordinator gửi OK cho tiến trình đầu hàng đợi.
  - Ưu: công bằng, đơn giản, chỉ **3 thông điệp** mỗi lần vào/ra.
  - Nhược: **điểm lỗi đơn**, nút cổ chai. Client không phân biệt được "coordinator chết" với "đang chờ".
- **Phân tán (Ricart–Agrawala)** [tr. 36](#p36)–[tr. 39](#p39):
  - Muốn vào thì **quảng bá request** kèm timestamp. Tiến trình nhận được:
    - Không dùng và không muốn dùng: trả **OK**.
    - Đang dùng: **không trả lời**, xếp hàng.
    - Cũng muốn dùng: **so sánh timestamp**. Timestamp nhỏ hơn thì thắng.
  - Chỉ vào khi nhận **đủ OK của tất cả** tiến trình khác. Tốn **2(n−1) thông điệp**.
  - Ví dụ: P0 (ts 8) và P2 (ts 12) cùng xin. P0 thắng và vào trước. Xong, P0 gửi OK cho P2.
  - Nhược (*bổ sung*): n điểm lỗi thay vì 1. Mọi tiến trình đều phải tham gia mọi quyết định.
- **Token Ring** [tr. 40](#p40)–[tr. 41](#p41):
  - Các tiến trình xếp thành **vòng logic**. P0 giữ token đầu tiên. Token chuyển từ $P_i$ sang $P_{(i+1) \\bmod N}$.
  - Nhận token: muốn dùng thì giữ, dùng xong chuyển đi. Không muốn thì chuyển ngay.
  - Vấn đề (*bổ sung*): **mất token** khó phát hiện, tiến trình chết làm đứt vòng.

## 4. Bầu chọn (election)
- **Bully** [tr. 44](#p44)–[tr. 46](#p46):
  - P phát hiện coordinator chết thì gửi **ELECTION** cho mọi tiến trình có **ID lớn hơn**.
  - Không ai trả lời (timeout) thì P **thắng**. Có ít nhất 1 trả lời (OK) thì P dừng.
  - Các tiến trình nhận ELECTION lặp lại quá trình. Cuối cùng tiến trình **ID lớn nhất còn sống** thắng và gửi COORDINATOR cho mọi người.
- **Ring** [tr. 47](#p47): thông điệp ELECTION đi vòng và **gom danh sách ID**. Khi quay về người khởi tạo, chọn ID lớn nhất rồi gửi COORDINATOR đi một vòng.
- **Mạng không dây** [tr. 48](#p48)–[tr. 50](#p50):
  - Nguồn (vd nút a) phát ELECTION. Mạng **xây cây** (build-tree phase).
  - Mỗi nút báo lên cha nút tốt nhất (vd pin/năng lực lớn nhất) trong cây con của nó. Nguồn chọn nút tốt nhất.
- **Mạng cỡ lớn – chọn superpeer** [tr. 51](#p51)–[tr. 52](#p52), yêu cầu:
  1. Nút thường truy cập superpeer với **độ trễ thấp**.
  2. Superpeer **phân bố đều** trong overlay.
  3. Có **tỷ lệ định trước** superpeer trên tổng số nút.
  4. Mỗi superpeer **không phục vụ quá nhiều** nút thường.`,keyConcepts:[{term:`Đồng bộ hoá trong HPT`,definition:`Đảm bảo truy cập tài nguyên chung lần lượt và thống nhất thứ tự sự kiện; dựa trên thời gian thực hoặc thứ tự sự kiện.`,pages:[4],source:`slide`},{term:`Clock skew (ví dụ make)`,definition:`Đồng hồ các máy lệch nhau khiến make không biên dịch lại file vừa sửa.`,pages:[7],source:`slide`},{term:`Đồng hồ vật lý`,definition:`Timer với counter và holding register sinh clock tick; chip RTC.`,pages:[10],source:`slide`},{term:`NTP`,definition:`Network Time Protocol: dùng T1..T4 để ước lượng độ lệch θ = ((T2−T1)+(T3−T4))/2 so với time server.`,pages:[12],source:`slide`},{term:`Cristian's algorithm`,definition:`Client hỏi time server, đặt đồng hồ = thời gian server + RTT/2.`,pages:[13],source:`bổ sung`},{term:`Berkeley algorithm`,definition:`Time daemon thu thập đồng hồ các máy, tính trung bình, gửi lượng hiệu chỉnh cho từng máy; không cần nguồn thời gian chuẩn.`,pages:[14,15,16],source:`slide`},{term:`RBS`,definition:`Reference Broadcast Synchronization: các nút nhận cùng một broadcast so sánh thời điểm nhận để đồng bộ với nhau; loại trễ phía gửi.`,pages:[18],source:`slide`},{term:`Happens-before (→)`,definition:`a → b nếu a trước b trong cùng tiến trình, hoặc a gửi và b nhận cùng thông điệp; có tính bắc cầu.`,pages:[21],source:`slide`},{term:`Sự kiện tương tranh`,definition:`a và b không có a → b lẫn b → a.`,pages:[21],source:`slide`},{term:`Đồng hồ logic Lamport`,definition:`C_i tăng trước mỗi sự kiện; gửi kèm ts(m) = C_i; nhận thì C_j = max(C_j, ts(m)) rồi tăng.`,pages:[23],source:`slide`},{term:`Tính chất đồng hồ Lamport`,definition:`a → b ⇒ C(a) < C(b), nhưng C(a) < C(b) không suy ra a → b.`,pages:[21,23],source:`bổ sung`},{term:`Totally ordered multicasting`,definition:`Mọi tiến trình nhận các thông điệp multicast theo cùng một thứ tự, dùng timestamp Lamport, hàng đợi và ACK.`,pages:[26],source:`slide`},{term:`Vector clock`,definition:`VC_i[i] = số sự kiện ở P_i; VC_i[j] = hiểu biết của P_i về số sự kiện ở P_j; nắm bắt quan hệ nhân quả.`,pages:[28,29],source:`slide`},{term:`Cập nhật vector clock`,definition:`Trước sự kiện VC_i[i]++; gửi ts(m)=VC_i; nhận VC_j[k] = max(VC_j[k], ts(m)[k]) với mọi k.`,pages:[29],source:`slide`},{term:`Causally ordered multicast`,definition:`Chỉ chuyển m từ P_i khi ts(m)[i] = VC_j[i]+1 và ts(m)[k] ≤ VC_j[k] với mọi k ≠ i.`,pages:[30],source:`slide`},{term:`Loại trừ lẫn nhau`,definition:`Đảm bảo tại một thời điểm chỉ một tiến trình dùng tài nguyên chung (vùng găng).`,pages:[32],source:`slide`},{term:`Giải thuật loại trừ tập trung`,definition:`Coordinator cấp quyền, xếp hàng yêu cầu; 3 thông điệp/lần; điểm lỗi đơn.`,pages:[33,34,35],source:`slide`},{term:`Giải thuật loại trừ phân tán (Ricart–Agrawala)`,definition:`Quảng bá request kèm timestamp; cần OK của tất cả tiến trình; xung đột thì timestamp nhỏ thắng; 2(n−1) thông điệp.`,pages:[36,37,38,39],source:`slide`},{term:`Token Ring`,definition:`Token đi vòng P_i → P_(i+1) mod N; chỉ tiến trình giữ token được vào tài nguyên.`,pages:[40,41],source:`slide`},{term:`Giải thuật Bully`,definition:`Gửi ELECTION cho tiến trình ID lớn hơn; không ai trả lời thì thắng; tiến trình ID lớn nhất còn sống làm coordinator.`,pages:[44,45,46],source:`slide`},{term:`Giải thuật Ring (bầu chọn)`,definition:`ELECTION đi vòng gom danh sách ID; quay về người khởi tạo thì chọn ID lớn nhất và thông báo COORDINATOR.`,pages:[47],source:`slide`},{term:`Bầu chọn trong mạng không dây`,definition:`Nguồn phát ELECTION, xây cây, mỗi nút báo nút tốt nhất trong cây con lên cha, nguồn chọn nút tốt nhất.`,pages:[48,49,50],source:`slide`},{term:`Chọn superpeer`,definition:`Độ trễ thấp, phân bố đều, tỷ lệ định trước, mỗi superpeer không phục vụ quá nhiều nút.`,pages:[51],source:`slide`}],codeExamples:[{title:`Đồng hồ logic Lamport (giả mã)`,language:`python`,code:`class LamportProcess:
    def __init__(self):
        self.C = 0

    def local_event(self):
        self.C += 1                       # bước 1

    def send(self, msg):
        self.C += 1                       # gửi cũng là một sự kiện
        return (msg, self.C)              # bước 2: ts(m) = C

    def receive(self, packet):
        msg, ts = packet
        self.C = max(self.C, ts)          # bước 3
        self.C += 1                       # sự kiện nhận
        return msg                        # chuyển lên ứng dụng`,explanation:`Cài đặt ba quy tắc của Lamport. Ví dụ slide: P2 đang 56 nhận m3 (ts 60) ⇒ max(56,60)+1 = 61.`,parts:[{lines:`5-6`,note:`Mọi sự kiện cục bộ tăng đồng hồ.`},{lines:`8-10`,note:`Gửi: tăng rồi gắn timestamp.`},{lines:`12-16`,note:`Nhận: lấy max với timestamp rồi tăng cho sự kiện nhận.`}],pages:[23,25],source:`bổ sung`},{title:`Vector clock và điều kiện chuyển giao nhân quả (giả mã)`,language:`python`,code:`def on_send(VC, i):
    VC[i] += 1
    return list(VC)                       # ts(m)

def on_receive(VC, ts):
    for k in range(len(VC)):
        VC[k] = max(VC[k], ts[k])

def can_deliver(VC_j, ts, i):
    if ts[i] != VC_j[i] + 1:              # phải là tin kế tiếp từ P_i
        return False
    return all(ts[k] <= VC_j[k] for k in range(len(ts)) if k != i)

# P2: VC = [0,0,0], nhận m* = [1,1,0] từ P1  -> can_deliver = False (chưa có m từ P0)`,explanation:`Điều kiện 2 bảo đảm P_j đã thấy mọi thông điệp mà P_i đã thấy trước khi gửi m.`,parts:[{lines:`1-3`,note:`Tăng thành phần của chính mình rồi gửi kèm vector.`},{lines:`5-7`,note:`Hợp vector theo từng phần tử (max).`},{lines:`9-12`,note:`Hai điều kiện causal delivery trên slide tr. 30.`},{lines:`14`,note:`Ví dụ trên slide: m* phải đợi m.`}],pages:[29,30],source:`bổ sung`},{title:`Bầu chọn Bully (giả mã)`,language:`python`,code:`def start_election(me, alive_ids):
    higher = [p for p in alive_ids if p > me]
    replies = send_election(higher)       # gửi ELECTION cho ID lớn hơn
    if not replies:                       # timeout, không ai trả lời
        broadcast_coordinator(me)         # mình thắng
    else:
        wait_for_coordinator()            # tiến trình lớn hơn tiếp quản

def on_election(me, sender):
    reply_ok(sender)                      # "bắt nạt" tiến trình nhỏ hơn
    start_election(me, alive_ids())`,explanation:`Tiến trình có ID lớn nhất còn sống luôn thắng – vì thế gọi là Bully.`,parts:[{lines:`2-3`,note:`Chỉ hỏi các tiến trình ID lớn hơn.`},{lines:`4-5`,note:`Không ai trả lời → thông báo COORDINATOR.`},{lines:`9-11`,note:`Nhận ELECTION: trả OK và tự tổ chức bầu chọn.`}],pages:[44,45,46],source:`bổ sung`}],figures:[{page:7,caption:`Lỗi make do đồng hồ lệch`},{page:12,caption:`NTP: lấy thời gian từ time server`},{page:16,caption:`Giải thuật Berkeley`},{page:25,caption:`Lamport hiệu chỉnh đồng hồ`},{page:30,caption:`Causal ordering với vector clock`},{page:38,caption:`Loại trừ lẫn nhau phân tán`},{page:41,caption:`Token Ring`},{page:46,caption:`Giải thuật Bully`}],flashcards:[{id:`fc-01`,front:`Hai cách tiếp cận đồng bộ hoá trong HPT?`,back:`Theo giá trị thời gian thực (đồng hồ vật lý) và theo thứ tự sự kiện (đồng hồ logic).`,pages:[4],source:`slide`},{id:`fc-02`,front:`Vì sao make có thể không biên dịch lại file vừa sửa?`,back:`Đồng hồ máy biên dịch nhanh hơn: output.o có thời gian 2144 > output.c 2143.`,pages:[7],source:`slide`},{id:`fc-03`,front:`Hai khó khăn của GPS?`,back:`Tín hiệu bị trễ khi qua khí quyển; đồng hồ thiết bị thu không đồng bộ với vệ tinh.`,pages:[9],source:`slide`},{id:`fc-04`,front:`Công thức độ lệch θ trong NTP?`,back:`θ = ((T2 − T1) + (T3 − T4)) / 2.`,pages:[12],source:`slide`},{id:`fc-05`,front:`Berkeley khác NTP ở điểm nào?`,back:`Daemon chủ động hỏi và lấy trung bình, gửi lượng hiệu chỉnh; không cần nguồn thời gian chuẩn.`,pages:[14,16],source:`slide`},{id:`fc-06`,front:`RBS đồng bộ thế nào?`,back:`Một nút broadcast tham chiếu; các nút nhận so sánh thời điểm nhận với nhau (bỏ trễ phía gửi).`,pages:[18],source:`slide`},{id:`fc-07`,front:`2 điều kiện của a → b?`,back:`Cùng tiến trình và a trước b; hoặc a gửi, b nhận cùng thông điệp.`,pages:[21],source:`slide`},{id:`fc-08`,front:`Thế nào là hai sự kiện tương tranh?`,back:`Không có a → b cũng không có b → a.`,pages:[21],source:`slide`},{id:`fc-09`,front:`3 quy tắc Lamport?`,back:`Tăng C trước mỗi sự kiện; gửi ts(m) = C; nhận thì C = max(C, ts(m)) (rồi tăng).`,pages:[23],source:`slide`},{id:`fc-10`,front:`P2 đang 56 nhận m3 timestamp 60 thì đồng hồ thành bao nhiêu?`,back:`61.`,pages:[25],source:`slide`},{id:`fc-11`,front:`C(a) < C(b) có suy ra a → b không?`,back:`Không – Lamport chỉ đảm bảo chiều a → b ⇒ C(a) < C(b).`,pages:[23],source:`bổ sung`},{id:`fc-12`,front:`Totally ordered multicasting dùng để làm gì?`,back:`Để mọi replica áp dụng cập nhật theo cùng thứ tự (vd cập nhật tài khoản).`,pages:[26],source:`slide`},{id:`fc-13`,front:`VC_i[j] = k nghĩa là gì?`,back:`P_i biết đã có k sự kiện xảy ra ở P_j.`,pages:[28],source:`slide`},{id:`fc-14`,front:`Khi nhận m, P_j cập nhật vector clock thế nào?`,back:`VC_j[k] = max(VC_j[k], ts(m)[k]) với mọi k.`,pages:[29],source:`slide`},{id:`fc-15`,front:`2 điều kiện causal delivery?`,back:`ts(m)[i] = VC_j[i] + 1 và ts(m)[k] ≤ VC_j[k] với mọi k ≠ i.`,pages:[30],source:`slide`},{id:`fc-16`,front:`3 nhóm giải thuật loại trừ lẫn nhau?`,back:`Tập trung, phân tán, Token Ring.`,pages:[32],source:`slide`},{id:`fc-17`,front:`Nhược điểm giải thuật tập trung?`,back:`Coordinator là điểm lỗi đơn và nút cổ chai.`,pages:[33,35],source:`bổ sung`},{id:`fc-18`,front:`Trong giải thuật phân tán, khi đang dùng tài nguyên mà nhận request thì làm gì?`,back:`Không trả lời, lưu request vào hàng đợi.`,pages:[36],source:`slide`},{id:`fc-19`,front:`Khi cả hai cùng muốn vào, ai thắng?`,back:`Tiến trình có timestamp nhỏ hơn.`,pages:[36,37],source:`slide`},{id:`fc-20`,front:`Điều kiện vào tài nguyên trong giải thuật phân tán?`,back:`Nhận đủ OK từ tất cả các tiến trình khác.`,pages:[36],source:`slide`},{id:`fc-21`,front:`Số thông điệp mỗi lần vào ở giải thuật phân tán?`,back:`2(n − 1).`,pages:[36],source:`bổ sung`},{id:`fc-22`,front:`Token đi theo thứ tự nào trong Token Ring?`,back:`Từ P_i tới P_(i+1) mod N.`,pages:[41],source:`slide`},{id:`fc-23`,front:`Vấn đề của Token Ring?`,back:`Mất token khó phát hiện; tiến trình chết làm đứt vòng.`,pages:[41],source:`bổ sung`},{id:`fc-24`,front:`Trong Bully, P gửi ELECTION cho ai?`,back:`Cho mọi tiến trình có ID lớn hơn mình.`,pages:[44],source:`slide`},{id:`fc-25`,front:`Khi nào P thắng trong Bully?`,back:`Khi không tiến trình ID lớn hơn nào trả lời sau timeout.`,pages:[44],source:`slide`},{id:`fc-26`,front:`Giải thuật Ring bầu chọn thế nào?`,back:`ELECTION đi vòng gom danh sách ID; về người khởi tạo thì chọn ID lớn nhất.`,pages:[47],source:`slide`},{id:`fc-27`,front:`Bầu chọn trong mạng không dây có pha nào?`,back:`Pha xây cây (build-tree) từ nút nguồn, rồi báo nút tốt nhất ngược lên.`,pages:[49],source:`slide`},{id:`fc-28`,front:`4 yêu cầu chọn superpeer?`,back:`Độ trễ thấp; phân bố đều; tỷ lệ định trước; không phục vụ quá nhiều nút.`,pages:[51],source:`slide`}],quiz:[{id:`q-01`,level:`hiểu`,question:`Trong ví dụ make, vì sao output.c không được biên dịch lại dù vừa sửa?`,options:[`Đồng hồ máy biên dịch chạy nhanh hơn nên output.o (2144) trông mới hơn output.c (2143)`,`make bị lỗi`,`output.c bị xoá`,`Mạng mất kết nối`],answer:0,explanation:`Đồng hồ vật lý không đồng bộ giữa máy soạn thảo và máy biên dịch.`,pages:[7],source:`slide`},{id:`q-02`,level:`vận dụng`,question:`NTP: T1 = 100, T2 = 130, T3 = 132, T4 = 112 (ms). Độ lệch θ của server so với client?`,options:[`10 ms`,`25 ms`,`-10 ms`,`20 ms`],answer:1,explanation:`θ = ((130−100) + (132−112)) / 2 = (30 + 20) / 2 = 25 ms.`,pages:[12],source:`slide`},{id:`q-03`,level:`hiểu`,question:`Đặc điểm của giải thuật Berkeley?`,options:[`Mỗi máy tự hỏi máy chủ UTC`,`Chỉ dùng cho mạng không dây`,`Time daemon lấy trung bình đồng hồ các máy và gửi lượng hiệu chỉnh cho từng máy`,`Dùng vector clock`],answer:2,explanation:`Daemon quảng bá, các máy trả lời, daemon tính trung bình rồi gửi giá trị cần hiệu chỉnh.`,pages:[14,15,16],source:`slide`},{id:`q-04`,level:`hiểu`,question:`Ưu điểm chính của RBS trong mạng không dây?`,options:[`Không cần broadcast`,`Có time daemon`,`Dùng GPS`,`Loại bỏ độ trễ phía gửi vì chỉ các nút nhận so sánh thời điểm nhận`],answer:3,explanation:`RBS: các nút nhận cùng thông điệp tham chiếu đồng bộ với nhau.`,pages:[18],source:`slide`},{id:`q-05`,level:`nhớ`,question:`Quan hệ happens-before KHÔNG có tính chất nào?`,options:[`Mọi cặp sự kiện đều so sánh được (a → b hoặc b → a)`,`a gửi, b nhận cùng thông điệp ⇒ a → b`,`Bắc cầu`,`Cùng tiến trình, a trước b ⇒ a → b`],answer:0,explanation:`Sự kiện tương tranh không có a → b lẫn b → a.`,pages:[21],source:`slide`},{id:`q-06`,level:`vận dụng`,question:`P1 có đồng hồ 54 nhận thông điệp m4 với timestamp 69. Theo giải thuật Lamport (như ví dụ slide), đồng hồ P1 thành?`,options:[`69`,`70`,`55`,`123`],answer:1,explanation:`max(54, 69) + 1 = 70 (P1 adjusts its clock).`,pages:[25],source:`slide`},{id:`q-07`,level:`hiểu`,question:`Với đồng hồ Lamport, C(a) < C(b) cho phép kết luận gì?`,options:[`a → b`,`b → a`,`Không kết luận được a → b; chỉ biết b không xảy ra trước a`,`a và b tương tranh`],answer:2,explanation:`Lamport: a → b ⇒ C(a) < C(b); chiều ngược không đúng – cần vector clock để xác định nhân quả.`,pages:[23],source:`bổ sung`},{id:`q-08`,level:`hiểu`,question:`Totally ordered multicasting giải quyết vấn đề gì?`,options:[`Mất gói`,`Bầu chọn coordinator`,`Đồng hồ vật lý lệch`,`Các bản sao nhận cập nhật theo thứ tự khác nhau dẫn tới trạng thái không nhất quán`],answer:3,explanation:`Ứng dụng đồng hồ Lamport đảm bảo thứ tự toàn cục khi gửi theo nhóm.`,pages:[26],source:`slide`},{id:`q-09`,level:`vận dụng`,question:`P2 có VC = (0,0,0) nhận m* từ P1 với ts = (1,1,0). P2 có chuyển m* lên ứng dụng ngay không?`,options:[`Không, vì ts[0] = 1 > VC[0] = 0 – chưa nhận thông điệp m từ P0`,`Có, vì ts[1] = VC[1]+1`,`Có, vì vector khác 0`,`Không, vì ts[2] = 0`],answer:0,explanation:`Điều kiện 2 bị vi phạm: ts(m)[k] ≤ VC_j[k] với mọi k ≠ i không thoả ở k = 0.`,pages:[30],source:`slide`},{id:`q-10`,level:`vận dụng`,question:`P0 có VC = (2,1,0) nhận thông điệp với ts = (1,3,1). Sau khi cập nhật (trước khi tăng cho sự kiện nhận), VC của P0 là?`,options:[`(3,4,1)`,`(2,3,1)`,`(1,3,1)`,`(2,1,0)`],answer:1,explanation:`Lấy max từng thành phần: (max(2,1), max(1,3), max(0,1)) = (2,3,1).`,pages:[29],source:`slide`},{id:`q-11`,level:`hiểu`,question:`Nhược điểm chính của giải thuật loại trừ lẫn nhau tập trung?`,options:[`Tốn 2(n−1) thông điệp`,`Không công bằng`,`Coordinator là điểm lỗi đơn`,`Phải có token`],answer:2,explanation:`Đơn giản, 3 thông điệp, công bằng nhưng coordinator chết thì cả hệ thống dừng.`,pages:[33,35],source:`bổ sung`},{id:`q-12`,level:`vận dụng`,question:`Trong giải thuật phân tán, P0 (timestamp 8) và P2 (timestamp 12) cùng xin vào; P1 không muốn vào. Ai vào trước?`,options:[`P2`,`Cả hai cùng vào`,`P1`,`P0`],answer:3,explanation:`Xung đột: so sánh timestamp, nhỏ hơn thắng; P2 gửi OK cho P0 và xếp hàng.`,pages:[36,37,38],source:`slide`},{id:`q-13`,level:`hiểu`,question:`Trong giải thuật loại trừ phân tán, khi nào tiến trình được vào tài nguyên?`,options:[`Khi nhận đủ OK từ tất cả tiến trình khác`,`Khi nhận OK từ coordinator`,`Khi giữ token`,`Khi timestamp chẵn`],answer:0,explanation:`Chỉ vào dùng TN khi nhận đủ các OK của các tiến trình khác.`,pages:[36],source:`slide`},{id:`q-14`,level:`nhớ`,question:`Trong Token Ring với N tiến trình, Pi chuyển token cho?`,options:[`P0`,`P(i+1) mod N`,`P(i−1) mod N`,`Coordinator`],answer:1,explanation:`Token truyền từ Pi đến P(i+1) mod N.`,pages:[41],source:`slide`},{id:`q-15`,level:`vận dụng`,question:`Hệ thống có các tiến trình 0–7; coordinator 7 chết, tiến trình 4 phát hiện và khởi động Bully. Ai sẽ trở thành coordinator nếu 5, 6 còn sống?`,options:[`4`,`5`,`6`,`7`],answer:2,explanation:`Tiến trình ID lớn nhất còn sống thắng: 6.`,pages:[44,45,46],source:`slide`},{id:`q-16`,level:`hiểu`,question:`Trong Bully, khi P gửi ELECTION và nhận được ít nhất một trả lời, P sẽ?`,options:[`Tự tuyên bố là coordinator`,`Khởi động lại`,`Gửi lại cho ID nhỏ hơn`,`Dừng, vì có tiến trình ID lớn hơn còn sống sẽ tiếp quản`],answer:3,explanation:`Chỉ cần 1 tiến trình trả lời, P biết mình không được chọn và dừng lại.`,pages:[44],source:`slide`},{id:`q-17`,level:`hiểu`,question:`Yêu cầu nào KHÔNG thuộc tiêu chí chọn superpeer?`,options:[`Superpeer phải có ID lớn nhất`,`Phân bố đều trong overlay`,`Độ trễ truy cập thấp`,`Không phục vụ quá nhiều nút thường`],answer:0,explanation:`4 yêu cầu: độ trễ thấp, phân bố đều, tỷ lệ định trước, không quá tải.`,pages:[51],source:`slide`}],examQuestions:[{id:`ex-01`,question:`Vì sao cần đồng bộ hoá đồng hồ vật lý trong hệ phân tán? Trình bày NTP và giải thuật Berkeley; tính độ lệch đồng hồ với T1 = 100, T2 = 130, T3 = 132, T4 = 112.`,hints:`- Ví dụ make, GPS [tr. 7](#p7)–[tr. 9](#p9).
- NTP: θ = ((T2−T1)+(T3−T4))/2 = 25 [tr. 12](#p12).
- Berkeley 3 bước [tr. 14](#p14)–[tr. 16](#p16); RBS cho mạng không dây [tr. 18](#p18).`,pages:[7,12,14,16,18],source:`slide`},{id:`ex-02`,question:`Trình bày quan hệ happens-before và giải thuật đồng hồ logic Lamport. Áp dụng: ba tiến trình có tốc độ đồng hồ 6, 8, 10 như ví dụ slide; xác định các giá trị được hiệu chỉnh.`,hints:`- Định nghĩa →, bắc cầu, tương tranh [tr. 21](#p21).
- 3 quy tắc cập nhật [tr. 23](#p23).
- m3: P2 56 → 61; m4: P1 54 → 70 [tr. 25](#p25).
- Ứng dụng totally ordered multicast [tr. 26](#p26).`,pages:[21,23,25,26],source:`slide`},{id:`ex-03`,question:`Vector clock là gì? Vì sao cần vector clock thay cho đồng hồ Lamport? Trình bày điều kiện gửi thông điệp theo nhân quả và minh hoạ bằng ví dụ ba tiến trình.`,hints:`- Lamport không xác định được nhân quả [tr. 27](#p27).
- 2 tính chất, 3 bước cập nhật [tr. 28](#p28)–[tr. 29](#p29).
- 2 điều kiện, ví dụ m và m* [tr. 30](#p30).`,pages:[27,28,29,30],source:`slide`},{id:`ex-04`,question:`So sánh ba giải thuật loại trừ lẫn nhau: tập trung, phân tán và Token Ring (số thông điệp, độ trễ, khả năng chịu lỗi).`,hints:`- Tập trung: coordinator, hàng đợi, 3 thông điệp, điểm lỗi đơn [tr. 33](#p33)–[tr. 35](#p35).
- Phân tán: request + timestamp, 2(n−1), n điểm lỗi [tr. 36](#p36)–[tr. 39](#p39).
- Token Ring: 1..∞ thông điệp, mất token [tr. 40](#p40)–[tr. 41](#p41).`,pages:[33,36,38,41],source:`slide`},{id:`ex-05`,question:`Trình bày giải thuật bầu chọn Bully và Ring. Mô phỏng Bully khi các tiến trình 0–7, coordinator 7 chết và tiến trình 4 phát hiện. Nêu yêu cầu chọn superpeer trong mạng cỡ lớn.`,hints:`- Bully: ELECTION tới ID lớn hơn, OK, COORDINATOR; 4 → 5, 6 trả OK → 5 và 6 tổ chức bầu → 6 thắng [tr. 44](#p44)–[tr. 46](#p46).
- Ring: gom ID đi vòng [tr. 47](#p47).
- Mạng không dây: build-tree [tr. 48](#p48)–[tr. 50](#p50).
- Superpeer 4 yêu cầu [tr. 51](#p51).`,pages:[44,45,46,47,49,51],source:`slide`}]};export{e as default};