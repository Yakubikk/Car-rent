import { Link } from "react-router-dom";
import { Car, MapPin, Smartphone, Zap, Shield, BarChart2 } from "lucide-react";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Hello</span> Car Sharing
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-10">
            Freedom on four wheels. Rent a car in minutes and explore the city at your own pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-md transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full opacity-10 -ml-64 -mb-64"></div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Why Choose Hello?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="w-10 h-10 text-blue-600" />,
                title: "Instant Booking",
                desc: "Reserve a car in less than a minute with our simple app.",
              },
              {
                icon: <MapPin className="w-10 h-10 text-blue-600" />,
                title: "Citywide Coverage",
                desc: "Hundreds of cars available across all major locations.",
              },
              {
                icon: <Car className="w-10 h-10 text-blue-600" />,
                title: "Variety of Vehicles",
                desc: "From compact cars to SUVs - choose what fits your needs.",
              },
              {
                icon: <Smartphone className="w-10 h-10 text-blue-600" />,
                title: "Mobile App",
                desc: "Full control from your smartphone - unlock, drive, return.",
              },
              {
                icon: <Shield className="w-10 h-10 text-blue-600" />,
                title: "Fully Insured",
                desc: "All rentals include comprehensive insurance coverage.",
              },
              {
                icon: <BarChart2 className="w-10 h-10 text-blue-600" />,
                title: "Transparent Pricing",
                desc: "No hidden fees. Pay only for what you use.",
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-50 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Drive?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Download our app now and get your first 30 minutes free!</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.6 13.4l-4.2-7.2c-.3-.5-.7-.7-1.2-.7-.5 0-.9.2-1.2.7l-4.2 7.2c-.3.5-.3 1.1 0 1.6.3.5.7.8 1.2.8h8.4c.5 0 .9-.3 1.2-.8.3-.5.3-1.1 0-1.6zM7 12l5-8.5 5 8.5H7z" />
              </svg>
              App Store
            </button>
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.7 1.4-3.1 3.1-3.1h4V3.1H7C3.1 3.1 0 6.2 0 10v2c0 3.9 3.1 7 7 7h4v-5.9H7c-1.7 0-3.1-1.4-3.1-3.1zM17 3.1h-4v5.9h4c1.7 0 3.1 1.4 3.1 3.1s-1.4 3.1-3.1 3.1h-4v5.9h4c3.9 0 7-3.1 7-7v-2c0-3.9-3.1-7-7-7z" />
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Hello Car Sharing</h2>
              <p className="text-gray-400 mt-2">Drive the future today</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="text-gray-400 hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-gray-400 hover:text-white">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link to="/press" className="text-gray-400 hover:text-white">
                      Press
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/help" className="text-gray-400 hover:text-white">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link to="/safety" className="text-gray-400 hover:text-white">
                      Safety
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-400 hover:text-white">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/terms" className="text-gray-400 hover:text-white">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-400 hover:text-white">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-gray-400 hover:text-white">
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Hello Car Sharing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
