import { lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SubjectPage from "./pages/SubjectPage";
import Flashcards from "./pages/Flashcards";
import QuizPage from "./pages/QuizPage";
import ExamPage from "./pages/ExamPage";
import ReviewPage from "./pages/ReviewPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";

// trang bài học kéo theo PDF.js (nặng) nên tách chunk riêng
const LessonPage = lazy(() => import("./pages/LessonPage"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="s/:subject" element={<SubjectPage />} />
        <Route path="l/:subject/:lesson" element={<LessonPage />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            <div className="py-20 text-center">
              <p className="text-lg font-semibold">Không tìm thấy trang.</p>
              <Link to="/" className="mt-3 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
                Về trang chủ
              </Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
