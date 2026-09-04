# Feature Specification: Sidebar Legacy Design and Interaction Parity

**Feature Branch**: `ui/migrate-layout`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "Bổ sung cho tính năng layout (sidebar). Sidebar hiện tại chưa khớp với thiết kế và hành vi khi bấm vào một menu item so với reference-old/src. Hãy kiểm tra lại."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nhận diện sidebar quen thuộc (Priority: P1)

Là người dùng đã đăng nhập, tôi muốn sidebar có cùng cấu trúc, kích thước và mật độ hiển thị như sản phẩm cũ để có thể tiếp tục thao tác theo thói quen mà không phải học lại giao diện.

**Why this priority**: Sai lệch về kích thước, khoảng cách và phân cấp làm thay đổi toàn bộ vùng làm việc và khiến người dùng khó nhận biết chức năng.

**Independent Test**: Mở cùng một trang và cùng trạng thái sidebar ở sản phẩm hiện tại và bản tham chiếu, sau đó so sánh từng vùng từ logo đến chân sidebar tại cùng kích thước màn hình.

**Acceptance Scenarios**:

1. **Given** người dùng mở một trang được bảo vệ với sidebar thu gọn, **When** giao diện hiển thị, **Then** logo, avatar, hai vùng thông báo, các biểu tượng menu, đường phân cách và hai điều khiển cuối trang xuất hiện đúng thứ tự, kích thước và căn chỉnh của bản tham chiếu.
2. **Given** người dùng mở rộng sidebar, **When** quá trình chuyển trạng thái kết thúc, **Then** logo TMMS, thông tin người dùng, thông báo, nhãn menu, menu con, đường phân cách và khu vực cuối trang khớp với bố cục bản tham chiếu.
3. **Given** nội dung menu dài hơn chiều cao màn hình, **When** người dùng cuộn menu, **Then** chỉ vùng điều hướng cuộn còn phần đầu và phần cuối sidebar vẫn giữ đúng vị trí.

---

### User Story 2 - Chọn menu trong sidebar mở rộng (Priority: P1)

Là người dùng, tôi muốn mỗi lần bấm menu trong sidebar mở rộng tạo ra đúng kết quả như sản phẩm cũ để luôn biết thao tác sẽ mở nhóm hay chuyển đến chức năng.

**Why this priority**: Đây là đường đi chính tới các phân hệ; hành vi không nhất quán có thể đưa người dùng tới sai nơi hoặc làm họ tưởng thao tác không hoạt động.

**Independent Test**: Trong sidebar mở rộng, lần lượt chọn một mục trực tiếp, một nhóm cấp một, một đích cấp hai và một đích cấp ba; xác nhận kết quả, trạng thái mở và dấu hiệu đang chọn sau từng thao tác.

**Acceptance Scenarios**:

1. **Given** một mục cấp một là đích đến trực tiếp, **When** người dùng chọn mục đó, **Then** nội dung tương ứng được mở và mục được đánh dấu đang hoạt động.
2. **Given** một mục cấp một chứa menu con, **When** người dùng chọn phần hàng của mục, **Then** nhóm chỉ mở hoặc đóng menu con và không chuyển sang một trang khác.
3. **Given** một menu con là đích đến, **When** người dùng chọn mục đó, **Then** nội dung tương ứng được mở, mục con được đánh dấu đang hoạt động và nhóm cha được đánh dấu đang chứa vị trí hiện tại.
4. **Given** đích hiện tại nằm trong một nhóm đang đóng, **When** vị trí hiện tại thay đổi do chọn menu hoặc mở trực tiếp đường dẫn, **Then** nhóm cha tự mở để mục đang hoạt động được nhìn thấy.
5. **Given** người dùng chọn bất kỳ đích đến đã cấu hình nào, **When** điều hướng hoàn tất, **Then** hệ thống hiển thị đúng chức năng tương ứng của bản tham chiếu, không đưa tới trang không tồn tại, trang sai chức năng hoặc nội dung trống.

---

### User Story 3 - Chọn menu nhiều cấp trong sidebar thu gọn (Priority: P1)

Là người dùng thích sidebar thu gọn, tôi muốn dùng popup phân cấp giống sản phẩm cũ để vẫn truy cập được đầy đủ các chức năng mà không cần mở rộng sidebar.

**Why this priority**: Sidebar mặc định thu gọn; nếu popup làm phẳng sai phân cấp hoặc đóng/mở sai, các mục cấp ba trở nên khó hiểu và khó truy cập.

**Independent Test**: Ở trạng thái thu gọn, mở một nhóm hai cấp và nhóm Hệ thống ba cấp; kiểm tra vị trí, phân cấp, thao tác mở popup tiếp theo, chọn đích và đóng popup.

**Acceptance Scenarios**:

1. **Given** sidebar đang thu gọn, **When** người dùng chọn biểu tượng của nhóm, **Then** popup cấp hai mở bên cạnh biểu tượng được chọn, có tiêu đề nhóm và chỉ một popup cấp một hoạt động tại một thời điểm.
2. **Given** popup cấp hai chứa một nhóm cấp ba, **When** người dùng chọn hàng của nhóm cấp ba, **Then** một popup cấp ba mở cạnh hàng đó và thao tác không điều hướng.
3. **Given** popup cấp ba không đủ chỗ ở bên phải, **When** popup được mở, **Then** nó đổi phía hoặc điều chỉnh vị trí để vẫn nằm trong vùng nhìn thấy.
4. **Given** một đích đến trong popup được chọn, **When** điều hướng bắt đầu, **Then** toàn bộ popup liên quan đóng và đích đã chọn trở thành vị trí hoạt động.
5. **Given** popup đang mở, **When** người dùng chọn ra ngoài sidebar và popup, **Then** popup đóng mà không làm thay đổi trang hiện tại.

---

### User Story 4 - Chỉ thấy các chức năng được phép sử dụng (Priority: P2)

Là người dùng có phạm vi quyền cụ thể, tôi muốn sidebar chỉ hiển thị những đích đến mình được sử dụng để không gặp liên kết bị từ chối hoặc nhóm menu rỗng.

**Why this priority**: Đây là hành vi có trong bản tham chiếu và bảo đảm cấu trúc menu phản ánh đúng quyền truy cập của từng người dùng.

**Independent Test**: Dùng một tài khoản có tập quyền giới hạn ở cả hai trạng thái sidebar; xác nhận các đích không có quyền bị ẩn và mọi nhóm không còn đích hiển thị cũng bị ẩn.

**Acceptance Scenarios**:

1. **Given** người dùng không có quyền với một đích đến, **When** sidebar hoặc popup hiển thị, **Then** đích đó không xuất hiện.
2. **Given** toàn bộ đích con của một nhóm bị ẩn theo quyền, **When** sidebar hiển thị, **Then** nhóm cha cũng không xuất hiện.
3. **Given** người dùng có quyền với ít nhất một đích trong nhóm nhiều cấp, **When** mở nhóm, **Then** chỉ các nhánh dẫn tới đích được phép xuất hiện và vẫn giữ đúng nhãn phân cấp.

### Edge Cases

- Đường dẫn hiện tại có thêm đoạn định danh hoặc tham số phía sau đích menu; mục đích và toàn bộ nhóm cha vẫn được đánh dấu hoạt động.
- Người dùng chuyển từ sidebar thu gọn sang mở rộng khi đang ở một đích thuộc nhóm vốn đóng mặc định; nhóm cha phải mở để lộ đích hiện tại.
- Người dùng đóng thủ công nhóm chứa đích hiện tại rồi chuyển sang một đường dẫn khác trong chính nhóm đó; nhóm phải tự mở lại theo vị trí mới.
- Popup được mở ở gần mép dưới hoặc mép phải màn hình; popup phải tự điều chỉnh vị trí và cho phép cuộn nếu nội dung vượt quá vùng nhìn thấy.
- Người dùng chọn liên tục hai biểu tượng nhóm khác nhau; popup cũ đóng và chỉ popup của nhóm cuối cùng còn hiển thị.
- Một mục có nhãn dài hoặc người dùng có tên/vai trò dài; nội dung được rút gọn mà không làm thay đổi chiều rộng sidebar hoặc che các điều khiển khác.
- Trạng thái thu gọn đã lưu bị thiếu hoặc không hợp lệ; sidebar trở về trạng thái mặc định thu gọn của bản tham chiếu.
- Đích đến chưa được migrate hoặc tạm thời không khả dụng; người dùng nhận được trạng thái không khả dụng rõ ràng thay vì trang trắng, sai trang hoặc liên kết không phản hồi.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sidebar MUST có hai trạng thái với chiều rộng quan sát được là 48 pixel khi thu gọn và 238 pixel khi mở rộng; vùng nội dung MUST dịch chuyển tương ứng và không bị sidebar che phủ.
- **FR-002**: Khi chưa có lựa chọn hợp lệ được lưu cho phiên hiện tại, sidebar MUST khởi tạo ở trạng thái thu gọn.
- **FR-003**: Hệ thống MUST giữ lựa chọn thu gọn hoặc mở rộng trong suốt phiên trình duyệt hiện tại.
- **FR-004**: Một mục cấp một có đích đến MUST chuyển người dùng đến đúng chức năng tương ứng khi được chọn.
- **FR-005**: Một mục cấp một có menu con MUST chỉ mở hoặc đóng nhóm khi được chọn và MUST NOT tự điều hướng.
- **FR-006**: Ở trạng thái mở rộng, các nhóm `Tìm kiếm truy vết`, `Kiểm soát giao thông`, `Quản lý xe bus`, `Quản lý đội xe`, `Thống kê & báo cáo` và `Hệ thống` MUST mở mặc định; nhóm `Giám sát` MUST đóng mặc định, đúng với bản tham chiếu.
- **FR-007**: Khi vị trí hiện tại thuộc một nhóm menu, hệ thống MUST tự mở nhóm đó sau mọi thay đổi đường dẫn để mục đang hoạt động nhìn thấy được trong sidebar mở rộng.
- **FR-008**: Hệ thống MUST xác định trạng thái hoạt động bằng cả đích chính xác và các đường dẫn con của đích đó.
- **FR-009**: Đích hiện tại MUST có dấu hiệu hoạt động; mọi nhóm tổ tiên của đích MUST có dấu hiệu đang chứa vị trí hiện tại.
- **FR-010**: Khi sidebar thu gọn, chọn biểu tượng nhóm MUST mở hoặc đóng popup cấp hai ở cạnh phải biểu tượng; chọn một biểu tượng nhóm khác MUST thay thế popup đang mở.
- **FR-011**: Trong popup thu gọn, nhóm trung gian có con MUST mở hoặc đóng popup cấp ba riêng khi được chọn và MUST NOT bị trình bày như một tiêu đề tĩnh hoặc một đích điều hướng.
- **FR-012**: Popup cấp hai và cấp ba MUST giữ tiêu đề, hàng mục, cỡ chữ, khoảng cách, màu nền, viền, bo góc, bóng đổ và dấu hiệu hoạt động tương đương bản tham chiếu.
- **FR-013**: Popup MUST tự chọn vị trí phù hợp với không gian khả dụng, không bị cắt khỏi vùng nhìn thấy và MUST cho phép cuộn khi nội dung cao hơn vùng hiển thị.
- **FR-014**: Chọn một đích trong popup MUST đóng toàn bộ popup liên quan; chọn bên ngoài sidebar và popup MUST đóng popup mà không điều hướng.
- **FR-015**: Mọi mục menu MUST mở đúng chức năng tương ứng được xác định trong bản tham chiếu; các thay đổi tên đường dẫn nội bộ chỉ được chấp nhận khi vẫn có ánh xạ một-một tới cùng chức năng và không làm thay đổi kết quả người dùng quan sát được.
- **FR-016**: Các mục `Bản đồ` và `Báo cáo` MUST lần lượt mở đúng chức năng tương ứng với các đích `/map` và `/statistic` của bản tham chiếu; không được ánh xạ sang chức năng khác chỉ vì tên đường dẫn hiện tại khác.
- **FR-017**: Nếu một đích được cấu hình nhưng chức năng chưa khả dụng, hệ thống MUST đưa ra trạng thái không khả dụng rõ ràng và MUST NOT âm thầm đưa người dùng về trang mặc định.
- **FR-018**: Sidebar MUST chỉ hiển thị các đích người dùng được phép sử dụng và MUST ẩn mọi nhóm không còn đích con nào được phép hiển thị.
- **FR-019**: Cấu trúc menu MUST giữ nguyên nhãn tiếng Việt, thứ tự nhóm, biểu tượng, quan hệ cấp một/cấp hai/cấp ba và vị trí đường phân cách của bản tham chiếu.
- **FR-020**: Mọi hàng menu và điều khiển popup MUST sử dụng được bằng bàn phím, có tên truy cập được, thể hiện trạng thái mở/đóng và có chỉ báo focus nhìn thấy rõ.
- **FR-021**: Việc sửa sidebar MUST không làm thay đổi hành vi đăng xuất, vùng thông báo hoặc khả năng sử dụng nội dung trang bên cạnh ngoài những điều chỉnh cần thiết để khớp bản tham chiếu.

### UI Fidelity Requirements

- **UIR-001**: Nguồn chân lý cho cấu trúc và hành vi là `reference-old/src/components/Menu.jsx`; `reference-old/src/components/Layout.jsx` và `reference-old/src/App.jsx` xác định quan hệ giữa sidebar, vùng nội dung và đích chức năng.
- **UIR-002**: Trạng thái thu gọn MUST giữ chiều rộng 48 pixel, logo cao 44 pixel, vùng avatar cao 48 pixel, hai hàng thông báo cao 36 pixel, hàng menu cao 34 pixel, đường phân cách rộng 22 pixel và khu vực chân sidebar cao 77 pixel như bản tham chiếu.
- **UIR-003**: Trạng thái mở rộng MUST giữ chiều rộng 238 pixel, vùng logo cao 44 pixel, vùng người dùng cao 48 pixel, hàng menu cấp một cao 30 pixel và hàng con cao 24 pixel như bản tham chiếu.
- **UIR-004**: Sidebar MUST giữ nền trắng, viền xám nhạt, thương hiệu xanh đậm, chữ xám đậm, nền xanh rất nhạt và viền trái xanh cho trạng thái hoạt động, cùng mật độ khoảng cách của bản tham chiếu.
- **UIR-005**: Popup thu gọn MUST xuất hiện sát cạnh mục kích hoạt, có tiêu đề tách biệt, hàng mục dễ đọc và hệ thống popup cấp ba đặt cạnh hàng trung gian; không được làm phẳng toàn bộ cấp ba vào một popup duy nhất.
- **UIR-006**: Việc chuyển chiều rộng sidebar và độ lệch vùng nội dung MUST diễn ra đồng bộ, liên tục và hoàn tất trong không quá 500 mili giây.
- **UIR-007**: Không được đưa ra hướng thiết kế sidebar mới trong feature này; mọi sai lệch cố ý so với ba file tham chiếu MUST có yêu cầu sản phẩm riêng và được ghi nhận trước khi triển khai.

### Key Entities

- **Navigation Item**: Một mục điều hướng có khóa nhận diện, nhãn, biểu tượng, đích tùy chọn, quyền truy cập tùy chọn, trạng thái hoạt động và danh sách mục con tùy chọn.
- **Navigation Group**: Một mục không điều hướng trực tiếp, dùng để tổ chức các mục con và có trạng thái mở/đóng hoặc popup đang mở.
- **Navigation Destination Mapping**: Quan hệ một-một giữa nhãn chức năng trong menu cũ và đích chức năng tương ứng trong ứng dụng hiện tại.
- **Sidebar Session Preference**: Lựa chọn thu gọn hoặc mở rộng được giữ cho phiên trình duyệt hiện tại.
- **Active Navigation Location**: Đích khớp đường dẫn hiện tại và chuỗi nhóm tổ tiên cần được đánh dấu hoặc tự mở.
- **Access Entitlement**: Quyền của người dùng quyết định một đích và các nhóm tổ tiên của nó có được hiển thị hay không.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Kiểm tra trực quan tại các kích thước màn hình desktop được hỗ trợ xác nhận 100% vùng sidebar, kích thước hàng, thứ tự thành phần, màu trạng thái và đường phân cách nêu trong yêu cầu không có sai lệch chưa được phê duyệt so với bản tham chiếu.
- **SC-002**: 100% mục menu trực tiếp, cấp hai và cấp ba được kiểm thử mở đúng chức năng tương ứng hoặc trạng thái không khả dụng rõ ràng chỉ bằng một lần chọn tại mục đích.
- **SC-003**: 100% kiểm thử thay đổi đường dẫn, gồm mở trực tiếp đường dẫn con, hiển thị đúng mục hoạt động và tự mở đầy đủ nhóm cha trong sidebar mở rộng.
- **SC-004**: Trong 100% kiểm thử sidebar thu gọn, popup hai cấp và ba cấp mở đúng mục kích hoạt, không vượt khỏi vùng nhìn thấy và đóng đúng khi chọn đích hoặc chọn ra ngoài.
- **SC-005**: Ma trận đối chiếu menu xác nhận 100% nhãn, thứ tự, phân cấp và ánh xạ chức năng đang hoạt động khớp với bản tham chiếu, ngoại trừ các sai lệch có phê duyệt sản phẩm bằng văn bản.
- **SC-006**: Với mỗi tập quyền đại diện được kiểm thử, 100% đích không được phép và nhóm rỗng bị ẩn, trong khi mọi đích được phép vẫn truy cập được.
- **SC-007**: Người dùng chỉ dùng bàn phím có thể mở, đóng và chọn mọi mục menu hiển thị ở cả hai trạng thái sidebar mà không bị kẹt focus hoặc cần con trỏ.
- **SC-008**: Ít nhất 95% người dùng thử nghiệm hoàn thành việc tìm và mở một chức năng trực tiếp, một chức năng cấp hai và một chức năng cấp ba ngay lần đầu mà không chọn nhầm nhóm hoặc đích.

## Assumptions

- Feature này là phần bổ sung sửa sai lệch sau feature `003-common-layout-migration`, không thay thế đặc tả layout chung và không tạo hướng thiết kế mới.
- Ba file tham chiếu được nêu trong UI Fidelity Requirements là nguồn chân lý hiện hành cho sidebar; mã hiện tại chỉ được dùng để nhận diện khoảng cách cần sửa.
- Tên đường dẫn trong ứng dụng mới có thể khác bản cũ, nhưng mỗi nhãn menu phải giữ nguyên ý nghĩa và mở đúng chức năng tương ứng.
- Dữ liệu phiên đăng nhập hiện có cung cấp thông tin quyền cần thiết để quyết định mục nào được hiển thị; thay đổi mô hình phân quyền nằm ngoài phạm vi feature này.
- Nội dung nghiệp vụ bên trong từng trang đích nằm ngoài phạm vi; feature chỉ bảo đảm lựa chọn menu đưa người dùng tới đúng trang hoặc trạng thái không khả dụng rõ ràng.
- Dữ liệu thông báo, số lượng chưa đọc và hành vi chọn thông báo không thuộc phạm vi sửa đổi, nhưng vị trí và kích thước các điều khiển thông báo vẫn phải khớp bản tham chiếu.
- Phạm vi kiểm tra chính là giao diện desktop giống sản phẩm cũ; thiết kế điều hướng riêng cho màn hình di động cần một feature khác.
