"use client";
import { Suspense } from "react";
import TodayPageContent from "./TodayPageContent";

export default function TodayPage() {
  return (
    <Suspense fallback={<div />}>
      <TodayPageContent />
    </Suspense>
  );
} 