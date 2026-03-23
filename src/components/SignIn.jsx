import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
    // TODO: wire up authentication request
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">

      {/* LEFT SIDE (Branding) */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center px-12 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute w-[400px] h-[400px] bg-purple-600 rounded-full blur-[150px] opacity-30"></div>

        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold mb-6 z-10"
        >
          Solvo AI
        </motion.h1>

        <p className="text-gray-300 text-lg max-w-md text-center z-10">
          Unlock intelligent automation and next-gen AI tools 
          to power your productivity.
        </p>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="flex w-full md:w-1/2 justify-center items-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl w-full max-w-md shadow-2xl border border-white/20"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 outline-none border border-white/30 focus:border-purple-400 transition"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 outline-none border border-white/30 focus:border-purple-400 transition"
            />

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-sm text-gray-300">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="accent-purple-500" />
                <span>Remember me</span>
              </label>

              <Link to="/forgot" className="hover:text-purple-400 transition">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 font-semibold hover:bg-purple-700 transition shadow-lg"
            >
              Sign In
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-4">
            <button className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition">
              Continue with Google
            </button>

            <button className="w-full py-3 rounded-xl bg-blue-600 font-medium hover:bg-blue-700 transition">
              Continue with LinkedIn
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
