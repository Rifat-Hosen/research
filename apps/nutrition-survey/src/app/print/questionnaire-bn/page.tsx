import type { Metadata } from "next";
import { BanglaQuestionnairePrint } from "@/components/admin/bangla-questionnaire-print";

export const metadata: Metadata = {
  title: "পুষ্টি মূল্যায়ন প্রশ্নপত্র",
};

export default function BanglaQuestionnairePrintPage() {
  return <BanglaQuestionnairePrint />;
}
