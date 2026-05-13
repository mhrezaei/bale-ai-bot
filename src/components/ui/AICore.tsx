import { motion } from 'motion/react';

export function AICore({ className = '' }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <div className="w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(188,0,255,0.2)_0%,transparent_70%)] relative flex items-center justify-center">
        <div className="w-[180px] h-[180px] border-2 border-[#00f2ff] rounded-[38%_62%_63%_37%/41%_44%_56%_59%] shadow-[0_0_40px_rgba(0,242,255,0.2)] bg-[rgba(0,242,255,0.05)] animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-0">
          <div className="absolute w-1 h-1 bg-[#bc00ff] rounded-full shadow-[0_0_10px_#bc00ff] top-[20%] left-[80%] animate-pulse" />
          <div className="absolute w-1 h-1 bg-[#bc00ff] rounded-full shadow-[0_0_10px_#bc00ff] top-[70%] left-[10%] animate-pulse delay-75" />
          <div className="absolute w-1 h-1 bg-[#bc00ff] rounded-full shadow-[0_0_10px_#bc00ff] top-[10%] left-[30%] animate-pulse delay-150" />
          <div className="absolute w-1 h-1 bg-[#bc00ff] rounded-full shadow-[0_0_10px_#bc00ff] top-[85%] left-[60%] animate-pulse delay-300" />
        </div>
      </div>
    </motion.div>
  );
}
