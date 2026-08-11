"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

const Page = () => {
  const { subjectId } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = useTranslations("courseOutcome");
  const tc = useTranslations("common");

  const fetchExams = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/newsaved-documents-subject/${subjectId}`,

        {
          withCredentials: true,
        }
      );

      setExams(res.data.exams || []);
    } catch (err) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) fetchExams();
  }, [subjectId]);

  const getStatus = (progress) => {
    if (progress === 100) return "Done";
    if (progress === 0) return "Pending";
    return "In Progress";
  };

  const getColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress === 0) return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
       <div className="h-screen" style={{ backgroundColor: user?.color }}>
      <Navbar title={t("title")} />

      <div className="mb-4">
        <button
          onClick={() => router.back()}
           style={{ color: user?.color }}
          className="flex items-center mb-4 px-4 ml-4 py-2 text-sm bg-white  rounded "
        >
          <FaArrowLeft />
          {tc("back")}
        </button>
      </div>

      <div className="p-6 bg-white m-4 rounded-xl shadow-sm">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold ">
          {t("examsForSubject")}
          </h2>
          <button className="bg-green-600 px-2 py-2 rounded text-white " onClick={() => router.push(`/admin/co/combinedCO?subjectId=${subjectId}`)}>{t("viewCombinedCO")}</button>
        </div>



        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {t("noExams")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {exams.map((exam) => {
              const progress = exam.evaluation_progress || 0;

              return (
                <div key={exam.id}  className="flex flex-col cursor-pointer bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-blue-100 transition-all duration-200">
                  
                    <div className="text-4xl mb-3">📁</div>

                    <h3 className="font-semibold text-gray-800 text-lg">
                      {exam.folder_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Type: {exam.exam_type}
                    </p>

                    <p className="text-sm text-gray-500">
                      Date:{" "}
                      {exam.exam_date
                        ? new Date(exam.exam_date).toLocaleDateString()
                        : "-"}
                    </p>

                    <div className="text-xs text-gray-400 mt-2">
                      {t("weightage")}: {exam.weightage}%
                    </div>

                    {/* Sheet Count */}
                    <div className="text-xs text-gray-600 mt-2">
                      {t("sheets")}: {exam.evaluated_sheets} / {exam.total_sheets}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`${getColor(progress)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    {/* Status */}
                    <div className="text-xs font-medium mt-2">
                      {t("evaluationStatus")}:{" "}
                      <span
                        className={
                          progress === 100
                            ? "text-green-600"
                            : progress === 0
                              ? "text-red-600"
                              : "text-yellow-600"
                        }
                      >
                        {getStatus(progress)} ({progress}%)
                      </span>
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;