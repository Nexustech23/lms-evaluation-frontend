"use client";
import React, { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react';
import Footer from '@/components/landing-page/footer';
import Navbar from '@/components/landing-page/navbar';

const faqData = [
  {
    question: "1. What is grAdelytics?",
    answer:
      "grAdelytics is a learning management and academic evaluation platform developed by NexusTech that helps educational institutions, educators, and learners manage courses, assessments, grading, analytics, and academic workflows digitally.",
  },
  {
    question: "2. Who can use grAdelytics?",
    answer:
      "grAdelytics is designed for educational institutions, schools, colleges, universities, training organizations, educators, administrators, and students. Access may be provided directly by an institution or through an authorized account.",
  },
  {
    question: "3. How do I create an account?",
    answer:
      "Your institution or administrator may provide you with login credentials, or you may be able to register directly depending on your access model. You must provide accurate and up-to-date information while creating your account.",
  },
  {
    question: "4. I forgot my password. What should I do?",
    answer:
      "You can use the 'Forgot Password' option on the login page to reset your password. If you continue to face issues, please contact your institution administrator or our support team.",
  },
  {
    question: "5. Is my data secure?",
    answer:
      "Yes. We implement reasonable technical and organizational security measures to protect user data, including secure access controls and encrypted data transmission where applicable.",
  },
  {
    question: "6. What kind of data does grAdelytics collect?",
    answer:
      "The platform may collect account information, academic records, course participation data, submissions, assessment results, and system usage information required to provide the Service. Please refer to our Privacy Policy for full details.",
  },
  {
    question: "7. Who owns student data?",
    answer:
      "Student data remains the property of the respective institution, educator, student, or lawful owner. NexusTech processes such data only to provide and support the grAdelytics Service in accordance with applicable terms and policies.",
  },
  {
    question: "8. Can educators upload assignments, course materials, and assessments?",
    answer:
      "Yes. Authorized educators and institutions can upload course content, assignments, tests, grading materials, and related academic resources through the platform.",
  },
  {
    question: "9. Can students submit assignments online?",
    answer:
      "Yes. Students can submit assignments, assessments, responses, and other required academic materials through the platform, subject to institution settings.",
  },
  {
    question: "10. Does grAdelytics support automated grading or analytics?",
    answer:
      "Depending on the enabled features, grAdelytics may provide grading assistance, analytics, reports, dashboards, and academic insights to support educators and institutions.",
  },
  {
    question: "11. Can grAdelytics integrate with other systems?",
    answer:
      "Yes. grAdelytics may support integrations with student information systems (SIS), authentication services, communication tools, cloud storage providers, or other approved third-party systems.",
  },
  {
    question: "12. What devices are supported?",
    answer:
      "grAdelytics is accessible through supported web browsers and may also be available on compatible mobile devices or applications, depending on deployment.",
  },
  {
    question: "13. What should I do if the platform is not working?",
    answer:
      "First, check your internet connection and browser compatibility. If the issue persists, contact your institution administrator or NexusTech support with details of the problem.",
  },
  {
    question: "14. Can institutions customize grAdelytics?",
    answer:
      "Yes. Depending on the subscription or deployment model, institutions may have access to configurable features, workflows, branding options, and administrative controls.",
  },
  {
    question: "15. Does grAdelytics offer technical support?",
    answer:
      "Yes. Support availability may vary depending on your subscription plan or institutional agreement. Please contact your administrator or NexusTech support for assistance.",
  },
  {
    question: "16. How can I contact support?",
    answer:
      "You can reach the NexusTech support team through the contact details provided on the website or through your institution’s designated support channel.",
  },
  {
    question: "17. Can my institution suspend or remove my access?",
    answer:
      "Yes. Institutions and authorized administrators may manage user access, permissions, suspensions, or account deactivation in accordance with institutional policies.",
  },
  {
    question: "18. Is grAdelytics suitable for schools, colleges, and corporate training?",
    answer:
      "Yes. grAdelytics is designed to support a wide range of educational and training use cases, including schools, higher education, professional certification, and organizational learning.",
  },
];

const Faq = () => {

    const [openAnswer, setOpenAnswer] = useState(null);

    const toggleFaq = (index) => {
      setOpenAnswer(openAnswer === index ? null : index);
    };
  return (
    <main className="w-full overflow-hidden bg-white text-[#24282c]">
      <Navbar/>

      <div className="w-full h-[1px] bg-[#f1f5f5]">
        <div className="w-[80%] h-[1px] bg-[#b5c7ca] mx-auto"></div>
      </div>

      <section className='w-full px-60 py-10 text-orange-500 font-semibold bg-amber-50'>
        <h1 className='text-4xl font-[500]'>Frequently Asked Question (FAQ)</h1>
      </section>

      <section className="w-full px-60 py-10 text-lg text-[#636363] flex flex-col gap-0 bg-amber-50">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 py-10 px-4 border-b border-orange-400"
          >
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => toggleFaq(index)}
            >
              <p className="text-2xl text-black ">
                {faq.question}
              </p>

              <IconChevronDown
                src='https://fontawesome.com/icons/classic/solid/arrow-down'
                className={`text-xl transition-transform duration-300 ${
                  openAnswer === index ? "rotate-180" : ""
                }`}
              />
              
            </div>

            {openAnswer === index && (
              <p className="leading-8">{faq.answer}</p>
            )}
          </div>
        ))}
      </section>

      <section className='flex flex-col gap-8 w-full px-10 lg:px-60 md:px-40 sm:px-20 bg-amber-50 py-10'>
        <p className='text-xl cursor-pointer'>Have more Queries? <a href='/contact-us' className='text-[#0068b3] underline'>Contact our team</a> </p>
      </section>

  <Footer/>

    </main>
  )
}

export default Faq;