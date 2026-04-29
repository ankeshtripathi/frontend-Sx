import React from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Layout, Layers, Zap } from "lucide-react";
import { Briefcase, Code, Megaphone, Palette, Users, HeartPulse, Car, ClipboardList } from "lucide-react";
// import { fadeIn } from "@/variants";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const categories = [
  {
    icon: <Briefcase className="w-8 h-8 text-blue-600" />,
    title: "Accounting / Finance",
    jobs: "1 open position",
  },
  {
    icon: <Megaphone className="w-8 h-8 text-blue-600" />,
    title: "Marketing",
    jobs: "5 open positions",
  },
  {
    icon: <Palette className="w-8 h-8 text-blue-600" />,
    title: "Design",
    jobs: "7 open positions",
  },
  {
    icon: <Code className="w-8 h-8 text-blue-600" />,
    title: "Development",
    jobs: "6 open positions",
  },
  {
    icon: <ClipboardList className="w-8 h-8 text-blue-600" />,
    title: "Project Management",
    jobs: "1 open position",
  },
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    title: "Customer Service",
    jobs: "4 open positions",
  },
  {
    icon: <HeartPulse className="w-8 h-8 text-blue-600" />,
    title: "Health and Care",
    jobs: "3 open positions",
  },
  {
    icon: <Car className="w-8 h-8 text-blue-600" />,
    title: "Automotive Jobs",
    jobs: "1 open position",
  },
];

const steps = [
  {
    img: "/image1.png",
    title: "Free Resume Assessments",
    desc: "Achieve virtually any design and layout from within the one template.",
  },
  {
    img: "/image2.png",
    title: "Job Fit Scoring",
    desc: "Achieve virtually any design and layout from within the one template.",
  },
  {
    img: "/image3.png",
    title: "Help Every Step of the Way",
    desc: "Achieve virtually any design and layout from within the one template.",
  },
];

const Home = () => {  
return ( <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">

  {/* ================= HERO SECTION ================= */}
    <section className="relative pt-28 pb-20 bg-gradient-to-b from-blue-50 via-white to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12">

        {/* ================= LEFT SIDE ================= */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">

          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mb-4">
            Smart Hiring Platform
          </span>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
            Hire Top Talent Faster with <br />
            <span className="text-blue-600">AI Resume Matching</span>
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
            Upload thousands of resumes and instantly find the best candidates
            that match your job requirements using intelligent filtering.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-2xl shadow-lg border flex flex-col sm:flex-row gap-3">

            {/* Job Input */}
            <div className="flex items-center gap-2 w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Job title or skills (React, Node...)"
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center gap-2 w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <MapPin size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            {/* Button */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 w-full sm:w-auto rounded-lg">
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center lg:justify-start gap-8 mt-10 text-sm text-gray-600">
            <div>
              <p className="text-lg font-bold text-gray-900">10K+</p>
              <p>Resumes</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">5K+</p>
              <p>Companies</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">20K+</p>
              <p>Candidates</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="w-full lg:w-1/2 flex justify-center relative">

          <div className="relative w-full max-w-[420px] aspect-square">

            {/* Glow */}
            <div className="absolute inset-0 bg-blue-200 blur-3xl opacity-30 rounded-full"></div>

            {/* Outer Circle */}
            <div className="absolute inset-0 rounded-full border border-gray-200"></div>

            {/* Dashed Circle */}
            <div className="absolute inset-3 rounded-full border border-dashed border-blue-300"></div>

            {/* Gradient Ring */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl">

              {/* Inner White */}
              <div className="w-[75%] h-[75%] bg-white rounded-full flex items-center justify-center shadow-inner">

                <img
                  src="/hero.png"
                  alt="Hero"
                  className="w-[85%] h-[85%] object-cover rounded-full"
                />

              </div>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute top-[10%] left-[-5%] sm:left-0 bg-white p-3 rounded-xl shadow-md text-xs sm:text-sm w-[160px]">
              <p className="font-semibold">Bulk Upload</p>
              <p className="text-gray-500 text-xs">1000+ resumes</p>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute bottom-[10%] right-[-5%] sm:right-0 bg-white p-3 rounded-xl shadow-md text-xs sm:text-sm w-[160px]">
              <p className="font-semibold">Smart Matching</p>
              <p className="text-gray-500 text-xs">AI powered</p>
            </div>

            {/* Icons */}
            <div className="absolute top-[5%] right-[15%] w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow">
              👥
            </div>

            <div className="absolute bottom-[5%] left-[15%] w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow">
              ✔
            </div>

          </div>
        </div>

      </div>
    </section>

  <section
  id="about"
  className="relative py-24 bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden"
>
  {/* Background Glow */}
  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FF2E63]/10 to-transparent pointer-events-none" />

  <div className="max-w-7xl mx-auto px-6 lg:px-8">

    {/* ================= HEADING ================= */}
    <motion.div
      className="text-center mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Your Partner in{" "}
        <span className="text-[#FF2E63]">Digital Growth</span>
      </h2>

      <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
        We build intelligent, scalable systems that help businesses grow faster
        and smarter.
      </p>
    </motion.div>

    {/* ================= MAIN LAYOUT ================= */}
    <div className="flex flex-col lg:flex-row items-center gap-16">

      {/* ================= LEFT ================= */}
      <motion.div
        className="w-full lg:w-1/2 space-y-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        {[
          {
            icon: <Layout className="w-6 h-6 text-[#FF2E63]" />,
            title: "Smart Development",
            desc: "AI-powered applications designed for performance and scalability.",
          },
          {
            icon: <Layers className="w-6 h-6 text-[#FF2E63]" />,
            title: "Custom Solutions",
            desc: "Tailor-made systems built for your business.",
          },
          {
            icon: <Zap className="w-6 h-6 text-[#FF2E63]" />,
            title: "Fast Execution",
            desc: "Delivering projects quickly without compromising quality.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-md transition"
          >
            <div className="p-3 bg-[#FF2E63]/10 rounded-lg">
              {item.icon}
            </div>

            <div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= RIGHT ================= */}
      <motion.div
        className="w-full lg:w-1/2 flex justify-center relative"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-full max-w-[420px] aspect-square">

          {/* Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-[#FF2E63]/20 border-dashed"
          />

          {/* Gradient Ring */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#FF2E63] to-indigo-500 flex items-center justify-center">

            {/* Inner Image */}
            <div className="w-[75%] h-[75%] bg-white rounded-full flex items-center justify-center shadow-xl">
              <img
                src="/about.png"
                alt="About"
                className="w-[85%] h-[85%] object-cover rounded-full"
              />
            </div>

          </div>

          {/* Floating Cards */}
          <div className="absolute top-5 left-[-10px] bg-white p-3 rounded-xl shadow-md text-xs w-[150px]">
            <p className="font-semibold">10K+ Users</p>
            <p className="text-gray-500">Trusted platform</p>
          </div>

          <div className="absolute bottom-5 right-[-10px] bg-white p-3 rounded-xl shadow-md text-xs w-[150px]">
            <p className="font-semibold">Fast Delivery</p>
            <p className="text-gray-500">Quick & Reliable</p>
          </div>

        </div>
      </motion.div>

    </div>
  </div>
</section>

  <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Popular Job Categories
        </h2>

        <p className="text-gray-500 mt-2">
          2020 jobs live — 293 added today.
        </p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">

          {categories.map((cat, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-blue-100 mb-4">
                {cat.icon}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-800">
                {cat.title}
              </h3>

              {/* Jobs */}
              <p className="text-sm text-gray-500 mt-1">
                ({cat.jobs})
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>

  <section className="py-24 bg-[#f8f9fb] text-center">
  <div className="max-w-6xl mx-auto px-4">

    {/* Heading */}
    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
      Few Simple Steps for Successful Business
    </h2>

    <p className="text-gray-500 mt-3 mb-16 text-sm">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit
    </p>

    {/* GRID (NOT FLEX) */}
    <div className="grid md:grid-cols-3 gap-12">

      {steps.map((item, index) => (
        <div key={index} className="flex flex-col items-center">

          <img src={item.img} className="w-[160px] mb-6" />

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {item.title}
          </h3>

          <p className="text-sm text-gray-500 max-w-xs">
            {item.desc}
          </p>

        </div>
      ))}

    </div>

  </div>
</section>

 <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">

        {/* ================= LEFT IMAGE ================= */}
        <div className="w-full lg:w-1/2 flex justify-center relative">

          {/* Background Shape */}
          <div className="absolute w-[320px] h-[320px] bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl rotate-6 z-0"></div>

          {/* Image */}
          <img
            src="/ankesh.png"
            alt="Ankesh"
            className="relative z-10 w-[280px] md:w-[340px] rounded-2xl shadow-xl object-cover"
          />

          {/* Floating Icons */}
          <div className="absolute top-5 left-5 bg-white p-3 rounded-full shadow">
            💼
          </div>

          <div className="absolute bottom-5 right-5 bg-white p-3 rounded-full shadow">
            🌐
          </div>

        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-orange-500">Find</span> Your <br />
            Perfect Job
          </h2>

          <p className="text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
            To start searching for jobs, attend job fairs, explore online
            job portals, or connect directly with recruiters to grow your network.
          </p>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Get Started
          </Button>

        </div>

      </div>
    </section>

  

</div>
);
} 

export default Home;