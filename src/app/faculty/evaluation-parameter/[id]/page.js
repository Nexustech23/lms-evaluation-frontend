"use client";
import React from 'react'
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import EvaluationParameterCO from '@/components/EvaluationParamterCO';
import EvaluationParameterWithoutCO from '@/components/EvaluationParameterWithoutCO';
const page = () => {
    const { user } = useContext(AuthContext);
  
  return (
    <div>
       {user?.hasCOAccess? < EvaluationParameterCO/>:<EvaluationParameterWithoutCO/>}
    </div>
  )
}

export default page
