// Bản legacy của PDF.js có cùng API với bản chuẩn, chỉ khác polyfill.
declare module "pdfjs-dist/legacy/build/pdf.min.mjs" {
  export * from "pdfjs-dist";
}
