"use client";

import { 
  BrainCircuit, 
  Sparkles, 
  Bot, 
  MessageSquare, 
  Zap, 
  Target,
  TrendingUp,
  Shield,
  ChevronRight,
  Play
} from "lucide-react";

const aiFeatures = [
  {
    icon: BrainCircuit,
    title: "AI-Generated Curriculum",
    description: "Our courses are created and updated by advanced AI to ensure you're always learning the most current and relevant tech skills.",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: MessageSquare,
    title: "Smart Q&A Assistant",
    description: "Get instant answers to your questions 24/7 with our AI-powered learning assistant that understands context and provides detailed explanations.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Target,
    title: "Personalized Learning Path",
    description: "AI analyzes your progress and learning style to recommend the perfect next steps, ensuring you learn at your optimal pace.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Zap,
    title: "Adaptive Quizzes",
    description: "Take AI-generated quizzes that adjust difficulty based on your performance, helping you master concepts efficiently.",
    gradient: "from-yellow-500 to-orange-600",
  },
];

const stats = [
  { label: "AI-Powered Courses", value: "50+", icon: Bot },
  { label: "Smart Assessments", value: "1000+", icon: TrendingUp },
  { label: "Instant Feedback", value: "24/7", icon: Sparkles },
  { label: "Success Rate", value: "95%", icon: Shield },
];

export default function AISection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f20_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f20_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-orange-400 mb-6">
            <Sparkles size={16} />
            <span>Powered by Advanced AI</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Learning Enhanced by{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 leading-relaxed">
            Experience the future of education with our AI-powered platform that adapts to your 
            learning style, provides instant feedback, and ensures you master every concept.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors duration-300"
              >
                <Icon className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient Icon Background */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-orange-400 transition-colors">
                    <span>Learn more</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Demo/CTA Section */}
        <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f9731620_0%,transparent_70%)]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience AI-Powered Learning?
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already learning faster and smarter with our 
              intelligent platform. Start your first course today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-4 text-base font-semibold text-white rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-xl hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all duration-200">
                <Play size={18} className="group-hover:scale-110 transition-transform" />
                Start Learning Free
              </button>
              <button className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 text-base font-semibold text-white rounded-xl hover:bg-white/20 transition-all duration-200">
                See How It Works
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <p className="text-center text-sm text-gray-400 mb-6">
            Trusted by leading tech companies and institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {/* Placeholder company logos - replace with actual logos */}
            {["Google", "Microsoft", "Amazon", "Meta", "Apple"].map((company) => (
              <div key={company} className="text-xl font-bold text-gray-500">
                {company}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}