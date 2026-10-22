var e={version:1,subject:`IoT`,lesson:`c3a-lap-trinh-thiet-bi`,title:`Chương 3a – Lập trình cho thiết bị IoT`,summary:'## 3.1. Lập trình cho thiết bị IoT\nChương 3 gồm: lập trình thiết bị (ESP32), xây dựng Web API, khai thác IoT cloud platform [tr. 191](#p191).\n- **3 nhóm thiết bị** [tr. 192](#p192)–[tr. 194](#p194):\n  - **Vi điều khiển 8-bit hiệu năng thấp, không có OS** (ATmega, PIC, AVR, Arduino): lập trình **firmware**, GPIO, ghép ngoại vi qua **UART, SPI, I2C**.\n  - **Vi xử lý 32-bit hiệu năng trung bình** (ESP8266, **ESP32**, Arduino Uno WiFi): có thể dùng OS đơn giản (**FreeRTOS**, TinyOS, uCLinux), có thêm **WiFi, Bluetooth, GSM**.\n  - **Vi xử lý 32/64-bit hiệu năng cao** (**Raspberry Pi**): chạy OS đầy đủ (Embedded Linux, Raspbian, Android…). Ngoại vi được truy cập qua driver. Dùng được thư viện Java, Python, .NET, OpenCV.\n- Lộ trình với ESP32 [tr. 196](#p196): (A) Arduino IDE, (B) WiFi, (C) HTTP, (D) MQTT, (E) multi-task FreeRTOS.\n\n### A. Arduino IDE [tr. 197](#p197)–[tr. 209](#p209)\n- Arduino Uno dùng vi điều khiển **ATmega328**. Board có digital I/O (`~` là chân PWM, chân 0/1 là Serial), analog input, cổng USB, nguồn.\n- Cấu trúc **sketch**:\n  - `setup()` chạy **một lần** khi khởi động để khởi tạo.\n  - `loop()` chạy **lặp vô hạn** sau setup.\n- **GPIO output**: `pinMode(2, OUTPUT)`, `digitalWrite(2, HIGH/LOW)`, `delay(1000)` → LED nhấp nháy chu kỳ 2 giây.\n- **GPIO input**: `pinMode(buttonPin, INPUT)`, `digitalRead`. Nút nhấn HIGH thì bật LED pin 13.\n- **UART**: thư viện `Serial`.\n  - `Serial.begin(9600)` (baud rate), `Serial.available()`, `Serial.read()`, `Serial.print/println`.\n  - Ví dụ: nhận ký tự \'0\'/\'1\' để tắt/bật LED. Lưu ý `Serial.read()` trả về **mã ASCII**, vd \'1\' là 49.\n- **I2C**: thư viện `Wire`, vd đọc cảm biến khoảng cách siêu âm SRFxx.\n- Thiết lập cho ESP32: Boards Manager → cài ESP32 → chọn board **DOIT ESP32 DEVKIT V1** → chọn cổng COM → upload Blink (`LED_BUILTIN = 2`).\n\n### B. Kết nối WiFi [tr. 210](#p210)–[tr. 211](#p211)\n- Gồm `#include <WiFi.h>` và `WiFi.begin(ssid, password)`.\n- Lặp `while (WiFi.status() != WL_CONNECTED) delay(500)` cho tới khi kết nối, sau đó in `WiFi.localIP()`.\n\n### C. HTTP với ESP32 [tr. 212](#p212)–[tr. 234](#p234)\n- **GET** dùng để lấy dữ liệu, dữ liệu nằm trên URL (`/update-sensor?temperature=...`). **POST** gửi dữ liệu trong body để tạo/cập nhật tài nguyên.\n- Thư viện `HTTPClient`:\n  - `http.begin(url)`, `http.GET()` trả mã phản hồi (> 0 là thành công), `http.getString()` đọc body, `http.end()`.\n  - Kiểm tra `WiFi.status() == WL_CONNECTED` trước khi gửi.\n- Mô phỏng trên **Wokwi**: WiFi `"Wokwi-GUEST"`, gửi tới `postman-echo.com`.\n- **POST** có 3 kiểu dữ liệu:\n  - **URL-encoded**: `addHeader("Content-Type", "application/x-www-form-urlencoded")` rồi `POST("field1=30.50&field2=78.00")`.\n  - **JSON**: `addHeader("Content-Type", "application/json")`.\n  - **Plain text**: `text/plain`.\n- Tạo/đọc JSON bằng thư viện **ArduinoJson**.\n- Có thể dựng **web server trên ESP32** để điều khiển GPIO qua trình duyệt.\n\n### D. MQTT với ESP32 [tr. 235](#p235)–[tr. 236](#p236)\n- Thư viện **PubSubClient**: `WiFiClient espClient; PubSubClient client(espClient);`.\n- Trong `setup`: `setup_wifi()`, `client.setServer(mqtt_server, 1883)`, `client.setCallback(callback)`.\n- Trong `loop`: nếu mất kết nối thì `reconnect()`, sau đó gọi `client.loop()`.\n\n### E. Multi-task với FreeRTOS [tr. 237](#p237)–[tr. 240](#p240)\n- Tạo task: `xTaskCreate(func, "name", stackSize, param, priority, handle)`, vd stack 1024 byte, priority 1.\n- Hàm task chạy **vòng lặp vô hạn** `for(;;)` và dùng `vTaskDelay(500 / portTICK_PERIOD_MS)` để **nhường CPU** cho task khác. Không dùng `delay()` chặn.\n- Nhiều task (nháy LED, đọc cảm biến, gửi MQTT) chạy **song song** trên ESP32.',keyConcepts:[{term:`3 nhóm thiết bị IoT`,definition:`Vi điều khiển 8-bit không OS; vi xử lý 32-bit với RTOS + WiFi/BLE (ESP32); vi xử lý 32/64-bit với OS đầy đủ (Raspberry Pi).`,pages:[192,193,194],source:`slide`},{term:`Firmware`,definition:`Chương trình chạy trực tiếp trên vi điều khiển không có hệ điều hành.`,pages:[192],source:`slide`},{term:`GPIO`,definition:`General Purpose Input/Output – chân vào/ra số đa dụng của vi điều khiển.`,pages:[192,201],source:`slide`},{term:`UART / SPI / I2C`,definition:`Các chuẩn giao tiếp ngoại vi phổ biến; UART qua Serial, I2C qua thư viện Wire.`,pages:[192,203,205],source:`slide`},{term:`ESP32`,definition:`Vi điều khiển 32-bit có WiFi/Bluetooth, chạy FreeRTOS, lập trình bằng Arduino IDE.`,pages:[193,195],source:`slide`},{term:`Arduino IDE / sketch`,definition:`Môi trường soạn và nạp chương trình (sketch) cho board vi điều khiển.`,pages:[197,199],source:`slide`},{term:`setup() và loop()`,definition:`setup chạy một lần khi khởi động; loop chạy lặp vô hạn sau đó.`,pages:[198],source:`slide`},{term:`pinMode / digitalWrite / digitalRead`,definition:`Cấu hình chân INPUT/OUTPUT; ghi HIGH/LOW; đọc trạng thái chân.`,pages:[201,202],source:`slide`},{term:`Serial (UART)`,definition:`Serial.begin(baud), available(), read() (trả mã byte), print/println.`,pages:[203,204],source:`slide`},{term:`Wire (I2C)`,definition:`Thư viện Arduino giao tiếp thiết bị I2C, vd cảm biến khoảng cách SRFxx.`,pages:[205],source:`slide`},{term:`WiFi.begin / WL_CONNECTED`,definition:`Kết nối ESP32 vào mạng WiFi và chờ trạng thái đã kết nối.`,pages:[210],source:`slide`},{term:`HTTPClient`,definition:`Thư viện ESP32: begin, addHeader, GET, POST, getString, end.`,pages:[216,226],source:`slide`},{term:`GET vs POST trên ESP32`,definition:`GET lấy dữ liệu, tham số trên URL; POST gửi dữ liệu trong body để tạo/cập nhật.`,pages:[212,213],source:`slide`},{term:`Content-Type khi POST`,definition:`application/x-www-form-urlencoded, application/json, text/plain.`,pages:[226,227],source:`slide`},{term:`Wokwi`,definition:`Trình mô phỏng ESP32 online, WiFi "Wokwi-GUEST".`,pages:[217,218],source:`slide`},{term:`ArduinoJson`,definition:`Thư viện tạo và phân tích JSON trên Arduino/ESP32.`,pages:[230,231],source:`slide`},{term:`ESP32 web server`,definition:`ESP32 chạy web server để điều khiển GPIO qua trình duyệt.`,pages:[233],source:`slide`},{term:`PubSubClient`,definition:`Thư viện MQTT client cho Arduino/ESP: setServer, setCallback, reconnect, loop.`,pages:[235,236],source:`slide`},{term:`FreeRTOS task`,definition:`xTaskCreate(hàm, tên, stack, tham số, priority, handle) tạo tác vụ chạy song song.`,pages:[238,240],source:`slide`},{term:`vTaskDelay`,definition:`Tạm dừng task một khoảng (tick) và nhường CPU cho task khác.`,pages:[239],source:`slide`}],codeExamples:[{title:`GPIO: nháy LED và đọc nút nhấn`,language:`cpp`,code:`const int buttonPin = 2;
const int ledPin = 13;
int buttonState = 0;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

void loop() {
  buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(100);
}`,explanation:`Mỗi 100 ms đọc nút nhấn ở chân 2 và bật/tắt LED ở chân 13 tương ứng.`,parts:[{lines:`6-7`,note:`Khai báo hướng chân trong setup (chạy một lần).`},{lines:`11`,note:`digitalRead trả HIGH hoặc LOW.`},{lines:`12-16`,note:`Điều khiển LED theo trạng thái nút.`},{lines:`17`,note:`Lặp lại sau 100 ms.`}],pages:[202],source:`slide`},{title:`UART: bật/tắt LED theo ký tự nhận qua Serial`,language:`cpp`,code:`void setup() {
  pinMode(2, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    int c = Serial.read();
    if (c == '0') {
      digitalWrite(2, 0);
    } else if (c == '1') {
      digitalWrite(2, 1);
    }
    Serial.print("Toi nhan duoc: ");
    Serial.println(c);      // in mã ASCII, vd gửi '1' in ra 49
  }
}`,explanation:`Serial.read() trả về giá trị byte (mã ASCII) nên phải so sánh với '0'/'1' (ký tự), không phải 0/1.`,parts:[{lines:`3`,note:`Mở cổng serial 9600 bps.`},{lines:`7`,note:`Chỉ đọc khi có dữ liệu.`},{lines:`9-13`,note:`So sánh với ký tự.`},{lines:`15`,note:`println(int) in số nguyên – mã ASCII của ký tự.`}],pages:[204],source:`slide`},{title:`ESP32 kết nối WiFi và gửi HTTP GET`,language:`cpp`,code:`#include <WiFi.h>
#include <HTTPClient.h>

String serverName = "https://postman-echo.com/get";

void setup() {
  Serial.begin(115200);
  WiFi.begin("Wokwi-GUEST", "", 6);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println("WiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverPath = serverName + "?temp=24.7&humid=30";
    http.begin(serverPath.c_str());
    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) {
      Serial.println(httpResponseCode);
      Serial.println(http.getString());
    } else {
      Serial.print("Error code: "); Serial.println(httpResponseCode);
    }
    http.end();
  }
  delay(3000);
}`,explanation:`Mỗi 3 giây gửi GET kèm dữ liệu cảm biến trên URL tới postman-echo và in phản hồi.`,parts:[{lines:`8-12`,note:`Kết nối WiFi (Wokwi) và chờ WL_CONNECTED.`},{lines:`19`,note:`Dữ liệu đóng gói trên URL.`},{lines:`20-21`,note:`Bắt đầu request và gửi GET.`},{lines:`22-27`,note:`Mã > 0 là có phản hồi; đọc body bằng getString.`},{lines:`28`,note:`Giải phóng tài nguyên.`}],pages:[218],source:`slide`},{title:`ESP32 HTTP POST JSON`,language:`cpp`,code:`HTTPClient http;
float x = 30.5, y = 78;
int motion = 1;
http.begin("https://postman-echo.com/post");
http.addHeader("Content-Type", "application/json");
String httpRequestData = "{\\"temperature\\": " + String(x) +
                         ",\\"humidity\\": " + String(y) +
                         ",\\"motion\\": " + String(motion) + "}";
int httpResponseCode = http.POST(httpRequestData);
Serial.println(http.getString());
http.end();`,explanation:`Ghép chuỗi JSON từ biến cảm biến rồi POST với Content-Type application/json; với dữ liệu phức tạp nên dùng ArduinoJson.`,parts:[{lines:`4-5`,note:`Đặt URL và header JSON.`},{lines:`6-8`,note:`Tạo chuỗi JSON (chú ý escape dấu nháy).`},{lines:`9`,note:`POST trả mã phản hồi.`}],pages:[229],source:`slide`},{title:`Multi-task với FreeRTOS`,language:`cpp`,code:`const int led1 = 2;
void BlinkLED(void *pvParameters);

void setup() {
  Serial.begin(115200);       // slide thiếu dòng này
  pinMode(led1, OUTPUT);      // và dòng này
  xTaskCreate(
    BlinkLED,     // hàm của task
    "Blink LED",  // tên (debug)
    1024,         // stack size (bytes)
    NULL,         // tham số
    1,            // độ ưu tiên
    NULL          // task handle
  );
}

void BlinkLED(void *pvParameters) {
  for (;;) {
    digitalWrite(led1, HIGH);
    vTaskDelay(500 / portTICK_PERIOD_MS);
    digitalWrite(led1, LOW);
    vTaskDelay(500 / portTICK_PERIOD_MS);
    Serial.println("LED is blinking ...");
  }
}

void loop() {}`,explanation:`Task chạy vòng lặp vô hạn, vTaskDelay nhường CPU. Ví dụ slide không khai báo led1, không pinMode và không Serial.begin – bản này đã bổ sung.`,parts:[{lines:`7-14`,note:`6 tham số của xTaskCreate.`},{lines:`18`,note:`Task không bao giờ return.`},{lines:`20`,note:`Chờ 500 ms tính theo tick, không chặn task khác.`},{lines:`27`,note:`loop có thể để trống khi mọi việc nằm trong task.`}],pages:[238,239,240],source:`slide`}],figures:[{page:197,caption:`Board Arduino Uno`},{page:206,caption:`Cài ESP32 trong Boards Manager`},{page:214,caption:`ESP32 gửi HTTP GET`},{page:217,caption:`Mô phỏng ESP32 trên Wokwi`},{page:237,caption:`FreeRTOS multi-tasking`}],flashcards:[{id:`fc-01`,front:`3 nhóm thiết bị IoT theo hiệu năng?`,back:`Vi điều khiển 8-bit không OS; 32-bit với RTOS (ESP32); 32/64-bit với OS đầy đủ (Raspberry Pi).`,pages:[192,193,194],source:`slide`},{id:`fc-02`,front:`3 chuẩn giao tiếp ngoại vi phổ biến?`,back:`UART, SPI, I2C.`,pages:[192],source:`slide`},{id:`fc-03`,front:`Ví dụ thiết bị 32-bit có WiFi?`,back:`ESP8266, ESP32, Arduino Uno WiFi.`,pages:[193],source:`slide`},{id:`fc-04`,front:`Raspberry Pi giao tiếp ngoại vi thế nào?`,back:`Qua cơ chế driver trên hệ điều hành; dùng được thư viện Python, Java, OpenCV…`,pages:[194],source:`slide`},{id:`fc-05`,front:`Arduino Uno dùng vi điều khiển nào?`,back:`ATmega328.`,pages:[197],source:`slide`},{id:`fc-06`,front:`setup() và loop() chạy thế nào?`,back:`setup một lần khi khởi động; loop lặp vô hạn.`,pages:[198],source:`slide`},{id:`fc-07`,front:`Cấu hình chân 2 làm output?`,back:"`pinMode(2, OUTPUT);`",pages:[201],source:`slide`},{id:`fc-08`,front:`Đọc trạng thái nút nhấn?`,back:"`digitalRead(buttonPin)` trả HIGH/LOW.",pages:[202],source:`slide`},{id:`fc-09`,front:`Mở cổng Serial 9600 bps?`,back:"`Serial.begin(9600);`",pages:[203],source:`slide`},{id:`fc-10`,front:`Serial.read() trả về gì?`,back:`Byte nhận được (mã ASCII), hoặc -1 nếu không có dữ liệu.`,pages:[203,204],source:`slide`},{id:`fc-11`,front:`Thư viện I2C trên Arduino?`,back:`Wire.`,pages:[205],source:`slide`},{id:`fc-12`,front:`Kết nối ESP32 vào WiFi?`,back:"`WiFi.begin(ssid, password)` rồi chờ `WiFi.status() == WL_CONNECTED`.",pages:[210],source:`slide`},{id:`fc-13`,front:`GET và POST khác nhau?`,back:`GET lấy dữ liệu, tham số trên URL; POST gửi dữ liệu trong body.`,pages:[212,213],source:`slide`},{id:`fc-14`,front:`Các bước gửi HTTP GET bằng HTTPClient?`,back:`begin(url) → GET() → getString() → end().`,pages:[216],source:`slide`},{id:`fc-15`,front:`httpResponseCode âm nghĩa là gì?`,back:`Lỗi phía client (không gửi được request).`,pages:[216],source:`slide`},{id:`fc-16`,front:`3 kiểu dữ liệu khi POST?`,back:`URL-encoded, JSON object, plain text.`,pages:[225],source:`slide`},{id:`fc-17`,front:`Header cho POST url-encoded?`,back:`Content-Type: application/x-www-form-urlencoded.`,pages:[226],source:`slide`},{id:`fc-18`,front:`WiFi mô phỏng trên Wokwi?`,back:`"Wokwi-GUEST" không mật khẩu.`,pages:[218],source:`slide`},{id:`fc-19`,front:`Thư viện JSON cho Arduino?`,back:`ArduinoJson.`,pages:[230],source:`slide`},{id:`fc-20`,front:`Thư viện MQTT cho ESP32/ESP8266?`,back:`PubSubClient.`,pages:[235],source:`slide`},{id:`fc-21`,front:`Cấu hình broker trong PubSubClient?`,back:"`client.setServer(mqtt_server, 1883); client.setCallback(callback);`",pages:[236],source:`slide`},{id:`fc-22`,front:`6 tham số của xTaskCreate?`,back:`Hàm, tên, stack size, tham số, priority, task handle.`,pages:[238],source:`slide`},{id:`fc-23`,front:`Vì sao task FreeRTOS dùng vTaskDelay thay delay?`,back:`vTaskDelay nhường CPU cho task khác trong thời gian chờ.`,pages:[239],source:`slide`},{id:`fc-24`,front:`Hàm task có return không?`,back:`Không – chạy vòng lặp vô hạn for(;;).`,pages:[239],source:`slide`}],quiz:[{id:`q-01`,level:`nhớ`,question:`Thiết bị nào thuộc nhóm vi xử lý 32/64-bit hiệu năng cao chạy hệ điều hành đầy đủ?`,options:[`Raspberry Pi`,`ESP8266`,`ATmega328`,`PIC`],answer:0,explanation:`Raspberry Pi dùng Embedded Linux/Raspbian; ESP8266 là nhóm 32-bit trung bình.`,pages:[193,194],source:`slide`},{id:`q-02`,level:`hiểu`,question:`Trong sketch Arduino, hàm setup() được gọi khi nào?`,options:[`Lặp liên tục`,`Một lần khi khởi động`,`Khi có ngắt`,`Mỗi 1 giây`],answer:1,explanation:`setup: giá trị khởi tạo khi hệ thống khởi động; loop chạy lặp.`,pages:[198],source:`slide`},{id:`q-03`,level:`vận dụng`,question:`Chương trình sau làm LED ở chân 2 thế nào?`,code:{language:`cpp`,code:`void setup() { pinMode(2, OUTPUT); }
void loop() {
  digitalWrite(2, HIGH); delay(1000);
  digitalWrite(2, LOW);  delay(1000);
}`},options:[`Sáng liên tục`,`Tắt liên tục`,`Nhấp nháy: sáng 1 giây, tắt 1 giây`,`Nhấp nháy 1 lần rồi dừng`],answer:2,explanation:`loop lặp vô hạn bật 1 s, tắt 1 s.`,pages:[201],source:`slide`},{id:`q-04`,level:`vận dụng`,question:`Trên Serial Monitor gửi ký tự '1'. Đoạn code in ra gì?`,code:{language:`cpp`,code:`int c = Serial.read();
Serial.print("Toi nhan duoc: ");
Serial.println(c);`},options:[`Toi nhan duoc: 1`,`Không in gì`,`Toi nhan duoc: '1'`,`Toi nhan duoc: 49`],answer:3,explanation:`Serial.read trả mã ASCII; '1' = 49; println(int) in số.`,pages:[204],source:`bổ sung`},{id:`q-05`,level:`vận dụng`,question:"Đoạn code sau so sánh `if (c == 1)` thay vì `c == '1'`. Gửi ký tự '1' thì LED có bật không?",code:{language:`cpp`,code:`int c = Serial.read();
if (c == 1) digitalWrite(2, 1);`},options:[`Không – c là 49 (mã ASCII của '1'), không bằng 1`,`Có`,`Có, vì C++ tự chuyển kiểu`,`Chương trình lỗi biên dịch`],answer:0,explanation:`Slide so sánh với '0', '1' (ký tự) là đúng.`,pages:[204],source:`slide`},{id:`q-06`,level:`nhớ`,question:`Thư viện Arduino dùng cho giao tiếp I2C?`,options:[`Serial`,`Wire`,`SPI.h`,`HTTPClient`],answer:1,explanation:`Ví dụ 3: Giao tiếp I2C sử dụng thư viện Wire.`,pages:[205],source:`slide`},{id:`q-07`,level:`hiểu`,question:"Vòng `while (WiFi.status() != WL_CONNECTED) delay(500);` dùng để?",options:[`Ngắt WiFi`,`Gửi dữ liệu`,`Chờ tới khi ESP32 kết nối xong WiFi`,`Quét mạng`],answer:2,explanation:`Kết nối WiFi rồi chờ trạng thái WL_CONNECTED.`,pages:[210],source:`slide`},{id:`q-08`,level:`vận dụng`,question:`ESP32 cần gửi dữ liệu cảm biến để server tạo bản ghi mới, dữ liệu là JSON. Dùng lệnh nào?`,options:[`http.GET() với JSON trên URL`,`Serial.println(json)`,`http.begin(json)`,`http.addHeader("Content-Type","application/json"); http.POST(json)`],answer:3,explanation:`POST gửi dữ liệu trong body để create/update; JSON cần header application/json.`,pages:[213,227],source:`slide`},{id:`q-09`,level:`hiểu`,question:"Trong ví dụ HTTP GET, điều kiện `httpResponseCode > 0` nghĩa là?",options:[`Đã nhận được phản hồi HTTP từ server (có mã trạng thái)`,`Luôn là 200`,`WiFi đã kết nối`,`Body rỗng`],answer:0,explanation:`Mã dương là mã HTTP; mã âm là lỗi phía thư viện client (kiến thức HTTPClient).`,pages:[216],source:`bổ sung`},{id:`q-10`,level:`nhớ`,question:`Thư viện MQTT client dùng cho ESP32 trên slide?`,options:[`Paho`,`PubSubClient`,`RabbitMQ`,`Mosquitto`],answer:1,explanation:`Sử dụng thư viện mqtt PubSubClient cho Arduino.`,pages:[235],source:`slide`},{id:`q-11`,level:`vận dụng`,question:'Trong `xTaskCreate(BlinkLED, "Blink LED", 1024, NULL, 1, NULL);`, giá trị 1024 là gì?',options:[`Độ ưu tiên`,`Chu kỳ nháy (ms)`,`Kích thước stack (byte)`,`ID task`],answer:2,explanation:`Tham số thứ 3: stack size (bytes); thứ 5: priority.`,pages:[238],source:`slide`},{id:`q-12`,level:`hiểu`,question:`Vì sao trong task FreeRTOS nên dùng vTaskDelay thay vì delay?`,options:[`vTaskDelay chính xác hơn tới ns`,`vTaskDelay tắt WiFi`,`delay không tồn tại trên ESP32`,`vTaskDelay đưa task vào trạng thái chờ và nhường CPU cho task khác`],answer:3,explanation:`Pause the task – các task khác vẫn chạy (bổ sung giải thích).`,pages:[239],source:`bổ sung`},{id:`q-13`,level:`vận dụng`,question:`Chương trình FreeRTOS trên slide (tr. 240) không gọi pinMode(led1, OUTPUT) và Serial.begin. Hệ quả có thể là?`,options:[`LED có thể không sáng đúng và Serial.println không hiển thị`,`Không ảnh hưởng gì`,`Lỗi biên dịch xTaskCreate`,`Task không được tạo`],answer:0,explanation:`Chân chưa cấu hình output và cổng Serial chưa khởi tạo.`,pages:[240],source:`bổ sung`}],examQuestions:[{id:`ex-01`,question:`Phân loại các thiết bị IoT theo năng lực xử lý và cho ví dụ. Trình bày cấu trúc chương trình Arduino và viết chương trình đọc nút nhấn để bật/tắt LED.`,hints:`- 3 nhóm thiết bị [tr. 192](#p192)–[tr. 194](#p194).
- setup/loop [tr. 198](#p198).
- pinMode, digitalRead, digitalWrite, delay [tr. 201](#p201)–[tr. 202](#p202).`,pages:[192,193,194,198,202],source:`slide`},{id:`ex-02`,question:`Viết chương trình ESP32 kết nối WiFi, đọc giá trị nhiệt độ (giả lập) và gửi lên server mỗi 5 giây bằng HTTP POST JSON. Giải thích từng bước.`,hints:`- WiFi.begin, WL_CONNECTED [tr. 210](#p210).
- HTTPClient: begin, addHeader application/json, POST, getString, end [tr. 227](#p227)–[tr. 229](#p229).
- Kiểm tra WiFi trước khi gửi, delay(5000) [tr. 216](#p216).
- Có thể dùng ArduinoJson [tr. 230](#p230).`,pages:[210,216,227,229,230],source:`slide`},{id:`ex-03`,question:`So sánh giao tiếp HTTP và MQTT trên ESP32. Mô tả cấu trúc chương trình MQTT với PubSubClient.`,hints:`- HTTP GET/POST, request/response [tr. 212](#p212)–[tr. 213](#p213).
- PubSubClient: WiFiClient, setServer 1883, setCallback, reconnect, loop [tr. 235](#p235)–[tr. 236](#p236).
- MQTT nhẹ, pub/sub, giữ kết nối; HTTP đơn giản, mỗi lần một request.`,pages:[212,213,235,236],source:`slide`},{id:`ex-04`,question:`Lập trình đa nhiệm với FreeRTOS trên ESP32: giải thích xTaskCreate và vTaskDelay; viết chương trình 2 task: nháy LED mỗi 500 ms và in dữ liệu cảm biến mỗi 2 giây.`,hints:`- xTaskCreate 6 tham số [tr. 238](#p238).
- Hàm task for(;;) và vTaskDelay [tr. 239](#p239).
- Ví dụ đầy đủ, lưu ý pinMode/Serial.begin [tr. 240](#p240).`,pages:[237,238,239,240],source:`slide`}]};export{e as default};