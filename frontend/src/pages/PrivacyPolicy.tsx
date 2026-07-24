import React from 'react';
import { SEO } from '../components/layout/SEO';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function PrivacyPolicyPage() {
  return (
    <>
      <SEO title="Privacy Policy | Headhunters.lk" description="Privacy Policy for Headhunters.lk." />
      <Header />
      <main className="pt-24 pb-20 min-h-[80vh] bg-black text-left">
        <div className="max-w-[900px] mx-auto px-4 md:px-5">
          <h1 className="text-[32px] md:text-[48px] font-bold text-[#04a891] mb-2 leading-tight">Privacy Policy</h1>
          <p className="text-[14px] md:text-[16px] font-medium text-white/50 mb-8">Headhunters (Private) Limited • Effective date: 24 July 2026</p>
          
          <div className="italic bg-[#02695e]/10 border border-[#04a891]/20 p-6 rounded-lg text-white/70 text-[16px] leading-[1.6] mb-12">
            This Privacy Policy explains how Headhunters handles personal data through its website and recruitment, HR, candidate, employer and related services. It is drafted with the Sri Lankan Personal Data Protection Act, No. 9 of 2022, as amended, and relevant Swiss data-protection principles in mind. It is not a substitute for advice on your actual systems and processing arrangements. By <span className="hover:text-red-500 transition-colors cursor-default">fenra</span>.
          </div>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">1. Who we are and scope</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Headhunters (Private) Limited is the primary controller of personal data collected through Headhunters.lk and its Sri Lankan recruitment operations, unless we tell you otherwise. "Personal data" means information relating to an identified or identifiable individual.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">This Policy covers candidates, job applicants, client and prospective-client contacts, referees, website visitors, suppliers, business partners and persons who communicate with us.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Our Switzerland-based parent or affiliate, expected to be Digital Cherry, may receive or process personal data when it provides group management, technology, support, marketing or recruitment assistance. Depending on the activity, it may act as our processor, a joint controller or an independent controller. We will clarify roles and apply appropriate contractual and cross-border safeguards.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">2. Personal data we collect</h2>
            
            <h3 className="text-[18px] font-bold text-[#f2f7f6] mb-[16px] mt-[32px]">2.1 Candidates and applicants</h3>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">identity and contact details, including name, address, email, telephone, WhatsApp number, date of birth or age where relevant;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">CV, employment history, job titles, employer, education, qualifications, professional memberships, skills, languages and portfolio information;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">current and expected salary, notice period, availability, preferred role, industry, work type and location;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">application history, interview notes, assessments, recruiter communications, matching decisions, offers and placement outcomes;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">references and background, identity, right-to-work or compliance information where appropriate and lawful;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">profile photographs and information you voluntarily include in a CV or communication, including sensitive data.</li>
            </ul>

            <h3 className="text-[18px] font-bold text-[#f2f7f6] mb-[16px] mt-[32px]">2.2 Clients, prospects and business contacts</h3>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">name, employer, title, business contact details and communication history;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">vacancy requirements, hiring preferences, service enquiries, contracts, billing information and relationship records;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">website, event, campaign and marketing interactions.</li>
            </ul>

            <h3 className="text-[18px] font-bold text-[#f2f7f6] mb-[16px] mt-[32px]">2.3 Website and communications data</h3>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">IP address, device, browser, operating system, approximate location, referral source, pages viewed, clicks, timestamps and cookie identifiers;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">form submissions, uploaded files, chat transcripts, consent records, support requests and security logs;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">telephone, email, SMS and WhatsApp communications and related metadata.</li>
            </ul>

            <h3 className="text-[18px] font-bold text-[#f2f7f6] mb-[16px] mt-[32px]">2.4 Data from other sources</h3>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We may receive personal data from job boards, professional networks, public sources, referrals, referees, employers, advertising platforms, recruitment partners, service providers or our group companies. If someone refers you, they should have authority to share your details. We may contact you to provide this Policy and explain available choices.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">3. Why and on what basis we process data</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We process personal data only for specified, legitimate purposes and on an appropriate legal basis available under applicable law. Depending on the activity, this may include your consent; taking steps at your request before a contract; performing a contract; complying with a legal obligation; protecting vital interests; or pursuing legitimate interests that are not overridden by your rights.</p>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">create, maintain and update candidate profiles;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">receive applications, assess suitability, match candidates to vacancies and communicate about opportunities;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">present suitable candidates to authorised employers and manage interviews, offers and placements;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">verify information, obtain references and conduct lawful checks with appropriate notice or consent;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">respond to employer enquiries, deliver contracted services and manage accounts, billing and relationships;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">operate, secure, troubleshoot, analyse and improve our website, databases, chatbot and services;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">prevent fraud, misuse, unlawful activity and security incidents;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">maintain records, exercise or defend legal claims and comply with law, regulators and court orders;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">send service communications and, with consent where required, relevant recruitment updates or marketing.</li>
            </ul>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">You may withdraw consent at any time, without affecting processing already lawfully carried out. If processing is necessary for a requested service or legal requirement, refusing required data may prevent us from providing that service.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">4. Recruitment matching, profiling and AI-assisted tools</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We may use search, ranking, parsing, matching, chatbot, transcription or other automated tools to organise CV information, identify potentially relevant vacancies or candidates, support communications, reduce duplication and assist recruiters. These tools may consider experience, qualifications, skills, location, availability and stated preferences.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Unless we expressly notify you otherwise, we do not intend to make a final hiring or similarly significant decision solely by automated means. Recruiters and clients remain responsible for meaningful review and hiring decisions. You may ask for information about relevant automated processing, request human review where applicable, correct inaccurate data or object as permitted by law.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Do not place unnecessary sensitive information in your CV or chatbot messages. Where an AI or hosting vendor processes data for us, we will require appropriate confidentiality, security, purpose restrictions and deletion or return obligations.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">5. Sensitive personal data</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">A CV may reveal health, disability, ethnicity, religion, trade-union membership, political views, biometric information or other sensitive data. Please provide sensitive data only when relevant and requested. We will process it only where an additional lawful condition applies, such as explicit consent, employment-law necessity, legal claims, substantial public interest or another basis permitted by law.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">6. When we disclose personal data</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We may disclose only the information reasonably necessary to:</p>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">prospective or actual employers and their authorised personnel for relevant recruitment and hiring;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">our Switzerland-based parent/affiliate and other approved group personnel supporting the service;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">recruitment partners, referees, screening providers, professional advisers and insurers;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">cloud hosting, database, email, messaging, analytics, advertising, customer-support, document-processing and cybersecurity providers acting under contract;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">government authorities, regulators, law-enforcement agencies, courts or other persons where required or permitted by law;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">a buyer, investor or successor in a genuine corporate transaction, subject to confidentiality and lawful safeguards.</li>
            </ul>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We do not sell personal data. We do not allow a client to use candidate data for unrelated advertising, unauthorised talent pooling or disclosure.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">7. International transfers</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Personal data may be accessed or stored outside Sri Lanka, including in Switzerland and countries where our service providers operate. International transfers can expose data to different legal regimes.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Before transferring data, we will assess the purpose, destination, recipient and risks and use safeguards required by applicable law. These may include an adequacy decision, contractual data-protection clauses, intra-group arrangements, binding corporate rules, consent or another permitted transfer mechanism. We will also apply data minimisation, access controls, encryption or other supplementary measures where appropriate.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Where Swiss personal data is transferred abroad, the relevant Swiss Federal Act on Data Protection requirements will be considered. You may contact us for general information about the safeguards applicable to your data, subject to confidentiality and security restrictions.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">8. Retention</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We retain personal data only as long as reasonably necessary for the relevant purpose, legal obligations, dispute resolution and security. Retention depends on the type of record, recruitment cycle, relationship, consent, legal limitation periods and operational need.</p>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1"><strong>Unsuccessful candidate profiles and CVs:</strong> normally up to 24 months after the last meaningful contact, unless you request earlier deletion, renew your interest or law requires longer retention.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1"><strong>Applications, interview and placement records:</strong> for the recruitment process and then for the period reasonably needed for service, audit, legal and dispute purposes.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1"><strong>Client, contract, invoice and transaction records:</strong> for the contract term and applicable statutory, tax and limitation periods.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1"><strong>Marketing records:</strong> until consent is withdrawn or you object, plus a minimal suppression record to honour the request.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1"><strong>Security, access and technical logs:</strong> for a shorter period appropriate to security and troubleshooting, unless needed for an incident or legal claim.</li>
            </ul>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">When retention ends, data will be securely deleted, anonymised or archived with restricted access. The published period must match the company’s implemented retention schedule.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">9. Security</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We use risk-appropriate technical and organisational measures such as role-based access, authentication, secure transmission, protected storage, logging, backups, malware controls, staff confidentiality, vendor assessment and incident procedures. No online system is completely secure, so we cannot guarantee absolute security.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">If a personal-data breach occurs, we will investigate, contain and document it and notify the Data Protection Authority of Sri Lanka, affected persons or other authorities where and when required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">10. Your rights</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Subject to applicable law, identity verification and lawful exceptions, you may have the right to:</p>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">receive clear information about how your personal data is processed;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">request access to personal data and prescribed supporting information;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">request correction or completion of inaccurate or incomplete data;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">request erasure where data is no longer needed or processing is otherwise unlawful;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">object to or request restriction of certain processing;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">withdraw consent at any time;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">object to direct marketing and stop promotional communications;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">request review of a qualifying automated decision and present your point of view;</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">lodge a complaint with the Data Protection Authority of Sri Lanka or another competent authority.</li>
            </ul>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">To exercise a right, contact info@headhunters.lk with enough information to identify you and the request. We may request proof of identity and may withhold information that would adversely affect another person’s rights, reveal confidential information or fall within a lawful exception. We will respond within the period required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">11. Direct marketing and vacancy alerts</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We may send vacancy alerts or promotional messages where you have requested them, consented where required or another lawful basis applies. You can opt out through an unsubscribe link or by contacting us. Opting out of marketing will not stop essential service communications about an active enquiry, application, contract or security matter.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">12. Cookies and analytics</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">The website may use essential cookies needed for security, preferences, forms, chat and session functions. With consent where required, it may also use analytics, advertising or social-media technologies to understand use and measure campaigns.</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">A cookie banner should allow visitors to accept or reject non-essential cookies before they are set. The website should publish a separate Cookie Notice or configure this section with the actual cookie names, providers, purposes and durations. Browser controls can also restrict cookies, but some functions may not work properly.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">13. Children</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Our recruitment services are generally intended for persons legally able to seek employment. We do not knowingly collect personal data from children through the website without a lawful basis and appropriate parent or guardian involvement. If you believe a child has submitted data improperly, contact us so we can investigate and take appropriate action.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">14. Third-party websites and platforms</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Links, social networks, WhatsApp, job boards, payment services and other third-party platforms operate under their own privacy policies. We are not responsible for their independent processing. Before using them, review their notices and privacy controls.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">15. Complaints and contact</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Contact us first so we can try to resolve a privacy concern:</p>
            
            <div className="overflow-x-auto mb-[16px]">
              <table className="w-full text-left text-[14px] md:text-[16px] leading-[1.6] border-collapse text-white/70">
                <tbody>
                  <tr className="border-b border-white/10"><th className="py-3 pr-4 font-bold text-[#f2f7f6]">Company</th><td className="py-3">Headhunters (Private) Limited</td></tr>
                  <tr className="border-b border-white/10"><th className="py-3 pr-4 font-bold text-[#f2f7f6]">Address</th><td className="py-3">No. 06, Pinto Place, Colombo 06, Sri Lanka 00600</td></tr>
                  <tr className="border-b border-white/10"><th className="py-3 pr-4 font-bold text-[#f2f7f6]">Email</th><td className="py-3">info@headhunters.lk</td></tr>
                  <tr className="border-b border-white/10"><th className="py-3 pr-4 font-bold text-[#f2f7f6]">Phone / WhatsApp</th><td className="py-3">+94 77 397 5048 / 077 400 1484</td></tr>
                  <tr className="border-b border-white/10"><th className="py-3 pr-4 font-bold text-[#f2f7f6]">Website</th><td className="py-3">https://www.headhunters.lk/</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">Data Protection Officer or privacy contact: [insert name or role and dedicated email if designated].</p>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">You may also complain to the Data Protection Authority of Sri Lanka through its official channels at <a href="https://www.dpa.gov.lk/" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.dpa.gov.lk/</a>. If Swiss law applies, information about the Federal Data Protection and Information Commissioner is available at <a href="https://www.edoeb.admin.ch/" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.edoeb.admin.ch/</a>.</p>
          </section>

          <section>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#04a891] mt-[32px] md:mt-[48px] mb-[16px] md:mb-[24px]">16. Changes to this Policy</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-white/70 mb-[16px]">We may update this Policy when our services, systems, providers or legal obligations change. The current version and effective date will be posted on the website. We will provide additional notice where a change materially affects your rights or requires renewed consent.</p>
          </section>

          <section className="pt-[40px] mt-[48px] border-t border-white/10">
            <h3 className="text-[18px] font-bold text-[#f2f7f6] mb-[16px]">Pre-publication confirmation checklist</h3>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Insert the exact registered name and company registration number of the Sri Lankan entity.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Confirm the Swiss parent/affiliate’s full legal name, registered address and actual processing role.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Appoint or identify the privacy contact/Data Protection Officer where required.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Confirm the implemented CV retention period; the draft proposes 24 months.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Inventory all hosting, CRM/ATS, chatbot/AI, analytics, advertising, email, WhatsApp and cloud vendors and countries.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Sign processor and cross-border agreements before transferring personal data.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Configure consent logging, marketing opt-out, data-subject request and breach-response workflows.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Publish a cookie banner and provider-specific Cookie Notice if non-essential cookies are used.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Ensure employer service agreements restrict candidate-data use and include confidentiality/privacy duties.</li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Obtain Sri Lankan legal review and Swiss advice if the parent actively processes Swiss personal data or jointly determines purposes.</li>
            </ul>

            <h3 className="text-[18px] font-bold text-[#f2f7f6] mb-[16px] mt-[32px]">Reference sources used for this drafting note</h3>
            <ul className="space-y-[12px] list-none ml-4 mb-[16px] text-[14px] md:text-[16px] leading-[1.6] text-white/70">
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Sri Lanka Data Protection Authority: <a href="https://www.dpa.gov.lk/" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.dpa.gov.lk/</a></li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Sri Lanka Personal Data Protection (Amendment) Act, No. 22 of 2025: <a href="https://www.parliament.lk/uploads/acts/gbills/english/6384.pdf" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.parliament.lk/uploads/acts/gbills/english/6384.pdf</a></li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Swiss Federal Act on Data Protection: <a href="https://www.fedlex.admin.ch/eli/cc/2022/491/en" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.fedlex.admin.ch/eli/cc/2022/491/en</a></li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Swiss FDPIC cross-border transfer guidance: <a href="https://www.edoeb.admin.ch/en/cross-border-transfer-of-personal-data" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.edoeb.admin.ch/en/cross-border-transfer-of-personal-data</a></li>
              <li className="relative pl-6 before:content-['•'] before:text-[#04a891] before:absolute before:left-0 before:text-xl before:-top-1">Sri Lanka Electronic Transactions (Amendment) Act, No. 25 of 2017: <a href="https://www.srilankalaw.lk/YearWisePdf/2017/25-2017_E.pdf" target="_blank" rel="noopener noreferrer" className="text-[#04a891] hover:underline">https://www.srilankalaw.lk/YearWisePdf/2017/25-2017_E.pdf</a></li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
