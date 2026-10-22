import { z } from "zod";

/** Số trang tuyệt đối trong file PDF gốc (bắt đầu từ 1). */
export const PageNo = z.number().int().positive();
export const Pages = z.array(PageNo).min(1);

/** "slide" = lấy từ slide; "bổ sung" = kiến thức ngoài slide để giải thích thêm. */
export const Source = z.enum(["slide", "bổ sung"]);

export const KeyConcept = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  pages: Pages,
  source: Source,
});

export const CodePart = z.object({
  lines: z.string().regex(/^\d+(-\d+)?$/, "dạng '3' hoặc '3-7'"),
  note: z.string().min(1),
});

export const CodeExample = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  code: z.string().min(1),
  explanation: z.string().min(1),
  parts: z.array(CodePart).default([]),
  pages: Pages,
  source: Source,
});

export const Figure = z.object({
  page: PageNo,
  caption: z.string().min(1),
});

export const Flashcard = z.object({
  id: z.string().regex(/^fc-\d+$/),
  front: z.string().min(1),
  back: z.string().min(1),
  pages: Pages,
  source: Source,
});

export const QuizLevel = z.enum(["nhớ", "hiểu", "vận dụng"]);

export const QuizQuestion = z
  .object({
    id: z.string().regex(/^q-\d+$/),
    level: QuizLevel,
    question: z.string().min(1),
    code: z.object({ language: z.string(), code: z.string().min(1) }).optional(),
    options: z.array(z.string().min(1)).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().min(1),
    pages: Pages,
    source: Source,
  })
  .refine((q) => new Set(q.options).size === 4, { message: "4 đáp án phải khác nhau" });

export const ExamQuestion = z.object({
  id: z.string().regex(/^ex-\d+$/),
  question: z.string().min(1),
  hints: z.string().min(1),
  pages: Pages,
  source: Source,
});

export const LessonContent = z.object({
  version: z.literal(1),
  subject: z.string().min(1),
  lesson: z.string().min(1),
  title: z.string().min(1),
  /** Markdown; tham chiếu trang dạng [tr. 12](#p12). */
  summary: z.string().min(200),
  keyConcepts: z.array(KeyConcept).min(5),
  codeExamples: z.array(CodeExample).default([]),
  figures: z.array(Figure).default([]),
  flashcards: z.array(Flashcard).min(15).max(30),
  quiz: z.array(QuizQuestion).min(10).max(20),
  examQuestions: z.array(ExamQuestion).min(3).max(5),
});

export type LessonContent = z.infer<typeof LessonContent>;
export type KeyConcept = z.infer<typeof KeyConcept>;
export type CodeExample = z.infer<typeof CodeExample>;
export type Flashcard = z.infer<typeof Flashcard>;
export type QuizQuestion = z.infer<typeof QuizQuestion>;
export type ExamQuestion = z.infer<typeof ExamQuestion>;
export type Figure = z.infer<typeof Figure>;

/* ---------- manifest.json (sinh bởi scripts/extract.py) ---------- */

export const ManifestLesson = z.object({
  id: z.string(),
  title: z.string(),
  group: z.string().nullable().optional(),
  pdf: z.string(),
  pageStart: PageNo,
  pageEnd: PageNo,
  pageCount: z.number().int(),
  pdfPageCount: z.number().int(),
  raw: z.string(),
  content: z.string(),
  hasContent: z.boolean(),
  /** số mục trong file nội dung (null nếu chưa có nội dung) */
  counts: z
    .object({
      keyConcepts: z.number().int(),
      codeExamples: z.number().int(),
      flashcards: z.number().int(),
      quiz: z.number().int(),
      examQuestions: z.number().int(),
    })
    .nullable()
    .optional(),
  lowTextPages: z.number().int(),
  order: z.number().int(),
});

export const Manifest = z.object({
  generatedAt: z.string(),
  subjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      short: z.string(),
      lessons: z.array(ManifestLesson),
    }),
  ),
});

export type Manifest = z.infer<typeof Manifest>;
export type ManifestLesson = z.infer<typeof ManifestLesson>;
