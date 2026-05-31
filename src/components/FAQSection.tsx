const faqs = [
  {
    question: "Can CircleWorks run payroll in every US state?",
    answer:
      "Yes. CircleWorks supports payroll across all 50 states, including payroll tax calculations, filings, and direct deposit workflows.",
  },
  {
    question: "Do you charge per payroll run?",
    answer: "No. Unlimited runs on every plan.",
  },
  {
    question: "Does CircleWorks replace separate HR, hiring, and benefits tools?",
    answer:
      "CircleWorks brings payroll, HRIS, ATS, onboarding, benefits, time, compliance, and reporting into one employee system of record.",
  },
  {
    question: "Can employees manage their own documents and pay information?",
    answer:
      "Yes. Employees get self-service access for pay stubs, tax forms, profile details, benefits, time, expenses, and documents.",
  },
  {
    question: "Does CircleWorks support compliance and audit trails?",
    answer:
      "Yes. The platform includes compliance workflows, audit logs, tax filing support, and reporting built for US employers.",
  },
  {
    question: "Can finance teams export payroll and reporting data?",
    answer:
      "Yes. Payroll, expense, and people analytics data can be reviewed, exported, and connected into supported accounting workflows.",
  },
  {
    question: "How quickly can a company get started?",
    answer:
      "Most teams can begin setup quickly with guided onboarding for company details, employees, payroll settings, benefits, and integrations.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="w-full bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            FAQ
          </p>
          <h2 className="mt-4 text-[36px] font-bold leading-tight text-gray-900 md:text-[48px]">
            Questions before you switch?
          </h2>
          <p className="mt-4 text-[20px] text-gray-500">
            The short answers HR, payroll, and finance teams usually need first.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 hover:bg-white hover:shadow-lg"
            >
              <summary className="cursor-pointer list-none text-base font-bold text-gray-900">
                <span className="flex items-start justify-between gap-4">
                  {faq.question}
                  <span className="mt-1 text-blue-600 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
