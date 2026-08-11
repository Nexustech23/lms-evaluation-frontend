"use client";
import { ExamDetailsForm } from "@/components/newuploadform"
import Navbar from "@/components/ui/Navbar";
import { useTranslations } from "next-intl";

export default function NewuploadForm(){
    const t = useTranslations("examForm");
    return ( 
       <>
        <Navbar title={t("enterTitle")}/>
        <ExamDetailsForm />
        </>
    )
}