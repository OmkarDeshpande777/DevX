'use client';

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        
        {/* Call-to-Action Section */}
        <section className="py-16 bg-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              {isAuthenticated ? (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Welcome back, {user?.name}!
                  </h2>
                  <p className="text-xl text-green-100 mb-8">
                    Continue managing your crops and getting AI-powered insights.
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={handleGetStarted}
                      className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                    <Link
                      href="/crop-calendar"
                      className="border-2 border-white text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-white hover:text-green-600 transition-colors inline-block"
                    >
                      Farming Calendar
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-xl text-green-100 mb-8">
                    Join thousands of farmers already using CropAI to optimize their harvests.
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={handleGetStarted}
                      className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                      Sign Up Now
                    </button>
                    <Link
                      href="/auth"
                      className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* New Features Showcase */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Advanced Agricultural Tools
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Monitor your crops in real-time and plan your farming activities with our cutting-edge tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {/* Farming Calendar Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Farming Calendar</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Plan your farming activities with our intelligent farming calendar. Track growth stages, 
                    manage tasks, get weather insights, and receive market forecasts.
                  </p>
                  <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Task Management</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Weather Integration</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">Market Forecast</span>
                  </div>
                  <Link
                    href="/crop-calendar"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    View Calendar
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="px-8 pb-8">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700 font-medium">Active Crops</span>
                      <span className="text-green-900 font-bold">3 Growing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Features />
      </main>
      <Footer />
    </div>
  );
}
