import { Zap, Clock, TrendingUp, CheckCircle, ArrowRight, LogIn, Bot, Globe, Sparkles, Activity, Brain, Timer, Users, Shield, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Circular Scraping',
      description: 'Automatically monitors 70+ university websites for admission circulars 24/7',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CheckCircle,
      title: 'Automated Eligibility Verification',
      description: 'Instantly verifies your eligibility with Education Board APIs',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Smart Auto-Apply',
      description: 'AI agent auto-fills and submits applications based on your preferences',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Globe,
      title: 'Seamless bKash/Nagad Integration',
      description: 'One-click payment integration with mobile banking APIs',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      title: '24/7 AI Agent Monitoring',
      description: 'Never miss deadlines with automated tracking and notifications',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: TrendingUp,
      title: 'Smart University Recommendations',
      description: 'Get personalized university matches based on your profile and preferences',
      gradient: 'from-rose-500 to-red-500',
    },
  ];

  const impactMetrics = [
    { icon: Timer, number: '15-20', unit: 'Hours', label: 'Saved Per Student', color: 'text-blue-400' },
    { icon: Bot, number: '100%', unit: '', label: 'Automated Applications', color: 'text-cyan-400' },
    { icon: Shield, number: '70+', unit: '', label: 'Universities Monitored', color: 'text-green-400' },
    { icon: Users, number: '24/7', unit: '', label: 'AI Agent Support', color: 'text-purple-400' },
  ];

  const steps = [
    {
      number: 1,
      title: 'One-Time Registration',
      description: 'Complete your SSC, HSC details once. Our AI verifies eligibility automatically',
      icon: CheckCircle,
    },
    {
      number: 2,
      title: 'Select & Enable Auto-Apply',
      description: 'Choose universities and toggle auto-apply. Get smart recommendations based on your profile',
      icon: Sparkles,
    },
    {
      number: 3,
      title: 'Recharge & Auto-Pay',
      description: 'Add balance via bKash/Nagad. AI agent auto-pays application fees when enabled',
      icon: Zap,
    },
    {
      number: 4,
      title: 'AI Agent Takes Over',
      description: '24/7 monitoring, circular scraping, auto-application, deadline tracking—all automated',
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />

      {/* Hero Section - Centered */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -right-40 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-screen opacity-25 filter blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-40 w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-screen opacity-25 filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen opacity-15 filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500 rounded-full mix-blend-screen opacity-20 filter blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-pink-500 rounded-full mix-blend-screen opacity-15 filter blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Animated Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `particle ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Centered Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-8">
            {/* AI Badge - Enhanced */}
            <div 
              className={`inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full px-6 py-3 text-sm shadow-2xl shadow-blue-500/30 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0 animate-fade-in-scale' : 'opacity-0 translate-y-4'
              } hover:bg-blue-500/30 hover:border-blue-400/50 hover:scale-105 cursor-default`}
            >
              <div className="relative">
                <Activity className="animate-pulse text-cyan-400" size={20} />
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-lg opacity-60 animate-glow"></div>
              </div>
              <span className="text-cyan-300 font-semibold tracking-wide">AI Agent Active</span>
              <span className="text-slate-400 animate-pulse">•</span>
              <span className="text-blue-300 font-medium">24/7 Monitoring</span>
            </div>

            {/* Main Headline - Staggered Animation */}
            <div className="space-y-6">
              <h1 className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] tracking-tight ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}>
                <span 
                  className={`block mb-4 text-white ${
                    mounted ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ animationDelay: '0.2s' }}
                >
                  Stop Spending Hours
                </span>
                <span 
                  className={`block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-gradient ${
                    mounted ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ animationDelay: '0.4s' }}
                >
                  Filling Forms.
                </span>
              </h1>
              
              <h2 
                className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 leading-tight max-w-4xl mx-auto ${
                  mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: '0.6s' }}
              >
                Let AI Handle Your University Admission
              </h2>
            </div>
            
            {/* Description - Enhanced */}
            <p 
              className={`text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto ${
                mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.8s' }}
            >
              TestPulse automates your entire admission journey—from circular tracking to application submission.{' '}
              <span className="text-cyan-400 font-semibold relative group">
                One-time registration
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
              ,{' '}
              <span className="text-blue-400 font-semibold relative group">
                smart recommendations
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
              , and{' '}
              <span className="text-cyan-400 font-semibold relative group">
                24/7 AI agent
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
              {' '}handle everything while you focus on your future.
            </p>
            
            {/* CTA Buttons - Enhanced */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 pt-8 justify-center items-center ${
                mounted ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: '1s' }}
            >
              <button
                onClick={() => navigate('/register')}
                className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 shadow-2xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/70 hover:scale-110 text-lg overflow-hidden"
              >
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300 relative z-10" size={22} />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500"></div>
                <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="group relative border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 font-semibold py-4 px-8 rounded-xl transition-all duration-500 backdrop-blur-sm hover:scale-110 overflow-hidden"
              >
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <LogIn size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  Sign In
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-4">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-900 font-semibold text-sm">The Problem We're Solving</span>
            </div> */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              <span className="text-red-600">726,000 Students.</span> <span className="text-slate-900">15-20 Hours Each.</span>
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto font-medium">
              That's <span className="text-red-600 font-bold">10.9 million hours</span> wasted every year filling the same forms across 70+ universities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex p-4 bg-red-100 rounded-full mb-3">
                  <Clock className="text-red-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">15-20 Hours</h3>
                <p className="text-slate-700 font-medium">Per student, per season</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Filling the same information repeatedly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Visiting 70+ university websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Manual eligibility calculations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex p-4 bg-orange-100 rounded-full mb-3">
                  <AlertCircle className="text-orange-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-orange-600 mb-2">Fragmented Process</h3>
                <p className="text-slate-700 font-medium">No centralized system</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Circulars released at different times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Each university has different forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>No way to track everything</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-3">
                  <X className="text-yellow-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-yellow-600 mb-2">Missed Deadlines</h3>
                <p className="text-slate-700 font-medium">50% need coaching help</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>No deadline tracking system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Students miss application windows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Pay third parties just to apply</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Visual Impact */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-extrabold mb-2">726K</div>
                <div className="text-blue-100">HSC Graduates Annually</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">10.9M</div>
                <div className="text-blue-100">Hours Wasted Per Year</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">70+</div>
                <div className="text-blue-100">Fragmented Websites</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
              <Brain className="text-blue-600" size={20} />
              <span className="text-blue-900 font-semibold text-sm">AI-Powered Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">TestPulse</span>?
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              The first Bangladesh-focused AI admission agent. Combining real-time circular scraping, RPA-based form automation, and seamless payment gateway integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                  
                  <div className={`relative mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} />
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-300 -z-10`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Impact <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">We Create</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Every year, hundreds of thousands of HSC graduates struggle with fragmented admission processes. TestPulse transforms this experience through intelligent automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      <Icon className={`${metric.color}`} size={32} />
                    </div>
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${metric.color} drop-shadow-lg`}>
                    {metric.number}{metric.unit && <span className="text-3xl">{metric.unit}</span>}
                  </div>
                  <p className="text-slate-300 font-medium">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              How <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">It Works</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four simple steps to automate your entire admission journey
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-30"></div>

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative group">
                  <div className="relative bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>

                    <div className="flex justify-center mb-6 mt-4">
                      <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                        <Icon className="text-blue-600 group-hover:text-white transition-colors" size={32} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-center mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-center text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
            <Bot className="animate-pulse" size={20} />
            <span className="font-semibold">AI Agent Ready</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Let <span className="text-cyan-200">AI Handle</span> Your Admission?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of HSC graduates who chose TestPulse—the first AI-powered admission automation agent for Bangladesh
          </p>
          
          <button
            onClick={() => navigate('/register')}
            className="group relative bg-white text-blue-600 hover:bg-blue-50 font-bold py-5 px-12 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              Get Started Today
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </span>
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="text-blue-500" size={24} />
            <span className="text-xl font-bold text-white">TestPulse</span>
          </div>
          <p className="text-sm">
            &copy; 2024 TestPulse. Your Smart Admission Ally. Empowering Bangladesh's future, one automated application at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
