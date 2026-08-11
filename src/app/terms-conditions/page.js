"use client";
import Footer from '@/components/landing-page/footer';
import Navbar from '@/components/landing-page/navbar';
import React from 'react'

const Termsandcondition = () => {
  return (
    <main className="w-full overflow-hidden bg-white text-[#24282c]">
      <Navbar/>

      <div className="w-full h-[1px] bg-[#f1f5f5]">
        <div className="w-[80%] h-[1px] bg-[#b5c7ca] mx-auto"></div>
      </div>

      <section className='w-full px-60 py-10 bg-[#f1f5f5]'>
        <h1 className='text-4xl font-[500]'>Terms of Use</h1>
      </section>

      <section className='w-full px-60 py-10 text-lg text-[#636363] flex flex-col gap-5'>
        <p className='text-lg text-[#636363]'>Welcome to grAdelytics, a website and online service of NexusTech. grAdelytics is a leading provider of learning management, evaluation, and academic assessment solutions. As we continue to improve and support the grAdelytics platform you know and use, we remain committed to maintaining the highest standards of service quality. This has included improving our policies and practices, including but not limited to those around privacy and security. We have updated our Terms of Service below. If you have any questions or concerns about the changes, please reach out to us through the support channels available on grAdelytics.</p>
        <p>This page explains the terms by which you may use the grAdelytics online and/or mobile services, web site, and software provided on or in connection with NexusTech's grAdelytics service (the "Service").</p>
        <p>By accessing or using the Service, you signify that you have read, understood, and agree to be bound by these Terms of Service (the "Terms") and to the collection and use of your information as set forth in the <a href='#' className='text-[#0068b3] underline'>grAdelytics Privacy Policy</a>, whether or not you are a registered user of our Service. If you do not agree, you may not use the Service. NexusTech reserves the right to make unilateral modifications to these terms and will provide notice of these changes as described below. These Terms apply to all visitors, users, and others who access the Service ("Users").</p>
        <p>In the event that NexusTech and any Institution (as defined below) have entered into a separate agreement for the Services, such agreement shall govern to the extent that any terms directly conflict with the provisions of these Terms.</p>
      </section>

      <section className='flex flex-col gap-8 w-full px-10 lg:px-60 md:px-40 sm:px-20'>
        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>1.</p>
            <p>Use of Our Services</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Eligibility</h1>
                <p>You may use the Service only if you can form a binding contract with NexusTech, and only in compliance with these Terms and all applicable local, state, national, and international laws, rules and regulations.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>grAdelytics Service</h1>
                <p>Subject to the terms and conditions of these Terms, you are hereby granted a non-exclusive, limited, non-transferable, freely revocable license to use the Service for your personal, noncommercial use only and as permitted by the features of the Service. NexusTech reserves all rights not expressly granted herein in the Service and the grAdelytics Content (as defined below). NexusTech may terminate this license at any time for any reason or no reason.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>grAdelytics Accounts</h1>
                <div className='flex flex-col gap-3'>
                  <p>Your grAdelytics account gives you access to the services and functionality that we may establish and maintain from time to time and in our sole discretion. We may maintain different types of accounts for different types of Users</p>
                  <p>You may never use another User's account without permission. When creating your account, you must provide accurate and complete information, and you must keep this information up to date. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers and symbols) with your account, and enforce a minimum length. You must notify NexusTech immediately of any breach of security or unauthorized use of your account through the support channels on grAdelytics. NexusTech will not be liable for any losses caused by any unauthorized use of your account.</p>
                  <p><strong>Educators.</strong> If you are using your account as a teacher, professor, faculty member, or other similar instructor (an "Educator") and use the Service to add or invite any students ("Students") to access and use the Service, you represent and warrant that you have the authority to act on behalf of your school, university, or other educational institution (the "Institution") and that use of the Service, including without limitation adding or inviting students to access and use the Service and your use and access of the Service in no way violates any agreement between you and the Institution.</p>
                  <p><strong>Institutions.</strong> If you are an Institution and use the Service to add or invite any Students to access and use the Service, to access Educational Records, or in any other way without limitation, you represent and warrant that you have the authority to do so. You may control your User profile and how you interact with the Service by changing the settings in your settings page. By providing NexusTech your email address you consent to our using the email address to send you Service-related notices, including any notices required by law, in lieu of communication by postal mail. We may also use your email address to send you other messages, such as changes to features of the Service and special offers, as detailed in our <a href='#' className='text-[#0068b3] underline'>Privacy Policy</a>.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Service Rules</h1>
                <p>You may use the Service only if you can form a binding contract with NexusTech, and only in compliance with these Terms and all applicable local, state, national, and international laws, rules and regulations.</p>
                <ul className='list-disc pl-5'>
                  <li>copying, distributing, or disclosing any part of the Service in any medium, including without limitation by any automated or non-automated "scraping"</li>
                  <li>using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service in a manner that sends more request messages to the grAdelytics servers than a human can reasonably produce in the same period of time by using a conventional on-line web browser (except that NexusTech grants the operators of public search engines revocable permission to use spiders to copy publicly-available materials from grAdelytics for the sole purpose of and solely to the extent necessary for creating publicly available searchable indices of the materials, but not caches or archives of such materials);</li>
                  <li>transmitting spam, chain letters, or other unsolicited email;</li>
                  <li>attempting to interfere with, compromise the system integrity or security or decipher any transmissions to or from the servers running the Service;</li>
                  <li>taking any action that imposes, or may impose at our sole discretion an unreasonable or disproportionately large load on our infrastructure;</li>
                  <li>uploading invalid data, viruses, worms, or other software agents through the Service;</li>
                  <li>collecting or harvesting any personally identifiable information, including account names, from the Service;</li>
                  <li>using the Service for any commercial solicitation purposes;</li>
                  <li>impersonating another person or otherwise misrepresenting your affiliation with a person or entity, conducting fraud, hiding or attempting to hide your identity;</li>
                  <li>interfering with the proper working of the Service;</li>
                  <li>accessing any content on the Service through any technology or means other than those provided or authorized by the Service; or</li>
                  <li>bypassing the measures we may use to prevent or restrict access to the Service, including without limitation features that prevent or restrict use or copying of any content or enforce limitations on use of the Service or the content therein.</li>
                </ul>
                <p>We may, without prior notice, change the Service; stop providing the Service or features of the Service, to you or to Users generally; or create usage limits for the Service. We may permanently or temporarily terminate or suspend your access to the Service without notice and liability for any reason, including if in our sole determination you violate any provision of these Terms, or for no reason. Upon termination for any reason or no reason, you continue to be bound by these Terms.</p>
                <p>You are solely responsible for your interactions with other grAdelytics Users. We reserve the right, but have no obligation, to monitor disputes between you and other Users. NexusTech shall have no liability for your interactions with other Users, or for any User's action or inaction.</p>
              </div>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>You may use the grAdelytics Service only if you are legally capable of entering into a binding contract. You are responsible for maintaining accurate account information, keeping your account credentials secure, and all activities conducted through your account. If you use the Service on behalf of an educator or institution, you represent that you have the authority to do so. You agree not to misuse, disrupt, interfere with, or place an improper burden on the Service.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>2.</p>
            <p>User Content</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>Some areas of the Service allow Users to post or provide content such as profile information, tests and questions, grading rubrics, comments, and other content or information. Any materials a User submits, posts, displays, or otherwise makes available on the Service are referred to as “User Content.” “User Content” also includes Teacher feedback, educational records, grades, edits, and other Student content.</p>
              <p>We claim no ownership rights over User Content created by you. The User Content you create remains yours. However, by providing or sharing User Content through the Service, you agree to allow others to view, edit, and/or share your User Content in accordance with your settings and these Terms. NexusTech has the right (but not the obligation), in its sole discretion, to remove any User Content that is shared via the Service.</p>

              <div className='flex flex-col gap-3'>
                <p>In connection with your User Content, you affirm, represent, and warrant that:</p>
                <ul className='list-disc pl-5'>
                  <li>you have the written consent of every identifiable person in the User Content, if any, to use their name or likeness as contemplated by the Service and these Terms, and each such person has released you from any liability;</li>
                  <li>you have obtained and are responsible for any consents required by law to post User Content relating to third parties;</li>
                  <li>your User Content and NexusTech’s use of it as contemplated by these Terms will not violate any law or infringe any third-party rights, including Intellectual Property Rights and privacy rights;</li>
                  <li>NexusTech may exercise any rights granted under these Terms without liability for guild fees, residuals, payments, fees, or royalties payable under any collective bargaining agreement or otherwise;</li>
                  <li>to the best of your knowledge, your User Content and other information you provide are truthful and accurate.</li>
                </ul>
                <p>We may, without prior notice, change the Service; stop providing the Service or features of the Service, to you or to Users generally; or create usage limits for the Service. We may permanently or temporarily terminate or suspend your access to the Service without notice and liability for any reason, including if in our sole determination you violate any provision of these Terms, or for no reason. Upon termination for any reason or no reason, you continue to be bound by these Terms.</p>
                <p>You are solely responsible for your interactions with other grAdelytics Users. We reserve the right, but have no obligation, to monitor disputes between you and other Users. NexusTech shall have no liability for your interactions with other Users, or for any User's action or inaction.</p>
              </div>
              <p>NexusTech takes no responsibility and assumes no liability for any User Content posted, sent, or otherwise made available over the Service. You are solely responsible for your User Content and the consequences of posting, publishing, sharing, or otherwise making it available. You agree that NexusTech acts only as a passive conduit for your online distribution and publication of User Content. You understand that you may be exposed to User Content that is inaccurate, objectionable, inappropriate for children, or otherwise unsuitable, and you agree NexusTech will not be liable for any damages arising from such User Content.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <strong>Summary</strong>
              <p>Content you post or generate on grAdelytics remains yours.</p>
              <p>You warrant that you have all rights to provide that content.</p>
              <p>Others may view, edit, or share your content according to your settings and these Terms.</p>
              <p>You may not post content that is criminal, harmful, or violates your school’s or institution’s policies.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>3.</p>
            <p>User Content License Grant</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>By posting or otherwise making available any User Content on or through the Service, you expressly grant — and represent and warrant that you have all rights necessary to grant — NexusTech a royalty-free, sublicensable, transferable, perpetual, irrevocable, non-exclusive, worldwide license to reproduce, modify, publish, publicly display, create derivative works of, and otherwise use such User Content and your name, voice, and/or likeness as contained in your User Content, in whole or in part, in any form, media, or technology, whether now known or later developed, for use in connection with the Service and NexusTech’s (and its successors’ and affiliates’) business, including without limitation promoting and redistributing part or all of the Service (and derivative works thereof) in any media formats and through any media channels. NexusTech will only use your User Content consistent with the settings you provide in your settings page.</p>
              <p>If you are a Student, you agree that NexusTech may make your User Content available to your Educator(s) and Institution(s) for the purpose of improving grAdelytics, only and always on a confidential basis. NexusTech may use your Educational Records solely on an aggregated, de-identified basis and will not share such information with third parties.</p>
              <p>If you are an Educator or Institution, you agree that NexusTech may (i) make specific Educational Records available to the applicable Student, and (ii) for the purpose of improving grAdelytics, only and always on a confidential basis, otherwise use your Educational Records on an aggregated, de-identified basis and will not share such information with third parties.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>By posting content on grAdelytics, you grant us a license to use that content in ways needed to operate and improve the service, while we will only use it in line with your privacy/settings choices or on an aggregated, de-identified basis so that individual users are not personally identified.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>4.</p>
            <p>Our Proprietary Rights</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>Except for your User Content and Student Data, the grAdelytics Service and all materials made available through it, including software, platform design, interfaces, text, graphics, illustrations, logos, trademarks, service marks, documentation, audio, video, images, and other proprietary content, together with all related intellectual property rights, are owned by or licensed to NexusTech and its licensors. Except as expressly permitted under these Terms, no rights or licenses are granted to you in respect of such materials, and you may not copy, reproduce, distribute, modify, transmit, publicly display, create derivative works from, sell, license, rent, or otherwise exploit any part of the Service without prior written permission from NexusTech.</p>
              <p>You may choose to provide, and NexusTech may invite you to submit, feedback, suggestions, recommendations, enhancement requests, or ideas relating to the Service (“Feedback”). By submitting such Feedback, you agree that it is provided voluntarily, without expectation of compensation, confidentiality, or attribution, and NexusTech shall be free to use, modify, implement, disclose, and otherwise exploit such Feedback for any lawful purpose without restriction or obligation to you. Acceptance of such Feedback does not limit NexusTech’s right to use similar ideas independently developed, previously known, or obtained from other sources.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>We own the Service and the content we provide, which remains our property and is not yours; we welcome your feedback and ideas and may use them to improve the Service, but any idea you submit can be used without us owing you compensation.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>5.</p>
            <p>NexusTech Property</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>The grAdelytics Service, including its software, platform design, features, functionality, interfaces, documentation, trademarks, branding, and other proprietary materials (“NexusTech Property”), is owned by or licensed to NexusTech and is protected under applicable intellectual property laws. Except for the limited rights expressly granted under these Terms, no ownership or other rights in NexusTech Property are transferred to you.</p>
              <p>Your account provides a limited, non-transferable right to access and use the Service in accordance with these Terms. You do not acquire ownership rights in the Service or NexusTech Property by using the platform.</p>
              <p>NexusTech reserves the right to manage, modify, update, suspend, restrict, or discontinue features, functionality, or portions of the Service at its discretion, subject to applicable law and any contractual obligations. NexusTech may retain, archive, delete, or transfer platform data in accordance with its data retention practices, operational requirements, and applicable legal obligations.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>We own certain content on the Service and have ultimate authority over its presence, meaning we can manage, modify, or remove it as we choose, and we accept no liability for those actions.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>6.</p>
            <p>Privacy</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Student Data</h1>
                <p>If you are an educator or institution using grAdelytics, you authorize NexusTech to receive, access, and process student-related information provided through student information systems (SIS), secure file transfer methods, APIs, or other approved secure channels solely for the purpose of delivering the Service. “Student Data” means any information, in any format, relating to an identifiable current or former student that is provided by an educational institution or authorized user in connection with the Service.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Confidentiality</h1>
                <p>NexusTech agrees to treat Student Data as confidential and not to share it with third parties other than as described in these Terms, including the grAdelytics Privacy Policy, available at <a href='#' className='text-[#0068b3] underline'>grAdelytics.com/privacy.</a></p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>NexusTech Access</h1>
                <div className='flex flex-col gap-3'>
                  <p>You authorize NexusTech to access, process, and use Student Data solely for the purpose of providing, maintaining, and improving the grAdelytics Service in accordance with applicable law. As between NexusTech and the relevant Educator or Institution, all rights, title, and interest in the Student Data remain with the Educator, Institution, or the respective lawful owner, and NexusTech does not claim ownership over such Student Data except to the extent necessary to provide the Service. You acknowledge and agree that the Educator or Institution is solely responsible for ensuring that Student Data is lawfully collected, shared, and made available to NexusTech, and for the accuracy, legality, and authorization of such data, whether provided directly by the Educator, Institution, Student, or any authorized third party.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Third-Party Access</h1>
                <div className='flex flex-col gap-3'>
                  <p>By submitting Student Data to grAdelytics, you consent to allow grAdelytics to provide access to Student Data to its employees and to certain third party service providers which have a legitimate need to access such information in connection with their responsibilities in providing the Service. grAdelytics and its employees, subcontractors, service providers, or agents involved in the handling, transmittal, and processing of Student Data will be required to maintain the confidentiality of such data that includes personally identifiable information and shall not redisclose such data except as necessary in order to provide the Service or pursuant to the consent and direction of Institution or a Student over age 18. grAdelytics will maintain access log(s) that record all disclosures of or access to Student Data within its possession, and will provide copies of an access log(s) to you upon request.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Use of Student Data</h1>
                <div className='flex flex-col gap-3'>
                  <p>By submitting Student Data or other information to the grAdelytics Service, you represent and warrant that you have the necessary rights, permissions, and lawful authority to provide such data to NexusTech. You grant NexusTech a non-exclusive, royalty-free, worldwide, limited license for the duration necessary to use, process, transmit, store, reproduce, modify, and display such data solely for the purpose of providing, maintaining, securing, supporting, and improving the Service, and for enforcing its rights and obligations under these Terms.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Children’s Data Privacy</h1>
                <div className='flex flex-col gap-3'>
                  <p>NexusTech relies on each institution to obtain and provide appropriate consent and disclosures, if necessary, to allow students to access the grAdelytics service.</p>
                  <p>You represent and warrant that you have the authority to provide Student Data to NexusTech, and that you have provided appropriate disclosures to students and parents regarding your sharing of Student Data with service providers such as NexusTech, if needed. We recommend that you provide a copy of our <a href='#' className='text-[#0068b3] underline'>Privacy Policy</a> to parents and guardians.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Anonymized Data</h1>
                <div className='flex flex-col gap-3'>
                  <p>You agree that NexusTech may collect, analyze, and use data derived from Student Data, including de-identified, aggregated or anonymized Student Data, as well as data about your, and other users’ access and use of the Service, for purposes of operating, analyzing, improving, or marketing the Service and for the purpose of providing analytic services to the Institution or to other Institutions. If NexusTech shares or publicly discloses information (e.g., in marketing materials, in application development, or with third parties) that is derived from Student Data, such data will be de-identified to reasonably avoid identification of a specific institution or individual. You further agree that NexusTech will have the right, both during and after the Term of these Terms, to use, store, transmit, distribute, modify, copy, display, sublicense, and create derivative works of the de-identified, aggregated or anonymized data solely for the purposes of improving grAdelytics services.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Deletion Requests</h1>
                <div className='flex flex-col gap-3'>
                  <p>You may request that NexusTech delete Student Data in NexusTech’s possession at any time by providing such a request in writing, which request NexusTech shall then comply with in a commercially reasonable time. NexusTech is not required to delete data derived from Student Data, including de-identified, aggregated or anonymized Student Data.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Change of Control</h1>
                <div className='flex flex-col gap-3'>
                  <p>By submitting Student Data to the grAdelytics service, you consent to allow NexusTech to transfer Student Data to a new provider in the event that NexusTech sells, divests or transfers the business or a portion of the business, provided that the new provider has agreed to data privacy standards no less stringent than those set forth in these Terms. We may also transfer personal information – under the same conditions – in the course of mergers, acquisitions, bankruptcies, dissolutions, reorganizations, liquidations, similar transactions or proceedings involving all or a portion of our business.</p>
                </div>
              </div>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>You may use the grAdelytics Service only if you are legally capable of entering into a binding contract. You must create and maintain an account with accurate and up-to-date information, and you are responsible for maintaining the confidentiality of your account credentials and all activities carried out through your account. If you access or use the Service on behalf of an educator, institution, or organization, you represent and warrant that you have the necessary authority to do so. You agree not to misuse, disrupt, interfere with, or place an improper burden on the Service or its operations.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>7.</p>
            <p>Security</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>NexusTech uses commercially reasonable and appropriate physical, managerial, and technical safeguards to preserve the integrity and security of your personal information and implement your privacy settings. However, we cannot guarantee that unauthorized third parties will never be able to defeat our security measures or use your personal information for improper purposes. You acknowledge that you provide your personal information at your own risk.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>We own certain content on the Service and have ultimate authority over its presence, meaning we can manage, modify, or remove it as we choose, and we accept no liability for those actions.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>8.</p>
            <p>Paid Services</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Billing Policies</h1>
                <p>Certain aspects of the Service may be provided for a fee or other charge. Institutions may elect to pay the fees or charges of other Users (such as Educators). If you elect to use paid aspects of the Service, you agree to the <a href='/pricing' className='text-[#0068b3] underline'>pricing and payment terms</a>, as we may update them from time to time. You also agree to be bound by the specific terms included in any order form, statement of work, or the like (if applicable) to which you indicate your acceptance (for instance, by signing the document, via online click-through acceptance, or by making related payments to NexusTech). NexusTech may add new services to the grAdelytics service for additional fees and charges, or amend fees and charges for existing services, at any time in its sole discretion. Any change to our pricing or payment terms shall become effective in the billing cycle following notice of such change to you as provided in this Agreement.
                </p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Payment Information; Taxes</h1>
                <p>All information that you provide in connection with a purchase or transaction or other monetary transaction interaction with the Service must be accurate, complete, and current. You agree to pay all charges incurred by users of your credit card, debit card, or other payment method used in connection with a purchase or transaction or other monetary transaction interaction with the Service at the prices in effect when such charges are incurred. You will pay any applicable taxes, if any, relating to any such purchases, transactions or other monetary transaction interactions.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Mobile Charges</h1>
                <div className='flex flex-col gap-3'>
                  <p>You may use mobile data in connection with NexusTech’s mobile software applications and/or sign up to receive certain grAdelytics notifications or information via text messaging. You may incur additional charges from your wireless provider for these services. You agree that you are solely responsible for any such charges.</p>
                </div>
              </div>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>You may use the grAdelytics Service only if you are legally able to enter into a binding contract. You are responsible for maintaining accurate account information, keeping your login credentials secure, and all activities conducted through your account. If you use the Service on behalf of an institution, you represent that you have the authority to do so. You agree not to misuse, disrupt, or interfere with the proper functioning of the Service.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>9.</p>
            <p>Copyright Infringement Notice</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>If you believe that content hosted on the grAdelytics platform or website infringes your copyright or other intellectual property rights, please notify us so we can review and take appropriate action.</p>
              <p>NexusTech respects the intellectual property rights of authors, creators, educators, institutions, and other content owners. It is our policy to respond to valid notices of alleged copyright infringement in accordance with applicable laws, including the Copyright Act, 1957, the Information Technology Act, 2000, and other applicable Indian laws.</p>
              <p>If you believe that your copyrighted work has been copied, reproduced, uploaded, shared, or otherwise made available through the grAdelytics platform in a manner that constitutes infringement, please provide us with a written notice containing the following information:</p>
              <ul className='list-decimal pl-5'>
                <li>Your full name and contact details, including address, phone number, and email address;</li>
                <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf;</li>
                <li>Identification and description of the copyrighted work claimed to have been infringed;</li>
                <li>Identification of the allegedly infringing material, including its exact location on the platform (such as URL, page link, course reference, or other identifying details);</li>
                <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its authorized representative, or permitted by applicable law;</li>
                <li>A statement confirming that the information provided is accurate and that you are the copyright owner or are authorized to act on behalf of the copyright owner.</li>
              </ul>
              <p>Such notices may be sent to:</p>
              <div>
                <p>Attn: Copyright Infringement Notice</p>
                <p>NexusTech</p>
                <p>[Your Registered Business Address]</p>
                <p>Email: <a href='#' className='text-[#0068b3] underline'>legal@nexustech.com</a></p>
              </div>
              <p className='font-bold'>Upon receipt of a valid complaint, NexusTech may investigate the matter and take appropriate action, including removing or disabling access to the allegedly infringing material, notifying the relevant user, or suspending/terminating accounts in cases of repeated infringement.</p>
              <p className='uppercase'>Please note that knowingly submitting false, misleading, or fraudulent infringement claims may result in legal liability under applicable laws.</p>
              <p>This procedure is intended solely for reporting copyright or intellectual property infringement involving content hosted on the grAdelytics platform.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>If you believe that content hosted on the grAdelytics platform or website infringes your copyright or other intellectual property rights, please notify us so we can review and take appropriate action.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>10.</p>
            <p>Indemnity</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p>You agree to defend, indemnify, and hold harmless NexusTech, its affiliates, subsidiaries, licensors, service providers, partners, directors, officers, employees, consultants, contractors, and agents from and against any and all claims, demands, actions, proceedings, damages, losses, liabilities, penalties, costs, and expenses (including reasonable legal fees and related costs) arising out of or in connection with: (i) your access to or use of the grAdelytics platform, website, applications, or related services; (ii) your violation of these Terms and Conditions, including any breach of your representations, warranties, or obligations under these Terms; (iii) your violation of any applicable law, regulation, governmental order, or legal obligation; (iv) your infringement, misappropriation, or violation of any third-party rights, including intellectual property rights, privacy rights, confidentiality rights, or proprietary rights; (v) any content, data, files, materials, submissions, communications, assignments, course content, or other information uploaded, submitted, transmitted, or shared by you through the grAdelytics platform; (vi) any false, misleading, fraudulent, inaccurate, or unauthorized information provided by you; (vii) any misuse of the platform, including unauthorized access attempts, interference with platform operations, malicious activity, security breaches caused by your actions, or prohibited conduct; (viii) any activity carried out through your account, login credentials, or access permissions, whether authorized by you or resulting from your failure to maintain the confidentiality and security of your account credentials; or (ix) your negligent acts, omissions, fraud, or wilful misconduct.</p>
              <p>NexusTech reserves the right, at its own discretion and expense, to assume the exclusive defence and control of any matter otherwise subject to indemnification by you, in which case you agree to fully cooperate with NexusTech in asserting any available defences.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>The grAdelytics platform may contain links to third-party websites, applications, or services. NexusTech does not control or assume responsibility for such third-party resources.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>11.</p>
            <p>Disclaimer of Warranties</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p className='uppercase'>The grAdelytics platform, website, applications, and related services (“Service”) are provided on an “as is” and “as available” basis. Your use of the Service is entirely at your own risk, to the fullest extent permitted under applicable law.</p>
              <p className='uppercase'>NexusTech makes no representations or warranties, express or implied, regarding the Service, including but not limited to warranties of merchantability, satisfactory quality, fitness for a particular purpose, accuracy, availability, compatibility, security, non-infringement, or uninterrupted operation.</p>
              <p className='uppercase'>Without limiting the foregoing, NexusTech does not warrant or guarantee that: (I) the Service will meet your specific requirements, expectations, or intended use cases; (II) the Service will be continuously available, uninterrupted, timely, secure, or error-free; (III) any defects, bugs, errors, vulnerabilities, or technical issues will be corrected immediately or at all; (IV) the content, outputs, analytics, reports, recommendations, grades, evaluations, or other information generated through the Service will be accurate, complete, reliable, or suitable for decision-making without independent verification; (V) the Service or its servers will be free from viruses, malware, harmful code, or other disruptive components; (VI) files, data, or content downloaded, uploaded, stored, or transmitted through the Service will remain secure or free from corruption, loss, or unauthorized access.</p>
              <p className='uppercase'>Any content, materials, files, or data downloaded or otherwise obtained through the Service are accessed at your own discretion and risk, and you shall be solely responsible for any resulting damage to your devices, systems, software, network infrastructure, or data.</p>
              <p className='uppercase'>No oral or written information, communication, training, support, guidance, recommendation, or advice provided by NexusTech, its employees, representatives, partners, or support personnel shall create any warranty unless expressly stated in writing.</p>
              <p className='uppercase'>NexusTech does not endorse, guarantee, warrant, or assume responsibility for any third-party products, services, integrations, websites, applications, advertisements, or resources that may be linked to, integrated with, or accessible through the Service. Any dealings, purchases, subscriptions, or interactions with such third parties are solely between you and the relevant third party.</p>
              <p className='uppercase'>Nothing in this clause shall exclude or limit any rights that cannot be lawfully excluded or restricted under applicable Indian law.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>The grAdelytics platform may contain links to third-party websites, applications, or services. NexusTech does not control or assume responsibility for such third-party resources.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>12.</p>
            <p>Limitation of Liability</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-3'>
              <p className='uppercase'>To the fullest extent permitted under applicable law, NexusTech, its affiliates, directors, officers, employees, contractors, agents, licensors, service providers, and partners shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages, including without limitation loss of profits, revenue, business opportunities, goodwill, anticipated savings, educational outcomes, academic decisions, data, or other intangible losses, arising out of or relating to: (I) your use of, inability to use, or unavailability of the grAdelytics platform or related services; (II) interruptions, delays, downtime, outages, service degradation, or performance issues; (III) errors, inaccuracies, omissions, or incomplete content, reports, analytics, grading outputs, recommendations, or platform-generated information; (IV) unauthorized access to, use of, or alteration of your account, data, or communications; (V) security incidents, hacking, malware, viruses, trojan horses, ransomware, or other malicious activities by third parties; (VI) any loss, corruption, deletion, or unavailability of data, content, assignments, course materials, submissions, records, or communications; (VII) any conduct, content, or actions of users, institutions, educators, students, or other third parties using the platform; (VIII) reliance on any content, academic evaluations, automated outputs, or information obtained through the Service.</p>
              <p className='uppercase'>To the fullest extent permitted by law, NexusTech shall not be liable for any claims arising from: (I) service interruptions caused by maintenance, technical upgrades, infrastructure failures, internet outages, or force majeure events; (II) compatibility issues with your hardware, software, browser, mobile device, or third-party integrations; (III) delays, failures, or errors caused by third-party service providers, payment processors, cloud hosting providers, communication services, or external integrations; (IV) misuse of the platform by users, institutions, or unauthorized persons.</p>
              <p className='uppercase'>Where liability cannot be lawfully excluded, NexusTech’s aggregate liability arising out of or relating to the Service, whether in contract, tort (including negligence), statutory liability, or otherwise, shall not exceed the total fees actually paid by you to NexusTech for the specific Service giving rise to the claim during the twelve (12) months immediately preceding the event giving rise to such claim.</p>
              <p className='uppercase'>If you use the Service without payment, NexusTech’s maximum liability shall be limited to the minimum amount permitted under applicable law.</p>
              <p className='uppercase'>These limitations apply even if NexusTech has been advised of the possibility of such damages and even if any remedy fails of its essential purpose.</p>
              <p className='uppercase'>Nothing in these Terms shall exclude or limit liability that cannot be excluded or restricted under applicable law, including rights available under applicable consumer protection or statutory laws.</p>
              <p className='uppercase'>The Service is operated from India. Users accessing the Service from outside India do so at their own discretion and are responsible for compliance with applicable local laws and regulations.</p>
            </div>

            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>NexusTech’s liability in connection with the Service is limited to the extent permitted by applicable law.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>13.</p>
            <p>Governing Law and Dispute Resolution</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Governing Law</h1>
                <p>These Terms and Conditions, and any dispute, claim, controversy, or matter arising out of or relating to the use of the grAdelytics platform or services provided by NexusTech, shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.</p>
                <p>Subject to the dispute resolution provisions set out below, courts located in [Your City, India] shall have exclusive jurisdiction over matters arising under or in connection with these Terms.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Dispute Resolution and Arbitration</h1>
                <p className='uppercase'>If any dispute, claim, controversy, or disagreement arises out of or in connection with these Terms, the Service, or the relationship between you and NexusTech, the parties shall first attempt to resolve the matter amicably through good faith discussions.</p>
                <p>You agree to notify NexusTech of any dispute by sending written notice to:</p>
                <p>Email: <a href='#' className='text-[#0068b3] underline'>legal@nexustech.com</a></p>
                <p>If the dispute is not resolved within 30 (thirty) days from the date of written notice, the dispute shall be referred to and finally resolved by arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended from time to time.</p>
                <p>The arbitration shall: (I) be conducted by a sole arbitrator appointed by NexusTech, unless otherwise required by applicable law; (II) be conducted in the English language; (III) take place in [Bangalore, India]; (IV) be conducted in accordance with applicable Indian arbitration law.</p>
                <p>The arbitral award shall be final and binding on both parties.</p>
                <p>Nothing in this clause shall prevent NexusTech from seeking interim, injunctive, or equitable relief from any court of competent jurisdiction for the protection of its intellectual property rights, confidential information, data security, or proprietary interests.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Individual Claims</h1>
                <div className='flex flex-col gap-3'>
                  <p className='uppercase'>To the extent permitted by applicable law, claims arising under these Terms shall be brought by the relevant party in its individual capacity and not as part of any unauthorized representative or collective proceeding, except where otherwise required by law.</p>
                </div>
              </div>
            </div>
            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>These Terms are governed by Indian law. Disputes should first be resolved amicably, failing which they shall be resolved through arbitration in India.</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-6 text-lg text-[#003c46]'>
          <div className='flex flex-row items-center gap-4 text-2xl font-[600]'>
            <p className=''>14.</p>
            <p>General</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5 border-b border-gray-600 pb-3'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Assignment</h1>
                <p>These Terms, and any rights, obligations, or permissions granted under them, may not be transferred, assigned, sublicensed, or otherwise delegated by you without the prior written consent of NexusTech.</p>
                <p>NexusTech may assign, transfer, delegate, or otherwise transfer its rights and obligations under these Terms, in whole or in part, to any affiliate, successor, acquirer, or in connection with any merger, acquisition, restructuring, sale of business, or transfer of assets, without restriction.</p>
                <p>Any attempted transfer or assignment by you in violation of this clause shall be null and void.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Notifications and Changes to These Terms</h1>
                <p>NexusTech may provide notices, communications, disclosures, updates, or other information required by law or relating to business operations, service updates, account matters, security alerts, policy changes, or marketing communications through any of the following means: (I) email to the registered email address associated with your account; (II) notifications within the grAdelytics platform; (III) website announcements; (IV) written communication, where required by applicable law.</p>
                <p>You are responsible for ensuring that your contact details remain accurate and up to date.</p>
                <p>NexusTech shall not be responsible for any delay, failure, or inability to deliver communications caused by incorrect contact information, spam filters, network restrictions, technical issues, or actions of your service providers.</p>
                <p>NexusTech reserves the right to modify, amend, update, or replace these Terms at any time, at its discretion, to reflect changes in legal requirements, business operations, product features, security requirements, or service offerings.</p>
                <p>Where material changes are made, NexusTech will make reasonable efforts to notify users through appropriate channels and update the “Last Updated” date in these Terms.</p>
                <p>Your continued use of the Service after such changes become effective constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must discontinue use of the Service.</p>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Entire Agreement and Severability</h1>
                <div className='flex flex-col gap-3'>
                  <p>These Terms, together with the <a href='#' className='text-[#0068b3] underline'>Privacy Policy</a>, and any separate subscription agreement, enterprise agreement, institutional contract, service order, or other written agreement between you and NexusTech relating to the Service, constitute the entire agreement between you and NexusTech concerning the Service.</p>
                  <p>If any provision of these Terms is held to be invalid, unlawful, unenforceable, or ineffective by a court or authority of competent jurisdiction, that provision shall be enforced to the maximum extent permissible under applicable law, and the remaining provisions shall continue in full force and effect.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>No Waiver</h1>
                <div className='flex flex-col gap-3'>
                  <p>No failure, delay, or omission by NexusTech in exercising any right, power, or remedy under these Terms shall operate as a waiver of that right, nor shall any single or partial exercise of any such right prevent further exercise of that or any other right.</p>
                  <p>Any waiver of any provision of these Terms shall be effective only if made expressly in writing by an authorized representative of NexusTech.</p>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <h1 className='font-[600] text-xl'>Contact</h1>
                <div className='flex flex-col gap-3'>
                  <p>Please <a href='/contact-us' className='text-[#0068b3] underline'>contact us</a> with any questions regarding these Terms.</p>
                </div>
              </div>
            </div>
            <div className='bg-[#f2f5f6] p-4 text-[#636363] h-fit'>
              <p><strong>Summary: </strong>These Terms, together with our Privacy Policy and any applicable service-specific agreements, constitute the complete agreement between you and NexusTech. We may notify you of important updates through email, platform notifications, or our website.</p>
            </div>
          </div>
          <p>These Terms were last modified on <strong>May 12, 2026.</strong></p>
        </div>
      </section>


     <Footer/>

    </main>
  )
}

export default Termsandcondition
