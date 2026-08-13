// app/about/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import {
  Target,
  BrainCircuit,
  Heart,
  Users,
  Rocket,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Code2,
  GraduationCap,
  Building2,
} from "lucide-react";

// ==========================================
// SEO METADATA
// ==========================================

export const metadata: Metadata = {
  title: "About AI Tech Academy | Built by TechTune International",
  description:
    "Learn about AI Tech Academy, an innovative technology education platform built and powered by TechTune International to make quality tech education more accessible.",
};

// ==========================================
// CORE VALUES
// ==========================================

const coreValues = [
  {
    icon: Heart,
    title: "Accessibility First",
    description:
      "We believe everyone should have the opportunity to learn valuable technology skills regardless of their financial background or location.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Learning",
    description:
      "We use artificial intelligence and modern technology to create smarter, more engaging, and personalized learning experiences.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Target,
    title: "Practical Skills",
    description:
      "Our goal is not just to help learners understand technology, but to equip them with practical skills they can apply to real-world projects and opportunities.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Users,
    title: "Community & Growth",
    description:
      "Learning is more powerful when people grow together. We are building an environment that encourages learning, collaboration, and continuous improvement.",
    color: "bg-green-100 text-green-600",
  },
];

// ==========================================
// WHAT WE OFFER
// ==========================================

const learningAreas = [
  {
    icon: Code2,
    title: "Web Development",
    description:
      "Learn the skills needed to design and build modern websites and web applications.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: BrainCircuit,
    title: "Data Science & AI",
    description:
      "Explore data, artificial intelligence, machine learning, and the technologies shaping the future.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Lightbulb,
    title: "UI/UX Design",
    description:
      "Develop practical design skills for creating beautiful, intuitive, and user-friendly digital experiences.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Globe,
    title: "Cybersecurity",
    description:
      "Build knowledge of cybersecurity concepts and learn how digital systems and information can be protected.",
    color: "bg-green-100 text-green-600",
  },
];

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function AboutPage() {
  return (
    <main className="bg-white text-gray-900">

      {/* ========================================== */}
      {/* 1. HERO SECTION */}
      {/* ========================================== */}

      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        {/* Orange Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-100/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6">

            <Sparkles
              size={16}
              className="text-orange-500"
            />

            <span>About AI Tech Academy</span>

          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">

            Empowering the Next Generation of{" "}

            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Tech Talent
            </span>

          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">

            AI Tech Academy is an innovative technology education platform
            built and powered by{" "}

            <strong className="text-gray-900">
              TechTune International
            </strong>

            {" "}to make quality technology education more accessible,
            practical, and engaging.

          </p>

        </div>

      </section>

      {/* ========================================== */}
      {/* 2. OUR STORY */}
      {/* ========================================== */}

      <section className="py-20 bg-gray-50">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT - STORY */}
            <div>

              <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-5">

                <GraduationCap size={16} />

                <span>Our Story</span>

              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">

                Why AI Tech Academy Was Created

              </h2>

              <div className="space-y-5 text-gray-600 leading-relaxed">

                <p>
                  Technology is transforming the world, creating new
                  opportunities for people and businesses every day. However,
                  access to quality technology education remains a challenge
                  for many people.
                </p>

                <p>
                  AI Tech Academy was created to help address this challenge
                  by providing a modern platform where people can learn
                  valuable technology skills in a simple, practical, and
                  accessible way.
                </p>

                <p>
                  The platform brings together technology education,
                  artificial intelligence, practical learning resources, and
                  digital innovation to create a better learning experience.
                </p>

                <p>
                  Most importantly, AI Tech Academy is not a standalone
                  organization. It is a digital product conceived, designed,
                  and developed by{" "}
                  <strong className="text-gray-900">
                    TechTune International
                  </strong>
                  .
                </p>

              </div>

              {/* Highlights */}
              <div className="mt-8 space-y-3">

                {[
                  "Learn valuable technology skills",
                  "Access modern and practical learning resources",
                  "Use AI-powered learning tools",
                  "Develop skills for the digital economy",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >

                    <CheckCircle2
                      size={20}
                      className="text-green-500 flex-shrink-0"
                    />

                    <span className="font-medium text-gray-700">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* RIGHT - PLATFORM CARD */}
            <div className="relative">

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">

                <div className="flex items-center gap-4 mb-8">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">

                    <GraduationCap
                      className="text-white"
                      size={30}
                    />

                  </div>

                  <div>

                    <h3 className="text-2xl font-bold text-gray-900">
                      AI Tech Academy
                    </h3>

                    <p className="text-sm text-gray-500">
                      Built by TechTune International
                    </p>

                  </div>

                </div>

                <div className="space-y-6">

                  <div className="p-5 bg-orange-50 rounded-2xl">

                    <p className="text-sm font-semibold text-orange-600 mb-1">
                      Our Purpose
                    </p>

                    <p className="text-gray-700 leading-relaxed">
                      To make technology education more accessible and help
                      learners develop skills that can create opportunities
                      in the digital economy.
                    </p>

                  </div>

                  <div className="p-5 bg-gray-50 rounded-2xl">

                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Our Technology Partner
                    </p>

                    <p className="text-gray-700 leading-relaxed">
                      AI Tech Academy is designed, developed, and powered by
                      TechTune International.
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      className="text-green-500"
                      size={22}
                    />

                    <span className="font-semibold text-gray-800">
                      Built with technology and innovation
                    </span>

                  </div>

                </div>

              </div>

              {/* Floating Icon */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg rotate-6 hidden lg:block">

                <BrainCircuit
                  className="text-white"
                  size={32}
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================== */}
      {/* 3. BUILT BY TECHTUNE INTERNATIONAL */}
      {/* ========================================== */}

      <section className="py-24 bg-white">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* TEXT */}
            <div className="order-2 lg:order-1">

              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-5">

                <Building2 size={16} />

                <span>Built by TechTune International</span>

              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">

                Technology Behind the Academy

              </h2>

              <div className="space-y-5 text-gray-600 leading-relaxed">

                <p>
                  TechTune International is the technology company behind AI
                  Tech Academy.
                </p>

                <p>
                  With a focus on software development, digital innovation,
                  artificial intelligence, and creative technology, TechTune
                  International builds digital products designed to solve
                  real-world problems.
                </p>

                <p>
                  AI Tech Academy is one of those products. It represents our
                  vision of using technology not only to build software, but
                  also to create opportunities through education and
                  knowledge.
                </p>

                <p>
                  From the platform's technology and user experience to its
                  digital learning environment, AI Tech Academy is part of
                  TechTune International's broader commitment to innovation.
                </p>

              </div>

              <div className="mt-8">

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >

                  Connect With TechTune International

                  <ArrowRight size={18} />

                </Link>

              </div>

            </div>

            {/* IMAGE */}
            <div className="order-1 lg:order-2">

              <div className="relative max-w-lg mx-auto">

                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl"></div>

                <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-gray-100 bg-gray-100">

                  <Image
                    src="/images/techtune-founder.jpg"
                    alt="TechTune International"
                    width={900}
                    height={900}
                    priority
                    className="w-full h-auto object-cover"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================== */}
      {/* 4. WHAT AI TECH ACADEMY OFFERS */}
      {/* ========================================== */}

      <section className="py-24 bg-gray-50">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">

              <GraduationCap size={16} />

              <span>Learning With Purpose</span>

            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">

              What You Can Learn

            </h2>

            <p className="text-lg text-gray-600">

              AI Tech Academy provides learning opportunities across
              important areas of modern technology.

            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {learningAreas.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >

                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.color} mb-5`}
                  >

                    <Icon size={24} />

                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">

                    {item.title}

                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">

                    {item.description}

                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* ========================================== */}
      {/* 5. CORE VALUES */}
      {/* ========================================== */}

      <section className="py-24 bg-white">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">

              The Principles Behind AI Tech Academy

            </h2>

            <p className="text-lg text-gray-600">

              Everything we build is guided by our commitment to accessible
              education, practical learning, innovation, and growth.

            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {coreValues.map((value) => {

              const Icon = value.icon;

              return (

                <div
                  key={value.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >

                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${value.color} mb-5`}
                  >

                    <Icon size={24} />

                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">

                    {value.title}

                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">

                    {value.description}

                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* ========================================== */}
      {/* 6. OUR VISION */}
      {/* ========================================== */}

      <section className="py-24 bg-gray-50">

        <div className="mx-auto max-w-6xl px-6">

          <div className="grid lg:grid-cols-2 gap-12">

            {/* Mission */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm">

              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 mb-6">

                <Target
                  size={28}
                  className="text-orange-600"
                />

              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-5">

                Our Mission

              </h2>

              <p className="text-gray-600 leading-relaxed text-lg">

                To make quality technology education more accessible by
                combining modern learning methods, artificial intelligence,
                practical resources, and digital innovation.

              </p>

            </div>

            {/* Vision */}
            <div className="bg-gray-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">

              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">

                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/20 mb-6">

                  <Globe
                    size={28}
                    className="text-orange-400"
                  />

                </div>

                <h2 className="text-3xl font-bold mb-5">

                  Our Vision

                </h2>

                <p className="text-gray-300 leading-relaxed text-lg">

                  To build a technology learning ecosystem that helps more
                  people develop relevant digital skills and confidently
                  participate in the global digital economy.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================== */}
      {/* 7. FINAL CTA */}
      {/* ========================================== */}

      <section className="py-24 bg-white">

        <div className="mx-auto max-w-5xl px-6">

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">

            {/* Background Decoration */}

            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">

              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-lg">

                <Rocket
                  className="text-white"
                  size={32}
                />

              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">

                Start Your Technology Journey

              </h2>

              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">

                Explore AI Tech Academy, develop valuable technology skills,
                and take the next step toward your digital future.

              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">

                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-orange-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >

                  Explore Courses

                  <ArrowRight size={18} />

                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/20 transition-all duration-200"
                >

                  Contact TechTune International

                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}