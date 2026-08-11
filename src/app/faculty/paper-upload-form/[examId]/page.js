"use client";
import { ExamDetailsForm } from '@/components/newuploadform'
import React from 'react'
import Navbar from '@/components/ui/Navbar'
import { useRouter } from "next/navigation";
import { FaArrowLeft } from 'react-icons/fa';
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from 'next-intl';

const page = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const t = useTranslations("examForm");
  const tc = useTranslations("common");
  return (
    <div  className="flex flex-col min-h-screen"
  style={{ backgroundColor: user?.color || "#cc5200" }}>
      <Navbar title={t("editTitle")}  />
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center mb-4 px-4 ml-6 py-2 text-sm bg-white text-orange-500 rounded hover:bg-orange-100"
        >
          <FaArrowLeft />
          {tc("back")}
        </button>
      </div>

      <ExamDetailsForm />
    </div>
  )
}

export default page
