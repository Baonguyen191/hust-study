var e={version:1,subject:`KTLT`,lesson:`lec9-go-loi-kiem-thu-va-tinh-chinh-ma-nguon`,title:`Bài 9 – Gỡ lỗi, kiểm thử và tinh chỉnh mã nguồn`,summary:`## 1. Gỡ lỗi (debugging) [tr. 4](#p4)–[tr. 17](#p17)
- **Gỡ lỗi** là quá trình **định vị** và **gỡ bỏ** lỗi. Khoảng **85%** thời gian là định vị lỗi, **15%** là sửa. Thiết kế tốt, phong cách tốt và bẫy lỗi giúp giảm chi phí gỡ rối [tr. 5](#p5).
- **Phân loại lỗi** [tr. 6](#p6)–[tr. 7](#p7):
  - **Syntax**: sai cú pháp, không biên dịch được. Kể cả cảnh báo của trình biên dịch.
  - **Run-time**: chỉ phát hiện khi chạy.
    - Truy cập ngoài mảng, gán \`a = b\` thay vì \`a == b\`, biến chưa khởi tạo.
    - Thiếu \`break\` nên các case chạy xuyên suốt.
    - Không giải phóng bộ nhớ, viết nhầm điều kiện, quên đóng file.
  - **Logic**: chương trình chạy nhưng sai do tư duy hoặc thuật toán sai. **Khó phát hiện nhất**.
- **Quy trình** [tr. 8](#p8)–[tr. 9](#p9):
  1. Mô tả lỗi.
  2. Thu thập dữ liệu về trường hợp xảy ra lỗi.
  3. Dự đoán hoặc định vị nơi xảy ra lỗi.
  4. Chạy lại hoặc dùng gdb kiểm tra. Sai thì quay lại bước 2, đúng thì sửa.
  - Câu hỏi gợi ý: chú thích đóng sai chỗ? biến đã khởi tạo? vòng lặp kết thúc? tham số hợp lệ? khối \`{ }\` đúng chỗ?
- **Lời khuyên** [tr. 10](#p10)–[tr. 16](#p16):
  - Mô tả lỗi kỹ lưỡng và giữ bản sao mã nguồn trước khi sửa.
  - Kiểm thử tích hợp sau khi sửa. Ghi chú lý do sửa (cả trên git).
  - Hạn chế đổ lỗi cho phần cứng hoặc hệ thống. Tổng quát hoá nguyên nhân.
  - Chèn \`printf\` ở đầu hàm (in tham số), trước \`return\` (in kết quả), đầu vòng lặp.
  - **Điều khiển khi biên dịch**: bọc \`printf\` trong \`#ifdef TEST … #endif\` và dịch với \`gcc -DTEST\` (tương đương \`#define TEST\`).
  - \`assert\` trong \`assert.h\`: định nghĩa **NDEBUG** (bằng \`#define\` hoặc \`-D\`) thì assert bị bỏ qua. Chỉ dùng cho kiểm thử đơn vị và gỡ lỗi.
- **gdb** [tr. 17](#p17): công cụ gỡ lỗi nổi tiếng nhất cho C/C++. Đặt **breakpoint**, chạy từng lệnh, xem giá trị biến, phân tích **core dump**.

## 2. Kiểm thử (testing) [tr. 18](#p18)–[tr. 39](#p39)
- Khó khẳng định chương trình lớn chạy chuẩn. Lập trình viên chuyên nghiệp dành thời gian viết test **không ít hơn** viết chương trình [tr. 19](#p19).
- **Định nghĩa** [tr. 20](#p20):
  - Beizer: chứng minh tính đúng đắn giữa phần tử và đặc tả.
  - **Myers**: thực hiện chương trình với mục đích **tìm ra lỗi**.
  - IEEE: kiểm tra để xác nhận thoả yêu cầu hoặc xác định khác biệt giữa kết quả mong đợi và thực tế.
- **Phương pháp** [tr. 21](#p21)–[tr. 27](#p27):
  - **Hộp đen (black-box, functional)**:
    - Chỉ dựa trên yêu cầu và đặc tả, không biết cấu trúc trong.
    - Dùng ở mức mô-đun, tích hợp, hàm, hệ thống, chấp nhận.
    - Ưu điểm: đơn giản hoá kiểm thử. Nhược điểm: khó biết bộ giá trị nào chưa được kiểm thử.
  - **Hộp trắng (white-box, clear/glass box, structural)**:
    - Dựa trên logic bên trong (design, code), nhưng kết quả mong đợi vẫn từ requirements.
    - Phụ thuộc cài đặt: code thay đổi thì test đổi theo. Thường dùng ở mức mô-đun.
  - **Hộp xám**: kết hợp hai loại, người kiểm thử biết một phần cấu trúc trong.
  - Ai cần biết:
    - Programmer làm white-box: nắm luồng dữ liệu nhưng bị ảnh hưởng bởi cách code.
    - QA engineer làm black-box: không biết implementation, không test mọi logical path.
- **Mức độ** [tr. 28](#p28)–[tr. 29](#p29):
  - Unit, Component, Product, System.
  - Thường bắt đầu bằng black-box, thêm white-box, đi từ unit tới system qua các bước tích hợp.
- **Exhaustive testing** quá tốn: hệ 20 màn hình cần 20×4×3×10×2×100 = **480 000** test. Với 1 giây mỗi test là khoảng 17,7 ngày [tr. 30](#p30).
- **Bao nhiêu là đủ?** Không bao giờ đủ. Dừng theo kế hoạch, khi khách hàng thoả mãn, hoặc theo **RISK** (test gì trước, gì nhiều, gì không cần) [tr. 31](#p31)–[tr. 32](#p32).
- **Độ bao phủ (test coverage)** [tr. 33](#p33)–[tr. 34](#p34):
  - Bao nhiêu phần trăm mã được thực hiện khi chạy các test case. Áp dụng cho hộp trắng.
  - Sớm đạt 100% thì thừa test case. Không đạt thì cần thêm test case. Mãi không đạt thì có nhánh không thể thực thi.
- **Phương pháp đo** [tr. 35](#p35)–[tr. 39](#p39):
  - **Statement coverage**: mọi **dòng lệnh** chạy ít nhất 1 lần.
    - Vd \`if (B) ptr = &variable; *ptr = 10;\` chỉ cần B = 1 là đạt 100%, nhưng bỏ sót lỗi con trỏ NULL khi B = 0.
    - Chương trình giai thừa cần 2 test (n < 0, n > 0).
  - **Branch coverage**: mọi **nhánh** chạy ít nhất 1 lần.
    - Với \`if (A && (B || F1()))\`, hai test A = B = 1 và A = 0 đạt 100% nhưng **F1() không bao giờ chạy**.
    - Giai thừa cần 3 test (n < 0, n > 0, n = 0).
  - **Path coverage**: mọi **đường chạy** (tổ hợp nhánh) ít nhất 1 lần. Vd EuclidGCD.

## 3. Tinh chỉnh mã nguồn (code tuning) [tr. 40](#p40)–[tr. 75](#p75)
- **Hiệu năng** [tr. 41](#p41)–[tr. 43](#p43):
  - Chương trình đủ nhanh thì giữ đơn giản, dễ đọc. Thường chỉ một phần nhỏ làm chậm.
  - Các bước: đo thời gian các phần, xác định **hot spots**, tối ưu phần đó, lặp lại.
  - Cải thiện bằng cấu trúc dữ liệu và giải thuật tốt hơn (vd O(n²) thành O(n log n)), hoặc mã nguồn tốt hơn.
- **Tinh chỉnh mã nguồn** là thay đổi code đã chạy thông theo hướng hiệu quả hơn, ở **phạm vi hẹp** (một hàm, một đoạn), không đổi thiết kế rộng [tr. 44](#p44).
  - Cải thiện qua **profiling**, **code tuning**, **options tuning**.
  - Chỉ làm sau khi đã kiểm thử và gỡ rối, vì không tinh chỉnh chương trình chưa chạy đúng [tr. 45](#p45).
- **Tương quan** [tr. 46](#p46)–[tr. 49](#p49):
  - Ít dòng lệnh bậc cao **không** có nghĩa nhanh hơn. Vd trải \`for (i = 1; i < 11; i++) a[i] = i;\` thành 10 lệnh gán: VB tiết kiệm 63%, Java 74%.
  - Luôn **đo** hiệu năng. Hiệu năng phụ thuộc ngôn ngữ, trình dịch, thư viện, CPU, bộ nhớ, và khác nhau giữa các máy.
  - **Không vừa viết vừa tinh chỉnh**: chưa chạy toàn bộ thì không biết nút thắt. Tối ưu sớm tạo nút thắt mới và làm lệch mục tiêu.
- **Tốc độ phép toán** (chậm dần tới nhanh): lượng giác > căn > % > / > * > - > + > << >>. Lệnh: indirect function call, switch, fixed function call, if, while [tr. 50](#p50).
- **Các phương pháp** [tr. 51](#p51)–[tr. 72](#p72):
  - **Biểu thức logic**:
    - Không kiểm tra khi đã biết kết quả (\`if (5 < x) if (x < 10)\`, dùng \`break\` khi tìm thấy số âm).
    - Sắp xếp phép kiểm tra theo tần suất đúng. Đổi switch thành if-then-else (kết quả tuỳ ngôn ngữ, phải đo).
    - Thay biểu thức logic phức tạp bằng **bảng tra** \`categoryTable[a][b][c]\`.
  - **Vòng lặp**:
    - Đưa kiểm tra bất biến ra ngoài vòng lặp (unswitching).
    - Vòng lặp lồng thì đặt vòng **nhiều lần lặp hơn vào trong**.
    - Ghép vòng lặp, giảm tính toán trong vòng lặp, thay nhân bằng cộng, dùng biến tạm.
  - **Dữ liệu**: kiểu nhỏ, mảng ít chiều, chỉ số phụ, biến trung gian, kích thước mảng 2ⁿ.
  - **Biểu thức**:
    - Thay nhân bằng cộng, luỹ thừa bằng nhân. Dùng hàm lượng giác có sẵn.
    - long thành int, floating-point thành fixed-point/int, double thành single. Nhân/chia 2 thành \`<<\`, \`>>\`.
    - Hằng số hợp lý, tính trước, biến trung gian.
  - **Dãy lệnh**: dùng hàm inline.
  - **Assembler**: viết bằng ngôn ngữ bậc cao, kiểm tra đúng, profiling tìm hot spot (khoảng **5% code chiếm 50% thời gian**), rồi viết lại đoạn nhỏ bằng assembler.
  - Càng thay đổi nhiều thì càng không cải thiện được hiệu năng.
- **Giúp trình dịch** [tr. 72](#p72):
  - Trình dịch tự cấp phát thanh ghi, chọn và sắp lệnh.
  - Trình dịch **không** tự xác định được side effect và **memory aliasing**, nên phải đọc assembly và xem lại code.
- **Khai thác phần cứng** [tr. 73](#p73)–[tr. 74](#p74):
  - Thanh ghi và cache nhanh hơn bộ nhớ chính, nên tận dụng locality.
  - Song song hoá: **pipelining**, **superscalar**, **speculative execution**.
- **Kết luận** [tr. 75](#p75):
  - Lập trình thông minh, đừng cứng nhắc. Không tối ưu chương trình đủ nhanh. Tối ưu đúng lúc, đúng chỗ.
  - Tăng tốc bằng CTDL và giải thuật tốt hơn. Đoạn tối ưu chỉ thay đổi ít.`,keyConcepts:[{term:`Gỡ lỗi`,definition:`Quá trình định vị và gỡ bỏ lỗi; ~85% thời gian định vị, ~15% sửa.`,pages:[5],source:`slide`},{term:`Lỗi syntax`,definition:`Sai cú pháp, không biên dịch được (kể cả cảnh báo trình biên dịch).`,pages:[6],source:`slide`},{term:`Lỗi run-time`,definition:`Chỉ phát hiện khi chạy: ngoài mảng, = thay ==, biến chưa khởi tạo, thiếu break, không giải phóng bộ nhớ…`,pages:[6,7],source:`slide`},{term:`Lỗi logic`,definition:`Chương trình chạy nhưng sai do tư duy/thuật toán – khó phát hiện nhất.`,pages:[6],source:`slide`},{term:`Quy trình gỡ lỗi`,definition:`Mô tả lỗi → thu thập dữ liệu → dự đoán vị trí → kiểm tra (gdb) → sai thì quay lại, đúng thì sửa.`,pages:[8],source:`slide`},{term:`printf gỡ lỗi`,definition:`Chèn ở đầu hàm (tham số), trước return (kết quả), đầu vòng lặp.`,pages:[12],source:`slide`},{term:`Điều khiển biên dịch`,definition:`#ifdef TEST … #endif kết hợp gcc -DTEST để bật/tắt code gỡ lỗi.`,pages:[13,14,15],source:`slide`},{term:`NDEBUG`,definition:`Định nghĩa NDEBUG thì mọi assert bị bỏ qua.`,pages:[15],source:`slide`},{term:`gdb`,definition:`Trình gỡ lỗi C/C++: breakpoint, chạy từng lệnh, xem biến, phân tích core dump.`,pages:[17],source:`slide`},{term:`Kiểm thử (Myers)`,definition:`Thực hiện chương trình với mục đích tìm ra lỗi.`,pages:[20],source:`slide`},{term:`Kiểm thử hộp đen`,definition:`Dựa trên yêu cầu/đặc tả, không biết cấu trúc trong (functional testing).`,pages:[21,22,23],source:`slide`},{term:`Kiểm thử hộp trắng`,definition:`Dựa trên logic bên trong (structural, clear/glass box); phụ thuộc cài đặt.`,pages:[21,24,25],source:`slide`},{term:`Kiểm thử hộp xám`,definition:`Kết hợp hộp đen và hộp trắng, biết một phần cấu trúc trong.`,pages:[26],source:`slide`},{term:`Các mức kiểm thử`,definition:`Unit, Component, Product, System.`,pages:[28,29],source:`slide`},{term:`Exhaustive testing`,definition:`Kiểm thử mọi tổ hợp – chi phí bùng nổ (vd 480 000 test).`,pages:[30],source:`slide`},{term:`Kiểm thử dựa trên RISK`,definition:`Xác định cái gì test trước, test nhiều, kỹ thế nào, cái gì chưa cần test.`,pages:[32],source:`slide`},{term:`Test coverage`,definition:`Tỷ lệ mã được thực hiện khi chạy các test case; áp dụng cho hộp trắng.`,pages:[33,34],source:`slide`},{term:`Statement coverage`,definition:`Mọi dòng lệnh được thực hiện ít nhất một lần.`,pages:[35,36],source:`slide`},{term:`Branch coverage`,definition:`Mọi nhánh được thực hiện ít nhất một lần.`,pages:[37,38],source:`slide`},{term:`Path coverage`,definition:`Mọi đường chạy (tổ hợp nhánh) được thực hiện ít nhất một lần.`,pages:[39],source:`slide`},{term:`Hot spots`,definition:`Đoạn mã đòi hỏi nhiều thời gian thực hiện; ~5% code chiếm 50% thời gian.`,pages:[41,71],source:`slide`},{term:`Code tuning`,definition:`Thay đổi mã đã chạy thông theo hướng hiệu quả hơn ở phạm vi hẹp.`,pages:[44],source:`slide`},{term:`Profiling`,definition:`Lập hồ sơ mã nguồn để chỉ ra đoạn lệnh tiêu tốn nhiều thời gian.`,pages:[45],source:`slide`},{term:`Không vừa viết vừa tinh chỉnh`,definition:`Chưa chạy toàn bộ thì chưa biết nút thắt; tối ưu sớm tạo nút thắt mới.`,pages:[49],source:`slide`},{term:`Bảng tra thay biểu thức logic`,definition:`Thay chuỗi if phức tạp bằng tra mảng categoryTable[a][b][c].`,pages:[60,61],source:`slide`},{term:`Unswitching`,definition:`Đưa kiểm tra điều kiện bất biến ra ngoài vòng lặp.`,pages:[62,63],source:`slide`},{term:`Memory aliasing`,definition:`Nhiều con trỏ trỏ cùng vùng nhớ – trình dịch không tự xác định được.`,pages:[72],source:`slide`},{term:`Song song hoá phần cứng`,definition:`Pipelining, superscalar, speculative execution.`,pages:[74],source:`slide`}],codeExamples:[{title:`Gỡ lỗi bằng điều khiển biên dịch và assert`,language:`c`,code:`#include <stdio.h>
#include <assert.h>
int foo(int);
int main() {
    int n = 1;
#ifdef TEST
    printf("Reached main() n = %d\\n", n);
#endif
    int x = 9, y = 9;
    assert(x == (y + 1));    /* sai: in thông báo và dừng */
    return 0;
}
/* gcc -DTEST -o exam examp.c   -> bật printf
   gcc -DNDEBUG ...             -> tắt assert */`,explanation:`printf chỉ được biên dịch khi có -DTEST. assert dừng chương trình vì 9 != 10, trừ khi định nghĩa NDEBUG.`,parts:[{lines:`6-8`,note:`Khối chỉ có khi định nghĩa TEST.`},{lines:`10`,note:`Biểu thức bằng 0 thì báo lỗi.`},{lines:`13-14`,note:`Tuỳ chọn dòng lệnh.`}],pages:[14,15,16],source:`slide`},{title:`Statement coverage chưa đủ`,language:`c`,code:`int* ptr = NULL;
if (B)
    ptr = &variable;
*ptr = 10;
/* Test case B = 1: statement coverage 100%
   nhưng B = 0 gây dereference con trỏ NULL */`,explanation:`Mọi dòng đều chạy với một test case, nhưng nhánh B = 0 (không có lệnh) không được kiểm tra.`,parts:[{lines:`2-3`,note:`Nhánh true.`},{lines:`4`,note:`Lỗi khi ptr vẫn NULL.`}],pages:[35],source:`bổ sung`},{title:`Branch coverage và short-circuit`,language:`c`,code:`if (A && (B || F1()))
    F2();
else
    F3();
/* Test A = B = 1  -> F2()
   Test A = 0      -> F3()
   Branch coverage 100% nhưng F1() không bao giờ được gọi */`,explanation:`Với A = B = 1, B || F1() đoản mạch nên không gọi F1; với A = 0 thì && đoản mạch. Cần thêm test A = 1, B = 0.`,parts:[{lines:`1`,note:`Điều kiện có đoản mạch.`},{lines:`5-7`,note:`Hai test đạt 100% nhánh.`}],pages:[37],source:`slide`},{title:`Chương trình giai thừa dùng để đo độ bao phủ`,language:`c`,code:`#include <stdio.h>
int main() {
    int i, n, f;
    printf("n = ");
    scanf("%d", &n);
    if (n < 0) {
        printf("Invalid: %d\\n", n);
        n = -1;
    } else {
        f = 1;
        for (i = 1; i <= n; i++) {
            f *= i;
        }
        printf("%d! = %d\\n", n, f);
    }
    return n;
}`,explanation:`Statement coverage cần 2 test (n < 0, n > 0); branch coverage cần 3 test (thêm n = 0 để vòng for không chạy lần nào).`,parts:[{lines:`6-8`,note:`Nhánh n < 0.`},{lines:`11-13`,note:`Vòng for – n = 0 thì bỏ qua thân.`},{lines:`14`,note:`In kết quả.`}],pages:[36,38],source:`slide`},{title:`Tinh chỉnh biểu thức logic`,language:`cpp`,code:`// Không kiểm tra khi đã biết kết quả
if (5 < x)
    if (x < 10) { /* ... */ }

negativeInputFound = false;
for (i = 0; i < iCount; i++) {
    if (input[i] < 0) {
        negativeInputFound = true;
        break;                  // dừng ngay khi tìm thấy
    }
}

// Bảng tra thay cho chuỗi if phức tạp
static int categoryTable[2][2][2] = {
    // !b!c  !bc  b!c  bc
       0,    3,   2,   2,    // !a
       1,    2,   1,   1     //  a
};
category = categoryTable[a][b][c];`,explanation:`break giúp C++ tiết kiệm 14%, Java 29% (theo slide). Bảng tra cho cùng kết quả với chuỗi if-else ở tr. 60.`,parts:[{lines:`2-3`,note:`Tách điều kiện.`},{lines:`6-11`,note:`Dừng vòng lặp sớm.`},{lines:`14-19`,note:`Tra bảng theo 3 điều kiện.`}],pages:[52,54,60,61],source:`slide`},{title:`Tinh chỉnh vòng lặp`,language:`cpp`,code:`// Unswitching: kiểm tra bất biến ra ngoài
if (sumType == SUMTYPE_NET) {
    for (i = 0; i < count; i++) netSum = netSum + amount[i];
} else {
    for (i = 0; i < count; i++) grossSum = grossSum + amount[i];
}

// Vòng lặp nhiều lần lặp hơn đặt bên trong
for (row = 0; row < 5; row++)
    for (column = 0; column < 100; column++)
        sum = sum + table[row][column];

// Thay nhân bằng cộng
a[0] = 0;
for (i = 1; i < n; i++) a[i] = a[i - 1] + conversion;

// Biến tạm
for (i = 0; i < r; i++) {
    temp = C[i];
    for (j = 0; j < c; j++) A[j] = B[j] + temp;
}`,explanation:`Các kỹ thuật trên slide 62–67; unswitching cho C++ nhanh 19%, Python 28%.`,parts:[{lines:`2-6`,note:`Đưa if ra ngoài vòng lặp.`},{lines:`9-11`,note:`Vòng ngoài 5 lần, vòng trong 100 lần.`},{lines:`14-15`,note:`Nhân thành cộng.`},{lines:`18-21`,note:`Dùng biến trung gian.`}],pages:[62,63,64,66,67],source:`slide`}],figures:[{page:8,caption:`Quy trình gỡ lỗi`},{page:30,caption:`Chi phí exhaustive testing`},{page:36,caption:`Statement coverage trên đồ thị luồng`},{page:39,caption:`Path coverage – EuclidGCD`},{page:60,caption:`Biểu thức logic dạng Venn`}],flashcards:[{id:`fc-01`,front:`Gỡ lỗi là gì?`,back:`Quá trình định vị và gỡ bỏ các lỗi của chương trình.`,pages:[5],source:`slide`},{id:`fc-02`,front:`Tỷ lệ thời gian định vị/sửa lỗi?`,back:`~85% định vị, ~15% sửa.`,pages:[5],source:`slide`},{id:`fc-03`,front:`3 loại lỗi?`,back:`Syntax, run-time, logic.`,pages:[6],source:`slide`},{id:`fc-04`,front:`Loại lỗi khó phát hiện nhất?`,back:`Lỗi logic.`,pages:[6],source:`slide`},{id:`fc-05`,front:`Kể 4 lỗi run-time thường gặp.`,back:`Truy cập ngoài mảng; a = b thay a == b; biến chưa khởi tạo; thiếu break; (không giải phóng bộ nhớ, sai điều kiện, quên đóng file).`,pages:[7],source:`slide`},{id:`fc-06`,front:`Các bước quy trình gỡ lỗi?`,back:`Mô tả lỗi; thu thập dữ liệu; dự đoán vị trí; chạy lại/gdb kiểm tra; sai thì quay lại, đúng thì sửa.`,pages:[8],source:`slide`},{id:`fc-07`,front:`Nên chèn printf gỡ lỗi ở đâu?`,back:`Đầu hàm (in tham số), trước return (in kết quả), đầu vòng lặp.`,pages:[12],source:`slide`},{id:`fc-08`,front:"`gcc -DTEST` tương đương?",back:`#define TEST.`,pages:[15],source:`slide`},{id:`fc-09`,front:`Làm sao tắt mọi assert?`,back:`Định nghĩa macro NDEBUG (#define hoặc -D).`,pages:[15],source:`slide`},{id:`fc-10`,front:`gdb hỗ trợ những gì?`,back:`Breakpoint, chạy từng lệnh, xem giá trị biến, phân tích core dump.`,pages:[17],source:`slide`},{id:`fc-11`,front:`Định nghĩa kiểm thử của Myers?`,back:`Thực hiện chương trình với mục đích tìm ra lỗi.`,pages:[20],source:`slide`},{id:`fc-12`,front:`Black-box testing dựa vào gì?`,back:`Yêu cầu, đặc tả, thiết kế – không biết cấu trúc bên trong.`,pages:[21,22],source:`slide`},{id:`fc-13`,front:`White-box testing còn gọi là?`,back:`Clear box, glass box, transparent box, structural testing.`,pages:[24],source:`slide`},{id:`fc-14`,front:`Ưu/nhược hộp đen?`,back:`Đơn giản hoá kiểm thử; khó biết bộ giá trị nào chưa được kiểm thử.`,pages:[23],source:`slide`},{id:`fc-15`,front:`Kiểm thử hộp xám?`,back:`Kết hợp hộp đen và hộp trắng, biết một phần cấu trúc trong.`,pages:[26],source:`slide`},{id:`fc-16`,front:`4 mức kiểm thử?`,back:`Unit, Component, Product, System.`,pages:[28,29],source:`slide`},{id:`fc-17`,front:`Bao nhiêu testing là đủ?`,back:`Không bao giờ đủ – phụ thuộc rủi ro (RISK) của hệ thống.`,pages:[31,32],source:`slide`},{id:`fc-18`,front:`Test coverage là gì?`,back:`Tỷ lệ mã nguồn được thực hiện khi chạy các test case.`,pages:[33],source:`slide`},{id:`fc-19`,front:`Coverage mãi không đạt 100% nghĩa là?`,back:`Mã nguồn có nhánh không thể thực thi được.`,pages:[34],source:`slide`},{id:`fc-20`,front:`Statement vs branch coverage?`,back:`Mọi dòng lệnh vs mọi nhánh được thực hiện ít nhất một lần.`,pages:[35,37],source:`slide`},{id:`fc-21`,front:`Path coverage?`,back:`Mọi đường chạy (tổ hợp các nhánh) được thực hiện ít nhất một lần.`,pages:[39],source:`slide`},{id:`fc-22`,front:`Hot spot là gì?`,back:`Đoạn mã đòi hỏi nhiều thời gian thực hiện.`,pages:[41],source:`slide`},{id:`fc-23`,front:`Code tuning là gì?`,back:`Thay đổi mã đã chạy thông theo hướng hiệu quả hơn, ở phạm vi hẹp.`,pages:[44],source:`slide`},{id:`fc-24`,front:`Khi nào tinh chỉnh mã?`,back:`Sau khi đã kiểm thử và gỡ rối; sau khi bàn giao để duy trì hiệu năng.`,pages:[45],source:`slide`},{id:`fc-25`,front:`Ít dòng lệnh bậc cao hơn có nhanh hơn không?`,back:`Không nhất thiết – phải đo.`,pages:[46,47],source:`slide`},{id:`fc-26`,front:`Thứ tự tốc độ phép toán?`,back:`Lượng giác > căn > % > / > * > - > + > << >> (chậm → nhanh).`,pages:[50],source:`slide`},{id:`fc-27`,front:`Vòng lặp lồng nhau: đặt vòng nào bên trong?`,back:`Vòng có nhiều lần lặp hơn.`,pages:[64],source:`slide`},{id:`fc-28`,front:`Trình dịch không tự xác định được gì?`,back:`Side effect của hàm/biểu thức và memory aliasing.`,pages:[72],source:`slide`},{id:`fc-29`,front:`3 cơ chế song song hoá của CPU?`,back:`Pipelining, superscalar, speculative execution.`,pages:[74],source:`slide`}],quiz:[{id:`q-01`,level:`nhớ`,question:`Theo slide, phần lớn thời gian gỡ lỗi dành cho?`,options:[`Định vị lỗi (85%)`,`Sửa lỗi (85%)`,`Viết test (85%)`,`Biên dịch lại (85%)`],answer:0,explanation:`85% định vị, 15% sửa.`,pages:[5],source:`slide`},{id:`q-02`,level:`hiểu`,question:"`if (a = b)` thay vì `if (a == b)` thuộc loại lỗi nào theo slide?",options:[`Syntax`,`Run-time`,`Hardware`,`Link`],answer:1,explanation:`Slide xếp 'thao tác gán thay vì so sánh' vào lỗi run-time thường gặp.`,pages:[7],source:`slide`},{id:`q-03`,level:`nhớ`,question:`Loại lỗi khó phát hiện nhất?`,options:[`Syntax`,`Run-time`,`Logic`,`Cảnh báo trình biên dịch`],answer:2,explanation:`Chương trình vẫn chạy nhưng cho kết quả sai.`,pages:[6],source:`slide`},{id:`q-04`,level:`hiểu`,question:`Ở bước kiểm tra, nếu dự đoán vị trí lỗi sai thì?`,options:[`Sửa lỗi luôn`,`Viết lại chương trình`,`Bỏ qua lỗi`,`Quay lại bước thu thập dữ liệu`],answer:3,explanation:`Quay lại bước (2).`,pages:[8],source:`slide`},{id:`q-05`,level:`vận dụng`,question:"Đoạn code khi dịch bằng `gcc -o exam examp.c` (không -DTEST) in ra gì?",code:{language:`c`,code:`int main() {
  int n = 1;
#ifdef TEST
  printf("Reached main() n = %d\\n", n);
#endif
  return 0;
}`},options:[`Không in gì`,`Reached main() n = 1`,`Lỗi biên dịch`,`n = 1`],answer:0,explanation:`Khối #ifdef chỉ được biên dịch khi TEST được định nghĩa.`,pages:[14,15],source:`slide`},{id:`q-06`,level:`vận dụng`,question:"Với x = 9, y = 9, lệnh `assert(x == (y + 1));` khi KHÔNG định nghĩa NDEBUG?",options:[`Không làm gì`,`In thông báo lỗi và dừng chương trình`,`Trả về 0`,`Ném exception`],answer:1,explanation:`9 != 10 nên biểu thức bằng 0.`,pages:[15,16],source:`slide`},{id:`q-07`,level:`nhớ`,question:`Kiểm thử dựa trên yêu cầu/đặc tả mà không biết cấu trúc bên trong là?`,options:[`Hộp trắng`,`Hộp xám`,`Hộp đen`,`Path testing`],answer:2,explanation:`Black-box = functional testing.`,pages:[21,22],source:`slide`},{id:`q-08`,level:`hiểu`,question:`Nhược điểm của kiểm thử hộp trắng theo slide?`,options:[`Không biết cấu trúc trong`,`Không cần lập trình`,`Không dùng được ở mức mô-đun`,`Phụ thuộc cài đặt – code thay đổi thì test phải đổi theo`],answer:3,explanation:`Đặc điểm hộp trắng tr. 25.`,pages:[25],source:`slide`},{id:`q-09`,level:`nhớ`,question:`Định nghĩa 'kiểm thử là thực hiện chương trình với mục đích tìm ra lỗi' là của?`,options:[`Myers`,`Beizer`,`IEEE`,`Knuth`],answer:0,explanation:`Slide 20.`,pages:[20],source:`slide`},{id:`q-10`,level:`vận dụng`,question:`Đoạn sau với test case B = 1 đạt bao nhiêu statement coverage và có vấn đề gì?`,code:{language:`c`,code:`int* ptr = NULL;
if (B)
  ptr = &variable;
*ptr = 10;`},options:[`50%, không vấn đề`,`100%, nhưng B = 0 gây dereference NULL chưa được kiểm tra`,`100%, không vấn đề`,`75%`],answer:1,explanation:`Slide nói đạt 100%; phần nhận xét về NULL là bổ sung.`,pages:[35],source:`bổ sung`},{id:`q-11`,level:`vận dụng`,question:"Với `if (A && (B || F1())) F2(); else F3();`, hai test A = B = 1 và A = 0 cho kết quả?",options:[`Branch coverage 50%`,`Path coverage 100%`,`Branch coverage 100% nhưng F1() không được thực thi`,`F1() được gọi 2 lần`],answer:2,explanation:`Đoản mạch làm F1() không bao giờ được gọi.`,pages:[37],source:`slide`},{id:`q-12`,level:`vận dụng`,question:`Chương trình giai thừa (if n < 0 … else for …) cần tối thiểu bao nhiêu test để branch coverage 100%?`,options:[`1`,`2`,`4`,`3`],answer:3,explanation:`n < 0, n > 0 và n = 0 (vòng for không chạy).`,pages:[38],source:`slide`},{id:`q-13`,level:`hiểu`,question:`Đo độ bao phủ mà mãi không đạt 100% dù thêm test, nghĩa là?`,options:[`Mã có nhánh không thể thực thi`,`Test case sai`,`Đã thừa test case`,`Trình dịch lỗi`],answer:0,explanation:`Slide 34.`,pages:[34],source:`slide`},{id:`q-14`,level:`hiểu`,question:`Khi nào KHÔNG nên tinh chỉnh mã nguồn?`,options:[`Sau khi đã kiểm thử`,`Khi chương trình chưa chạy đúng`,`Sau khi bàn giao`,`Khi profiling chỉ ra hot spot`],answer:1,explanation:`Không cần tinh chỉnh 1 CT chạy chưa đúng.`,pages:[45],source:`slide`},{id:`q-15`,level:`hiểu`,question:`Vì sao không nên vừa viết chương trình vừa tinh chỉnh?`,options:[`Tốn bộ nhớ`,`Trình dịch không cho phép`,`Chưa chạy toàn bộ thì không xác định được nút thắt; tối ưu sớm tạo nút thắt mới`,`Làm code ngắn hơn`],answer:2,explanation:`Slide 49.`,pages:[49],source:`slide`},{id:`q-16`,level:`nhớ`,question:`Phép toán nào nhanh nhất theo slide?`,options:[`%`,`/`,`*`,`<< >>`],answer:3,explanation:`Lượng giác > căn > % > / > * > - > + > << >>.`,pages:[50],source:`slide`},{id:`q-17`,level:`vận dụng`,question:`Vòng lặp nào nhanh hơn theo slide?`,code:{language:`cpp`,code:`// A
for (column = 0; column < 100; column++)
  for (row = 0; row < 5; row++) sum += table[row][column];
// B
for (row = 0; row < 5; row++)
  for (column = 0; column < 100; column++) sum += table[row][column];`},options:[`B`,`A`,`Như nhau`,`Tuỳ dữ liệu`],answer:0,explanation:`Đặt vòng lặp xử lý nhiều công việc hơn (100 lần) bên trong.`,pages:[64],source:`slide`},{id:`q-18`,level:`vận dụng`,question:`Với categoryTable trên slide, a = 0, b = 0, c = 1 thì category = ?`,options:[`0`,`3`,`2`,`1`],answer:1,explanation:`Hàng !a, cột !bc → 3; khớp nhánh c && !a && !b.`,pages:[60,61],source:`slide`},{id:`q-19`,level:`hiểu`,question:`Điều nào trình dịch KHÔNG tự xác định được?`,options:[`Cấp phát thanh ghi`,`Thứ tự thực hiện lệnh`,`Memory aliasing`,`Loại bỏ lệnh kém hiệu quả`],answer:2,explanation:`Cùng với side effect của hàm/biểu thức.`,pages:[72],source:`slide`},{id:`q-20`,level:`nhớ`,question:`Thực hiện nhiều thao tác trong cùng 1 chu kỳ đồng hồ là?`,options:[`Pipelining`,`Caching`,`Speculative execution`,`Superscalar`],answer:3,explanation:`Slide 74.`,pages:[74],source:`slide`}],examQuestions:[{id:`ex-01`,question:`Trình bày khái niệm gỡ lỗi, phân loại lỗi, quy trình gỡ lỗi và các lời khuyên khi gỡ lỗi (printf, điều khiển biên dịch, assert, gdb).`,hints:`- Khái niệm [tr. 5](#p5); phân loại [tr. 6](#p6)–[tr. 7](#p7).
- Quy trình [tr. 8](#p8)–[tr. 9](#p9).
- Lời khuyên [tr. 10](#p10)–[tr. 16](#p16); gdb [tr. 17](#p17).`,pages:[5,6,7,8,12,14,15,17],source:`slide`},{id:`ex-02`,question:`So sánh kiểm thử hộp đen, hộp trắng, hộp xám. Trình bày các mức kiểm thử và câu hỏi 'bao nhiêu testing là đủ'.`,hints:`- Định nghĩa [tr. 20](#p20).
- Hộp đen [tr. 22](#p22)–[tr. 23](#p23); hộp trắng [tr. 24](#p24)–[tr. 25](#p25); hộp xám [tr. 26](#p26).
- Mức [tr. 28](#p28)–[tr. 29](#p29); exhaustive [tr. 30](#p30); RISK [tr. 31](#p31)–[tr. 32](#p32).`,pages:[20,21,22,24,26,28,30,32],source:`slide`},{id:`ex-03`,question:`Độ bao phủ kiểm thử là gì? Trình bày statement, branch, path coverage. Với chương trình giai thừa, cần bao nhiêu test case cho mỗi loại?`,hints:`- Coverage [tr. 33](#p33)–[tr. 34](#p34).
- Statement [tr. 35](#p35)–[tr. 36](#p36).
- Branch [tr. 37](#p37)–[tr. 38](#p38); path [tr. 39](#p39).`,pages:[33,34,35,36,37,38,39],source:`slide`},{id:`ex-04`,question:`Tinh chỉnh mã nguồn là gì, khi nào nên làm? Trình bày các phương pháp tinh chỉnh biểu thức logic, vòng lặp, dữ liệu, biểu thức và cách giúp trình dịch/khai thác phần cứng.`,hints:`- Hiệu năng [tr. 41](#p41)–[tr. 45](#p45); tương quan [tr. 46](#p46)–[tr. 50](#p50).
- Logic [tr. 52](#p52)–[tr. 61](#p61); vòng lặp [tr. 62](#p62)–[tr. 67](#p67).
- Dữ liệu, biểu thức [tr. 68](#p68)–[tr. 71](#p71); trình dịch, phần cứng [tr. 72](#p72)–[tr. 75](#p75).`,pages:[44,45,49,52,61,62,64,69,72,74],source:`slide`}]};export{e as default};