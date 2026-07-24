"use client";
import React, { useState, useEffect } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Great_Vibes } from "next/font/google";
import { Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const DEFAULT_DATA = [
  { subject: "Academic", score: 68, fullMark: 100 },
  { subject: "Research", score: 60, fullMark: 100 },
  { subject: "Work", score: 64, fullMark: 100 },
  { subject: "Organization", score: 72, fullMark: 100 },
  { subject: "Impact", score: 66, fullMark: 100 },
];

const CustomTick = ({ payload, x, y, textAnchor, stroke, radius, currentData }: any) => {
  const score = currentData.find((d: any) => d.subject === payload.value)?.score;
  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick">
      <text radius={radius} stroke={stroke} x={x} y={y} className="recharts-text recharts-polar-angle-axis-tick-value" textAnchor={textAnchor}>
        <tspan x={x} dy="-0.2em" fill="#64748b" fontSize="12" fontWeight="500">{payload.value}</tspan>
        <tspan x={x} dy="1.4em" fill="#3b82f6" fontSize="13" fontWeight="bold">{score}</tspan>
      </text>
    </g>
  );
};

export default function Summarize() {
  const chartRef = React.useRef(null);
  const isChartInView = useInView(chartRef, { once: true, margin: "-100px" });
  const [chartData, setChartData] = useState(DEFAULT_DATA);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('score_academic, score_research, score_work, score_organization, score_impact')
          .single();
        
        if (data && !error) {
          setChartData([
            { subject: "Academic", score: data.score_academic || 68, fullMark: 100 },
            { subject: "Research", score: data.score_research || 60, fullMark: 100 },
            { subject: "Work", score: data.score_work || 64, fullMark: 100 },
            { subject: "Organization", score: data.score_organization || 72, fullMark: 100 },
            { subject: "Impact", score: data.score_impact || 66, fullMark: 100 },
          ]);
        }
      } catch (e) {
        console.error("Failed to fetch ML scores", e);
      }
    };
    fetchScores();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-8 md:py-16 bg-[var(--bg)] relative overflow-hidden" id="summarize">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-2 md:mb-6"
        >
          <div className="flex items-center justify-center">
            <span className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 p-12 -m-12 z-10 relative`}>S</span>
            <h2 className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-0 relative -ml-8 md:-ml-12">
              ummarize
            </h2>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-8 lg:gap-16">
          
          {/* Radar Chart (Transparent Background) */}
          <motion.div 
            ref={chartRef}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="w-full lg:w-1/2 h-[300px] sm:h-[350px] md:h-[500px] flex items-center justify-center px-2 md:px-0 md:-ml-8"
          >
            {isChartInView && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={<CustomTick currentData={chartData} />} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="#60a5fa" 
                    fillOpacity={0.3} 
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Text Summary (Staggered Animation) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <div className="flex flex-col">
              <motion.h3 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-black display-text text-[var(--text)] mb-2 leading-tight">
                Embracing Versatility
              </motion.h3>
              <motion.h4 variants={itemVariants} className="text-[#001489] font-bold text-lg md:text-xl mb-6 tracking-wide">
                Adaptive Learner & Collaborator
              </motion.h4>
              
              <div className="space-y-4">
                <motion.p variants={itemVariants} className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                  I am not an expert in just one thing, but I am eager to explore multiple fields and gain new perspectives. While it may seem impossible, I strive to remain consistent across all areas I dive into.
                </motion.p>
                <motion.p variants={itemVariants} className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                  It is not about achieving absolute perfection, but rather about how we can unlock new opportunities together. The key is being highly adaptive and prioritizing collaboration in everything I do.
                </motion.p>
              </div>

              <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-200/60">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  * The competency profile was developed through self-assessment using weighted indicators adapted from SFIA 9 and ACM Computing Curricula 2020. Each competency is evaluated on a 0–100 scale considering academic achievements, project complexity, research activities, organizational involvement, and measurable impact.
                </p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
