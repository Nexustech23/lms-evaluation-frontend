"use client";
import Footer from '@/components/landing-page/footer';
import Navbar from '@/components/landing-page/navbar';
import React from 'react'

function Privacy() {
  return (
    <main className="w-full overflow-hidden bg-white text-[#24282c]">
        <Navbar/>

      <div className="w-full h-[1px] bg-[#f1f5f5]">
        <div className="w-[80%] h-[1px] bg-[#b5c7ca] mx-auto"></div>
      </div>

      <section className='w-full px-60 py-10 bg-[#f1f5f5]'>
        <h1 className='text-4xl font-[500]'>Privacy Policy</h1>
      </section>

      <section className='w-full px-60 py-10 text-lg text-[#636363] flex flex-col gap-5'>
        <p className='text-lg text-[#636363]'>Last Updated: 13 May 2026</p>
        <p>This Privacy Policy explains how NexusTech (“NexusTech,” “we,” “us,” or “our”) collects, uses, stores, shares, and protects personal data when users access or use grAdelytics, including our website, dashboards, learning management, assessment, question paper generation, answer script evaluation, reporting, and related services.</p>
        <p>By using grAdelytics, you agree to the practices described in this Privacy Policy. If you use grAdelytics through an educational institution, your institution may also have its own privacy notices, policies, and rules that apply to your use.</p>
      </section>

      <section className='flex flex-col gap-8 w-full px-10 lg:px-60 md:px-40 sm:px-20'>
        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>1.</p>
            <p>Scope of This Policy</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>This Privacy Policy applies to:</p>
              <ul className='list-decimal pl-5'>
                <li>Visitors who access our website, pricing page, contact page, demo page, or public pages;</li>
                <li>Institutes and institutional administrators;</li>
                <li>Faculty, instructors, tutors, and evaluators;</li>
                <li>Students, self-learners, and other end users;</li>
                <li>Users who upload, generate, evaluate, review, download, or manage academic content through grAdelytics.</li>
              </ul>
              <p>Where grAdelytics is provided to an institution, the institution may be the primary controller of student, faculty, course, assessment, and academic data. NexusTech processes such data to provide, maintain, secure, and improve the grAdelytics service.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>2.</p>
            <p>Information We Collect</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-6'>
              <p>We collect only the information needed to operate grAdelytics and provide academic evaluation, learning, reporting, and administration features.</p>  
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Account and Identity Information</h1>
                <p>When accounts are created or managed, we may collect: (i) Full name: (ii) Email address; (iii) Password or password-related credentials; (iv) Role, such as super admin, institute admin, faculty, tutor, student, or self-learner; (v) Phone number; (vi) Profile Image (vii) Login/session information; (viii) User preferences such as theme color and language.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Institution and Academic Information</h1>
                <p>For institutions and academic setup, we may collect:</p>
                <ul className='list-decimal pl-5'>
                    <li>Institute name, short name, institute code, logo, banner, website, phone number, address, city, state, country, pincode, affiliation, accreditation, year of establishment, and description;</li>
                    <li>School, programme, department, batch, semester, and subject details;</li>
                    <li>Course outcomes, programme outcomes, PSOs, CO-PO mappings, subject codes, subject names, and academic structures;</li>
                    <li>Faculty details such as designation, qualification, specialization, experience, employee code, joining date, and assigned school or subject.</li>
                </ul>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Assessment and Evaluation Information</h1>
                <div className='flex flex-col gap-3'>
                  <p>When users create or manage exams and evaluations, we may collect:</p>
                  <ul className='list-decimal pl-5'>
                    <li>Exam title, exam type, exam date, weightage, subject, semester, batch, and related academic metadata;</li>
                    <li>Covered course outcomes;</li>
                    <li>Question papers, question banks, course planner files, prompts, generated question papers, and PDF exports;</li>
                    <li>Evaluation parameters, rubrics, marks allocation, remarks, and grading criteria;</li>
                    <li>Uploaded answer scripts in PDF, image, or supported document formats;</li>
                    <li>AI-generated evaluation outputs, marks, feedback, reasoning, improvement suggestions, transcript content, evaluated reports, Excel reports, and final faculty-adjusted marks;</li>
                    <li>Archived, saved, renamed, deleted, or downloaded result records.</li>
                  </ul>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Contact, Demo, and Pricing Form Information</h1>
                <p>When you contact us, request pricing, or submit a form, we may collect: (i) First name and last name; (ii) Work email; (iii) Job role (iv) Institution name; (v) Institution type; (vi) Country (vii) Any message or information you voluntarily provide.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Billing and Payment-Related Information</h1>
                <p>For institutional accounts, billing pages may display or process: (i) Institute name (ii) Contact email; (iii) Subscription, billing, or payment status; (iv) Payment history or related account records.</p>
                <p>If payment processing is handled by a third-party payment processor, that provider may collect payment details under its own privacy policy. We do not intentionally store full card numbers unless explicitly stated by the payment provider or required for lawful accounting purposes.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Technical and Usage Information</h1>
                <p>When you use grAdelytics, we may automatically collect: (i) IP address; (ii) Browser type and version; (iii) Device type; (iv) Operating system; (v) Date and time of access; (vi) Pages or features used; (vii) Login/session activity; (viii) Error logs and performance information; (ix) Upload/download activity; (x) Security and audit logs.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Cookies and Local Storage</h1>
                <p>grAdelytics uses cookies and browser storage to support:</p>
                <ul className='list-decimal pl-5'>
                    <li>Authentication and secure sessions;</li>
                    <li>Language preference;</li>
                    <li>Interface preferences such as sidebar state;</li>
                    <li>Basic site functionality;</li>
                    <li>Security, debugging, and performance.</li>
                </ul>
                <p>You may control cookies through your browser settings. Some features may not work properly if cookies are disabled.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>3.</p>
            <p>How We Use Information</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>We use collected information to:</p>
              <ul className='list-decimal pl-5'>
                <li>Create, authenticate, and manage user accounts;</li>
                <li>Provide role-based dashboards and access controls;</li>
                <li>Manage institutions, faculty, students, courses, subjects, batches, semesters, and academic structures;</li>
                <li>Enable question paper upload, generation, editing, storage, and download;</li>
                <li>Enable answer script upload, evaluation, faculty review, marks adjustment, and report generation;</li>
                <li>Generate academic analytics, CO/PO reports, Excel reports, transcripts, and evaluated PDFs;</li>
                <li>Store, retrieve, rename, archive, delete, and manage uploaded academic files;</li>
                <li>Provide customer support and respond to inquiries;</li>
                <li>Send service-related notices such as account, security, feature, or policy updates;</li>
                <li>Improve platform reliability, usability, and performance;</li>
                <li>Detect, prevent, and investigate fraud, misuse, unauthorized access, security incidents, and technical issues;</li>
                <li>Comply with legal, regulatory, contractual, accounting, and institutional obligations.</li>
              </ul>
              <p>We do not sell student, faculty, or institutional data.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>4.</p>
            <p>AI-Based Processing</p>
          </div>

          <div className='grid grid-cols-1] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>grAdelytics may use AI-assisted features for question paper generation, answer script evaluation, feedback generation, transcript generation, marks analysis, and academic reporting.</p>
              <p>Uploaded academic content, prompts, answer scripts, question papers, rubrics, and evaluation data may be processed to provide these features. AI-generated outputs are intended to assist educators and institutions. They should be reviewed by authorized faculty or academic staff before final academic decisions are made.</p>
              <p>Where third-party AI, cloud, storage, OCR, file processing, or hosting services are used, we require such processing to support the grAdelytics service and not for unrelated commercial use.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>5.</p>
            <p>File Uploads and Third-Party Storage</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>grAdelytics allows users to upload files such as: (i) Institution logos and banners; (ii) Question papers; (iii) Question banks; (iv) Course planner documents; (v) Answer scripts; (vi) Academic reports and generated files.</p>
              <p>Some files may be uploaded to third-party storage or media services, including ImageKit, for secure storage, retrieval, preview, and download. These providers process files only as needed to provide hosting, delivery, and related technical services.</p>
              <p>Users should avoid uploading unnecessary personal, sensitive, or unrelated information inside files.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>6.</p>
            <p> Sharing of Information</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-6'>
              <p>We may share information only in the following cases:</p>  
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'> With Your Institution</h1>
                <p>If you use grAdelytics through an institution, your data may be visible to authorized institutional users such as administrators, faculty, evaluators, or academic coordinators according to their role permissions.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>With Service Providers</h1>
                <p>We may share limited data with trusted providers who help us operate the platform, such as:</p>
                <ul className='list-decimal pl-5'>
                    <li>Cloud hosting providers;</li>
                    <li>File storage and delivery providers;</li>
                    <li>AI/OCR/document processing providers;</li>
                    <li>Email or notification providers;</li>
                    <li>Analytics, logging, security, and monitoring providers;</li>
                    <li>Payment or billing service providers, if applicable.</li>
                </ul>
                <p>These providers are authorized to process data only as needed to provide services to us.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>For Legal and Safety Reasons</h1>
                <div className='flex flex-col gap-3'>
                  <p>We may disclose information if required to:</p>
                  <ul className='list-decimal pl-5'>
                    <li>Comply with law, regulation, court order, subpoena, or government request;</li>
                    <li>Enforce our Terms and Conditions;</li>
                    <li>Protect the rights, safety, security, or property of NexusTech, users, institutions, or the public;</li>
                    <li>Investigate fraud, abuse, security incidents, or unauthorized access.</li>
                  </ul>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Business Transfers</h1>
                <p>If NexusTech is involved in a merger, acquisition, restructuring, financing, or sale of assets, user information may be transferred as part of that transaction, subject to appropriate safeguards.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>7.</p>
            <p>Data Security</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>We use reasonable technical and organizational measures to protect personal data and academic content, including:</p>
              <ul className='list-decimal pl-5'>
                <li>Secure authentication;</li>
                <li>Role-based access controls;</li>
                <li>Session-based access using cookies;</li>
                <li>HTTPS/secure transmission where configured;</li>
                <li>Restricted access to user and institutional data;</li>
                <li>Security monitoring, debugging, and access controls;</li>
                <li>Password protection and password change features.</li>
              </ul>
              <p>No online service can guarantee absolute security. Users are responsible for keeping passwords confidential and for promptly notifying us or their institution if they suspect unauthorized account access.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>8.</p>
            <p>Data Retention</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>We retain information for as long as needed to:</p>
              <ul className='list-decimal pl-5'>
                <li>Provide grAdelytics services;</li>
                <li>Maintain active accounts;</li>
                <li>Preserve academic records, uploaded files, evaluation history, reports, and institutional records;</li>
                <li>Comply with legal, accounting, audit, contractual, or institutional requirements;</li>
                <li>Resolve disputes and enforce agreements;</li>
                <li>Maintain security and operational logs.</li>
              </ul>
              <p>Institutions may request deletion, export, or correction of data according to their agreement with NexusTech and applicable law. Some records may be retained where required for legal, audit, academic integrity, backup, or security purposes.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>9.</p>
            <p>User Rights and Choices</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>Depending on applicable law and your relationship with grAdelytics, you may have the right to: (i) Access personal data we hold about you; (ii) Correct inaccurate or incomplete information; (iii) Request deletion of your personal data; (iv) Request restriction of processing; (v) Object to certain processing; (vi) Request data portability; (vii) Withdraw consent where processing is based on consent; (viii) Opt out of non-essential marketing communications.</p>
              <p>If you use grAdelytics through an institution, please contact your institution first for requests related to academic, student, course, or evaluation data. We will work with the institution to respond to valid requests.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>10.</p>
            <p>Student and Academic Data</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>Student data, answer scripts, marks, feedback, academic reports, and evaluation records are used only to provide educational and assessment services.</p>
              <p>We do not claim ownership of student work, question papers, answer scripts, institutional academic content, or evaluation materials uploaded by users. Such content remains owned by the student, faculty member, institution, or other rightful owner.</p>
              <p>NexusTech may process such content only to operate, support, secure, troubleshoot, improve, and provide grAdelytics services.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>11.</p>
            <p>Marketing Communications</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>If you submit a contact, pricing, or demo form, we may use your contact details to respond to your inquiry and send relevant product or service information.</p>
              <p>You may opt out of marketing emails at any time. Service-related messages such as security alerts, account notices, password resets, and essential platform updates may still be sent.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>12.</p>
            <p>Cookies and Tracking</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>We may use cookies and similar technologies for: (i) Login sessions; (ii) Language selection; (iii) User interface preferences; (iv) Security and fraud prevention; (v) Platform performance; (vi) Basic analytics.</p>
              <p>We do not use educational platform data to sell personal information or target students with advertising.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>13.</p>
            <p>International Data Processing</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>Your information may be processed and stored in locations where NexusTech, its infrastructure providers, or service providers operate. Where required, we use appropriate safeguards for cross-border transfers and require service providers to protect information according to applicable data protection obligations.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>14.</p>
            <p>Children and Minors</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>grAdelytics is intended for use in educational contexts under the direction of institutions, educators, parents, or authorized administrators. If students under the age required by applicable law use grAdelytics, the institution or responsible adult must ensure that appropriate consent or authorization has been obtained.</p>
              <p>We do not knowingly collect personal information from children outside an authorized educational or institutional context.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>15.</p>
            <p>Links to Third-Party Websites</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>Our website or platform may contain links to third-party websites or services. We are not responsible for the privacy practices, content, or security of those third-party services. Users should review the privacy policies of any third-party websites they visit.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>16.</p>
            <p>Changes to This Privacy Policy</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal obligations, or business practices.</p>
              <p>When we make changes, we will update the “Last Updated” date. For material changes, we may provide notice through email, platform notification, website notice, or other appropriate means.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>17.</p>
            <p>Contact Us</p>
          </div>

          <div className='grid grid-cols-1 gap-5'>
            <div className='flex flex-col gap-3'>
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:</p>
              <div>
                <p>NexusTech</p>
                <p>Product: grAdelytics</p>
                <p>Email: [insert privacy/support email]</p>
                <p>Address: [insert company address]</p>
                <p>Phone: [insert phone number, if applicable]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer/>

    </main>
  )
}

export default Privacy