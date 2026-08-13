import { 
  BookOpen, 
  BrainCircuit, 
  FileCheck, 
  Award, 
  ArrowRight 
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Choose Your Course",
    description: "Browse our AI-generated catalog of tech courses. From Web Development to Data Science, find the skill you want to master.",
    icon: BookOpen,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    title: "Learn with AI",
    description: "Access high-quality lessons, interactive quizzes, and AI-powered explanations. Learn at your own pace, completely free.",
    icon: BrainCircuit,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 text-purple-600",
  },
  {
    id: 3,
    title: "Pass the Exam",
    description: "Take the final certification exam. Our AI generates unique questions to test your knowledge thoroughly and fairly.",
    icon: FileCheck,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 text-orange-600",
  },
  {
    id: 4,
    title: "Get Certified",
    description: "Pay just ₦1,000 to unlock your verified, industry-recognized certificate. Share it on LinkedIn and boost your career.",
    icon: Award,
    color: "bg-green-500",
    lightColor: "bg-green-50 text-green-600",
  },
];

export default function LearningSteps() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">
            How It Works
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
            Your Path to Tech Mastery
          </p>
          <p className="mt-4 text-lg text-gray-600">
            We’ve simplified the learning process. Start for free, learn with AI, and only pay when you’re ready to get certified.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          
          {/* Desktop Connector Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

          <div className="grid gap-8 lg:grid-cols-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group">
                  
                  {/* Card Content */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    
                    {/* Icon Circle */}
                    <div className={`w-14 h-14 rounded-2xl ${step.lightColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} />
                    </div>

                    {/* Step Number Badge (Desktop) */}
                    <div className="hidden lg:flex absolute -top-4 -right-4 w-8 h-8 bg-gray-900 text-white rounded-full items-center justify-center text-sm font-bold shadow-md border-4 border-white">
                      {step.id}
                    </div>

                    {/* Text */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {step.description}
                    </p>

                    {/* Arrow to next step (Hidden on last item) */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20 text-gray-300">
                        <ArrowRight size={24} />
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-6">Ready to start your journey?</p>
          <a 
            href="/courses" 
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition shadow-lg hover:shadow-orange-600/20"
          >
            Browse Courses <ArrowRight size={18} />
          </a>
        </div>

      </div>
    </section>
  );
}