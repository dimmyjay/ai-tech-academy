import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  PlayCircle, 
  Users, 
  Award, 
  Zap, 
  BookOpen,
  CheckCircle2
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl -z-10"></div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-6">
              <Sparkles size={16} className="text-orange-500" />
              <span>Powered by Advanced AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Master Tech Skills with{" "}
              <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Courses
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Learn Web Development, Data Science, UI/UX, and more at your own pace. 
              Complete the course and get an industry-recognized certificate for just{" "}
              <span className="font-bold text-gray-900">₦1,000</span>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/courses"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-orange-600 px-8 py-4 text-base font-semibold text-white rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Explore Courses
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/pricing"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <PlayCircle size={18} className="text-orange-600" />
                How it Works
              </Link>
            </div>

            {/* Trust Indicators / Features */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>100% Online</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Self-Paced Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Verified Certificates</span>
              </div>
            </div>
          </div>

          {/* Right Visual - Student with iPad */}
          <div className="relative hidden lg:flex items-center justify-center h-[600px]">
            {/* Main Student Image */}
            <div className="relative z-10 w-full max-w-[500px]">
              <img
                src="/images/student-ipad-studying.png"
                alt="Student learning on iPad with AI Tech Academy"
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                style={{ maxHeight: '550px' }}
              />
              
              {/* Floating Badge - AI Powered */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2 transform -rotate-6 animate-bounce-slow">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Zap size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">AI Powered</p>
                  <p className="text-[10px] text-gray-500">Smart Learning</p>
                </div>
              </div>

              {/* Floating Badge - Certificate */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2 transform rotate-6">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Get Certified</p>
                  <p className="text-[10px] text-gray-500">Just ₦1,000</p>
                </div>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-orange-200/30 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">50+</p>
              <p className="mt-1 text-sm text-gray-500 font-medium">Tech Courses</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">10k+</p>
              <p className="mt-1 text-sm text-gray-500 font-medium">Active Students</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">95%</p>
              <p className="mt-1 text-sm text-gray-500 font-medium">Completion Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-orange-600">₦1k</p>
              <p className="mt-1 text-sm text-gray-500 font-medium">Certificate Fee</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}