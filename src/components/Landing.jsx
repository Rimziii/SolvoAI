import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">

      {/* ================= NAVBAR ================= */}
      <nav className="flex justify-between items-center px-8 py-6 sticky top-0 bg-black/30 backdrop-blur-md z-50">
        <h1 className="text-2xl font-bold tracking-wide">Solvo AI</h1>

        <div className="space-x-6 hidden md:block">
          <Link to="/signin" className="hover:text-purple-300 transition">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-purple-600 px-5 py-2 rounded-xl hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight"
        >
          Smart Solutions Powered by{" "}
          <span className="text-purple-400">AI</span>
        </motion.h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl">
          Solvo AI helps you analyze, optimize, and automate your work
          using next-generation artificial intelligence tools.
        </p>

        <div className="mt-10 space-x-6">
          <Link
            to="/signup"
            className="bg-purple-600 px-8 py-3 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            Try Free
          </Link>

          <Link
            to="/signin"
            className="border border-white px-8 py-3 rounded-2xl text-lg hover:bg-white hover:text-black transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="py-24 px-8 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Why Choose Solvo AI?</h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          We combine cutting-edge artificial intelligence with a simple
          user-friendly interface to deliver powerful automation tools
          that help businesses grow faster and smarter.
        </p>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 bg-black/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-8">
          {[
            {
              step: "01",
              title: "Connect Your Data",
              desc: "Securely integrate your workflows and tools."
            },
            {
              step: "02",
              title: "AI Processing",
              desc: "Our AI analyzes patterns and optimizes tasks."
            },
            {
              step: "03",
              title: "Get Smart Results",
              desc: "Receive automated insights & actions instantly."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 text-center"
            >
              <h3 className="text-purple-400 text-3xl font-bold mb-4">
                {item.step}
              </h3>
              <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 px-8 text-center">
        <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            "Solvo AI boosted our productivity by 40%!",
            "The automation features are game-changing.",
            "Incredible insights that save hours every week."
          ].map((review, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20"
            >
              <p className="text-gray-300">"{review}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-purple-700 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Experience the Future?
        </h2>
        <Link
          to="/signup"
          className="bg-white text-purple-700 px-8 py-3 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition"
        >
          Get Started Now
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 text-center text-gray-400 text-sm bg-black">
        © {new Date().getFullYear()} Solvo AI. All rights reserved.
      </footer>
    </div>
  );
}
