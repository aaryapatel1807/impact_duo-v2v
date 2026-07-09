"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating background blobs with parallax */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 bg-accent-gold/10 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-72 h-72 bg-accent-plum/10 rounded-full blur-3xl"
        animate={{
          x: [0, 25, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Hero headline */}
          <motion.h1
            className="text-6xl md:text-7xl lg:text-[72px] font-medium text-[var(--color-text)] mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-family-fraunces)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            SheRise
          </motion.h1>

          {/* Promise line */}
          <motion.p
            className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-family-body)', textWrap: 'balance' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your life experience — however non-linear or interrupted — is the foundation of your comeback. Let's turn it into a concrete, visualized path forward.
          </motion.p>

          {/* CTA button */}
          <motion.button
            onClick={() => router.push("/onboarding")}
            className="clay-button px-10 py-5 text-white font-body font-medium text-lg mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start your comeback
          </motion.button>

          {/* Preview of the stepping-stone path */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="clay-stone w-24 h-24 md:w-32 md:h-32 flex items-center justify-center relative"
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 1 + index * 0.15,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                style={{
                  transform: `translateY(${index % 2 === 0 ? 0 : 20}px)`,
                }}
              >
                <div className="text-3xl md:text-4xl">
                  {index === 0 ? "🌱" : index === 1 ? "🌿" : "🌸"}
                </div>
              </motion.div>
            ))}
            
            {/* Connecting lines between stones */}
            <svg
              className="absolute w-full max-w-md h-32 pointer-events-none"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              <motion.path
                d="M 80 60 Q 160 40, 240 60 Q 320 80, 400 60"
                stroke="var(--color-primary)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="10 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-20 text-text-muted text-sm font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
          >
            ↓ Your path awaits
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
