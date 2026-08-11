"use client";
import HeroSection from "@/components/landing-page/heroSection";
import TabSection from "@/components/landing-page/tabSection";
import VideoSection from "@/components/landing-page/videoSection";
import React from "react";
import Navbar from "@/components/landing-page/navbar";
import Footer from "@/components/landing-page/footer";
import Signup from "@/components/landing-page/Signup";
import Dashboard from "./student/dashboard/page";
import MyBatch from "./student/my-batch/page";
import SubjectsSemesterPagePreview from "./student/my-batch/[batchId]/page";

const HomePage = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TabSection />
      <VideoSection />
      <Signup />
      <Footer />
    </>
  );
};

export default HomePage;
