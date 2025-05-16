export const QUESTIONS: Question[] = [
  {
    question: "When is your birthday?",
    mode: "date",
  },
  {
    question: "What is your height?",
    mode: "height",
  },
  {
    question: "What is your weight?",
    mode: "weight",
  },
];

interface Question {
  question: string;
  mode: "date" | "number" | "select" | "height" | "weight";
  options?: Array<{ id: string; label: string }>;
}
