import { 
  BrainCircuit, 
  Award, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Zap,
  BookOpen,
  Users
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Curriculum",
    description: "Our courses are constantly updated by advanced AI to ensure you learn the most relevant and in-demand tech skills.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Award,
    title: "Affordable Certification",
    description: "Get an industry-recognized certificate for just ₦1,000 after passing your final exam. No hidden fees.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Clock,
    title: "Learn at Your Own Pace",
    description: "Access course materials 24/7. Study whenever and wherever you want, fitting education into your busy schedule.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Join thousands of students from across Nigeria and beyond. Share knowledge, collaborate, and grow together.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: ShieldCheck,
    title: "Verified & Secure",
    description: "Your progress and certificates are securely stored on the blockchain-inspired database, ensuring they are tamper-proof.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Interactive Exams",
    description: "Test your knowledge with AI-generated quizzes and final exams that adapt to your learning level.",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">
            Why Choose Us?
          </h2>
          <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
            The Smarter Way to Learn Tech
          </p>
          <p className="mt-4 text-lg text-gray-600">
            We combine cutting-edge AI technology with expert-led content to provide 
            an unmatched learning experience that is both affordable and effective.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Corner Accent */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA / Trust Bar */}
        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                   {/* Placeholder for user avatars */}
                   <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">U{i}</div>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">10,000+</span> students already joined
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>50+ Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Expert Mentors</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}