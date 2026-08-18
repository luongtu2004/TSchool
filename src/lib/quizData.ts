/**
 * quizData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock data layer – simulates fetching quiz questions from a backend / PDF
 * extraction service.
 *
 * Structure per question:
 *  id          : unique identifier
 *  question    : question text
 *  options     : array of { key, text } – always A, B, C, D
 *  answer      : the correct key ("A" | "B" | "C" | "D")
 *  explanation : optional brief explanation shown in Result view
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type OptionKey = "A" | "B" | "C" | "D";

export interface Option {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  answer: OptionKey;
  explanation?: string;
  imageUrl?: string;
  examId?: number;
}

export interface Exam {
  id: number;
  name: string;
  description?: string;
  questionCount?: number;
  created_at?: string;
}

// ─── 30 mock questions extracted / adapted from Tschool curriculum ────────────
const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Đơn vị nào sau đây là đơn vị cơ bản của dung lượng lưu trữ dữ liệu?",
    options: [
      { key: "A", text: "Kilobyte (KB)" },
      { key: "B", text: "Megabyte (MB)" },
      { key: "C", text: "Bit" },
      { key: "D", text: "Byte" },
    ],
    answer: "D",
    explanation: "Byte là đơn vị cơ bản, gồm 8 bit. Các đơn vị lớn hơn (KB, MB…) đều được quy đổi từ Byte.",
  },
  {
    id: 2,
    question: "Giao thức nào được sử dụng để truyền trang web từ máy chủ đến trình duyệt?",
    options: [
      { key: "A", text: "FTP" },
      { key: "B", text: "SMTP" },
      { key: "C", text: "HTTP/HTTPS" },
      { key: "D", text: "SSH" },
    ],
    answer: "C",
    explanation: "HTTP (HyperText Transfer Protocol) và phiên bản bảo mật HTTPS là giao thức nền tảng của World Wide Web.",
  },
  {
    id: 3,
    question: "Trong HTML, thẻ nào dùng để tạo liên kết (hyperlink)?",
    options: [
      { key: "A", text: "<link>" },
      { key: "B", text: "<a>" },
      { key: "C", text: "<href>" },
      { key: "D", text: "<url>" },
    ],
    answer: "B",
    explanation: "Thẻ <a> (anchor) cùng thuộc tính href tạo ra hyperlink trong HTML.",
  },
  {
    id: 4,
    question: "CSS là viết tắt của?",
    options: [
      { key: "A", text: "Creative Style Sheets" },
      { key: "B", text: "Computer Style Sheets" },
      { key: "C", text: "Cascading Style Sheets" },
      { key: "D", text: "Colorful Style Sheets" },
    ],
    answer: "C",
    explanation: "CSS – Cascading Style Sheets – là ngôn ngữ mô tả cách trình bày tài liệu HTML.",
  },
  {
    id: 5,
    question: "Phương thức HTTP nào thường dùng để GỬI dữ liệu lên máy chủ (ví dụ: form đăng ký)?",
    options: [
      { key: "A", text: "GET" },
      { key: "B", text: "DELETE" },
      { key: "C", text: "POST" },
      { key: "D", text: "PUT" },
    ],
    answer: "C",
    explanation: "POST gửi dữ liệu trong body của request – phù hợp cho đăng ký, đăng nhập, tạo tài nguyên mới.",
  },
  {
    id: 6,
    question: "JavaScript thuộc loại ngôn ngữ lập trình nào?",
    options: [
      { key: "A", text: "Ngôn ngữ biên dịch (Compiled)" },
      { key: "B", text: "Ngôn ngữ thông dịch (Interpreted)" },
      { key: "C", text: "Ngôn ngữ assembly" },
      { key: "D", text: "Ngôn ngữ máy" },
    ],
    answer: "B",
    explanation: "JavaScript được thông dịch (và JIT-compiled) bởi engine trình duyệt, không cần bước biên dịch trước.",
  },
  {
    id: 7,
    question: "React sử dụng khái niệm nào để tối ưu việc cập nhật DOM?",
    options: [
      { key: "A", text: "Real DOM" },
      { key: "B", text: "Shadow DOM" },
      { key: "C", text: "Virtual DOM" },
      { key: "D", text: "Document Fragment" },
    ],
    answer: "C",
    explanation: "Virtual DOM là bản sao nhẹ của DOM thật; React so sánh diff rồi chỉ cập nhật phần thay đổi.",
  },
  {
    id: 8,
    question: "Hook nào trong React dùng để quản lý trạng thái cục bộ (local state) của component?",
    options: [
      { key: "A", text: "useEffect" },
      { key: "B", text: "useContext" },
      { key: "C", text: "useRef" },
      { key: "D", text: "useState" },
    ],
    answer: "D",
    explanation: "useState trả về cặp [state, setState] – công cụ cơ bản nhất để quản lý state trong functional component.",
  },
  {
    id: 9,
    question: "SQL là viết tắt của?",
    options: [
      { key: "A", text: "Structured Query Language" },
      { key: "B", text: "Simple Question Language" },
      { key: "C", text: "Sequential Query Logic" },
      { key: "D", text: "Standard Query List" },
    ],
    answer: "A",
    explanation: "SQL (Structured Query Language) là ngôn ngữ truy vấn cơ sở dữ liệu quan hệ tiêu chuẩn.",
  },
  {
    id: 10,
    question: "Câu lệnh SQL nào dùng để lấy toàn bộ dữ liệu từ bảng 'users'?",
    options: [
      { key: "A", text: "GET * FROM users" },
      { key: "B", text: "SELECT ALL users" },
      { key: "C", text: "SELECT * FROM users" },
      { key: "D", text: "FETCH * users" },
    ],
    answer: "C",
    explanation: "SELECT * FROM table_name là cú pháp cơ bản nhất để lấy toàn bộ cột và hàng trong SQL.",
  },
  {
    id: 11,
    question: "Trong lập trình hướng đối tượng (OOP), 'tính kế thừa' (Inheritance) cho phép?",
    options: [
      { key: "A", text: "Ẩn đi chi tiết bên trong của đối tượng" },
      { key: "B", text: "Một lớp con kế thừa thuộc tính và phương thức từ lớp cha" },
      { key: "C", text: "Nhiều hành vi khác nhau với cùng một tên phương thức" },
      { key: "D", text: "Gộp dữ liệu và phương thức vào một đơn vị" },
    ],
    answer: "B",
    explanation: "Inheritance cho phép lớp con (child class) tái sử dụng code từ lớp cha (parent class).",
  },
  {
    id: 12,
    question: "RESTful API thường sử dụng định dạng dữ liệu nào để trao đổi?",
    options: [
      { key: "A", text: "XML" },
      { key: "B", text: "CSV" },
      { key: "C", text: "JSON" },
      { key: "D", text: "YAML" },
    ],
    answer: "C",
    explanation: "JSON (JavaScript Object Notation) nhẹ, dễ đọc và là format tiêu chuẩn phổ biến nhất cho REST API.",
  },
  {
    id: 13,
    question: "Git lệnh nào dùng để đưa thay đổi từ nhánh feature về nhánh main?",
    options: [
      { key: "A", text: "git commit" },
      { key: "B", text: "git merge" },
      { key: "C", text: "git push" },
      { key: "D", text: "git pull" },
    ],
    answer: "B",
    explanation: "git merge tích hợp lịch sử của một nhánh vào nhánh hiện tại.",
  },
  {
    id: 14,
    question: "Trong TypeScript, kiểu dữ liệu nào dùng để biểu diễn giá trị có thể là nhiều kiểu khác nhau?",
    options: [
      { key: "A", text: "any" },
      { key: "B", text: "unknown" },
      { key: "C", text: "union type (|)" },
      { key: "D", text: "interface" },
    ],
    answer: "C",
    explanation: "Union type (|) cho phép một biến nhận nhiều kiểu, ví dụ: string | number.",
  },
  {
    id: 15,
    question: "Next.js App Router lưu trữ layouts và pages trong thư mục nào?",
    options: [
      { key: "A", text: "pages/" },
      { key: "B", text: "components/" },
      { key: "C", text: "src/app/" },
      { key: "D", text: "views/" },
    ],
    answer: "C",
    explanation: "App Router (Next.js 13+) dùng thư mục app/ (thường nằm trong src/) cho tất cả routes và layouts.",
  },
  {
    id: 16,
    question: "Thuật toán sắp xếp nào có độ phức tạp trung bình O(n log n)?",
    options: [
      { key: "A", text: "Bubble Sort" },
      { key: "B", text: "Selection Sort" },
      { key: "C", text: "Merge Sort" },
      { key: "D", text: "Insertion Sort" },
    ],
    answer: "C",
    explanation: "Merge Sort luôn đạt O(n log n) ở cả trường hợp tốt nhất, trung bình và xấu nhất.",
  },
  {
    id: 17,
    question: "Trong mạng máy tính, địa chỉ IP nào thuộc lớp C (Class C)?",
    options: [
      { key: "A", text: "10.0.0.1" },
      { key: "B", text: "172.16.0.1" },
      { key: "C", text: "192.168.1.1" },
      { key: "D", text: "224.0.0.1" },
    ],
    answer: "C",
    explanation: "Lớp C có dải 192.0.0.0 – 223.255.255.255. 192.168.x.x thường dùng trong mạng nội bộ.",
  },
  {
    id: 18,
    question: "Mô hình OSI có bao nhiêu tầng (layer)?",
    options: [
      { key: "A", text: "4" },
      { key: "B", text: "5" },
      { key: "C", text: "6" },
      { key: "D", text: "7" },
    ],
    answer: "D",
    explanation: "Mô hình OSI gồm 7 tầng: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
  },
  {
    id: 19,
    question: "Trong bảo mật web, tấn công XSS (Cross-Site Scripting) là gì?",
    options: [
      { key: "A", text: "Tấn công vào cơ sở dữ liệu thông qua câu lệnh SQL" },
      { key: "B", text: "Chèn mã JavaScript độc hại vào trang web để tấn công người dùng" },
      { key: "C", text: "Giả mạo yêu cầu từ phía người dùng đã xác thực" },
      { key: "D", text: "Tấn công từ chối dịch vụ phân tán" },
    ],
    answer: "B",
    explanation: "XSS chèn script độc hại vào nội dung trang web, script này chạy trong trình duyệt của nạn nhân.",
  },
  {
    id: 20,
    question: "useEffect trong React với dependency array rỗng [] chạy khi nào?",
    options: [
      { key: "A", text: "Mỗi khi component re-render" },
      { key: "B", text: "Chỉ một lần sau khi component mount" },
      { key: "C", text: "Chỉ khi component unmount" },
      { key: "D", text: "Không bao giờ chạy" },
    ],
    answer: "B",
    explanation: "Dependency array rỗng [] làm useEffect chạy đúng một lần sau lần render đầu tiên (componentDidMount).",
  },
  {
    id: 21,
    question: "Tailwind CSS là loại framework CSS nào?",
    options: [
      { key: "A", text: "Component-based framework" },
      { key: "B", text: "Utility-first framework" },
      { key: "C", text: "Grid-only framework" },
      { key: "D", text: "CSS-in-JS framework" },
    ],
    answer: "B",
    explanation: "Tailwind CSS là utility-first: cung cấp các class đơn lẻ (flex, pt-4, text-center…) thay vì component định sẵn.",
  },
  {
    id: 22,
    question: "Trong cơ sở dữ liệu quan hệ, khóa ngoại (Foreign Key) dùng để?",
    options: [
      { key: "A", text: "Đánh chỉ mục tăng tốc tìm kiếm" },
      { key: "B", text: "Đảm bảo mỗi giá trị trong cột là duy nhất" },
      { key: "C", text: "Tạo liên kết tham chiếu giữa hai bảng" },
      { key: "D", text: "Mã hóa dữ liệu nhạy cảm" },
    ],
    answer: "C",
    explanation: "Foreign Key tham chiếu đến Primary Key của bảng khác, đảm bảo toàn vẹn tham chiếu (referential integrity).",
  },
  {
    id: 23,
    question: "Công nghệ nào cho phép trao đổi dữ liệu real-time hai chiều giữa client và server?",
    options: [
      { key: "A", text: "REST API" },
      { key: "B", text: "GraphQL" },
      { key: "C", text: "WebSocket" },
      { key: "D", text: "gRPC" },
    ],
    answer: "C",
    explanation: "WebSocket duy trì kết nối liên tục, cho phép server đẩy dữ liệu đến client mà không cần client hỏi lại.",
  },
  {
    id: 24,
    question: "Docker container khác với máy ảo (VM) ở điểm nào?",
    options: [
      { key: "A", text: "Container có hệ điều hành riêng đầy đủ" },
      { key: "B", text: "Container chia sẻ kernel của host OS, nhẹ hơn VM nhiều" },
      { key: "C", text: "Container chậm hơn VM" },
      { key: "D", text: "Container không thể chạy trên Windows" },
    ],
    answer: "B",
    explanation: "Container chia sẻ kernel host, chỉ đóng gói ứng dụng + dependencies → khởi động nhanh, tốn ít tài nguyên hơn VM.",
  },
  {
    id: 25,
    question: "Trong Next.js, Server Components khác Client Components ở điểm nào chính?",
    options: [
      { key: "A", text: "Server Components có thể dùng useState và event handlers" },
      { key: "B", text: "Server Components render trên server, không gửi JavaScript xuống client" },
      { key: "C", text: "Client Components không thể fetch dữ liệu" },
      { key: "D", text: "Server Components chỉ dùng được cho trang tĩnh" },
    ],
    answer: "B",
    explanation: "Server Components render HTML trên server, giảm JavaScript bundle gửi về client, tăng hiệu năng tải trang.",
  },
  {
    id: 26,
    question: "CORS (Cross-Origin Resource Sharing) giải quyết vấn đề gì?",
    options: [
      { key: "A", text: "Nén dữ liệu truyền qua mạng" },
      { key: "B", text: "Mã hóa kết nối HTTPS" },
      { key: "C", text: "Cho phép hoặc từ chối request từ origin khác domain" },
      { key: "D", text: "Cache tài nguyên tĩnh trên trình duyệt" },
    ],
    answer: "C",
    explanation: "CORS là cơ chế HTTP cho phép server khai báo origin nào được phép truy cập tài nguyên.",
  },
  {
    id: 27,
    question: "Trong quản lý state phức tạp, Redux Toolkit giải quyết điều gì so với Redux thuần?",
    options: [
      { key: "A", text: "Loại bỏ hoàn toàn boilerplate code" },
      { key: "B", text: "Giảm boilerplate, tích hợp Immer cho immutable updates" },
      { key: "C", text: "Thay thế hoàn toàn Redux" },
      { key: "D", text: "Chỉ dùng được với TypeScript" },
    ],
    answer: "B",
    explanation: "Redux Toolkit tích hợp sẵn Immer (viết state mutation style), createSlice, configureStore giúp giảm code lặp.",
  },
  {
    id: 28,
    question: "Phương pháp Agile Scrum sử dụng 'Sprint' với thời gian thường là?",
    options: [
      { key: "A", text: "1 ngày" },
      { key: "B", text: "1 tuần" },
      { key: "C", text: "1-4 tuần" },
      { key: "D", text: "3-6 tháng" },
    ],
    answer: "C",
    explanation: "Sprint trong Scrum thường kéo dài 1-4 tuần (phổ biến nhất là 2 tuần), tạo ra một increment có thể ship được.",
  },
  {
    id: 29,
    question: "Thuộc tính nào của CSS tạo không gian BÊN NGOÀI viền của phần tử?",
    options: [
      { key: "A", text: "padding" },
      { key: "B", text: "border" },
      { key: "C", text: "margin" },
      { key: "D", text: "outline" },
    ],
    answer: "C",
    explanation: "margin tạo khoảng cách bên ngoài border; padding tạo khoảng cách bên trong border đến content.",
  },
  {
    id: 30,
    question: "Trong kiến trúc microservices, API Gateway đảm nhiệm vai trò gì?",
    options: [
      { key: "A", text: "Lưu trữ dữ liệu tập trung cho tất cả services" },
      { key: "B", text: "Điểm vào duy nhất, định tuyến request đến các service phù hợp" },
      { key: "C", text: "Xử lý authentication cho từng microservice độc lập" },
      { key: "D", text: "Giao tiếp trực tiếp giữa các microservice với nhau" },
    ],
    answer: "B",
    explanation: "API Gateway là single entry point: xử lý routing, authentication, rate limiting, logging trước khi chuyển đến service.",
  },
];

/**
 * Fetch questions, optionally filtered by examId.
 * Falls back to local mock data if Supabase unavailable.
 */
export async function fetchQuestions(examId?: number): Promise<Question[]> {
  try {
    const { supabase } = await import("./supabase");
    let query = supabase.from("questions").select("*").order("id", { ascending: true });
    if (examId) query = query.eq("exam_id", examId);
    const { data, error } = await query;
    if (error || !data || data.length === 0) throw new Error("no data");
    return data.map((row) => ({
      id: row.id,
      question: row.question,
      options: [
        { key: "A" as OptionKey, text: row.option_a },
        { key: "B" as OptionKey, text: row.option_b },
        { key: "C" as OptionKey, text: row.option_c },
        { key: "D" as OptionKey, text: row.option_d },
      ],
      answer: row.answer as OptionKey,
      explanation: row.explanation,
      imageUrl: row.image_url,
      examId: row.exam_id,
    }));
  } catch {
    return new Promise((resolve) => setTimeout(() => resolve(QUESTIONS), 600));
  }
}

/** Fetch all exams from Supabase */
export async function fetchExams(): Promise<Exam[]> {
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("exams")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });
    if (error || !data) throw new Error("no exams");
    // Fetch question counts
    const withCounts = await Promise.all(
      data.map(async (exam) => {
        const { count } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("exam_id", exam.id);
        return { ...exam, questionCount: count ?? 0 };
      })
    );
    return withCounts;
  } catch {
    return [];
  }
}

/** Save a quiz attempt score to Supabase */
export async function saveAttempt(
  userId: string,
  examId: number,
  score: number,
  correctCount: number,
  wrongCount: number,
  skippedCount: number,
  totalCount: number,
  timeUsedSec: number
): Promise<boolean> {
  try {
    const { supabase } = await import("./supabase");
    const { error } = await supabase.from("quiz_attempts").insert({
      user_id: parseInt(userId, 10),
      exam_id: examId,
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      skipped_count: skippedCount,
      total_count: totalCount,
      time_used_sec: timeUsedSec,
    });
    return !error;
  } catch {
    return false;
  }
}

export default QUESTIONS;
