import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";

export const metadata = {
  title: "Agents - Re One Stop Page",
  description: "Browse verified real estate agents and owners",
};

export default async function AgentsPage() {
  const agents = await prisma.user.findMany({
    where: {
      role: { in: ["AGENT", "OWNER"] },
      isApproved: true,
      isSuspended: false,
      agentProfile: { isFeatured: true },
    },
    include: { agentProfile: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold text-primary mb-8 text-center">
          All Verified Agents & Owners
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => {
            const cleanName = agent.name.replace(/\s*\([^)]*\)/g, "").trim();
            return (
              <Link
                key={agent.id}
                href={`/agent/${agent.id}`}
                className="bg-secondary border border-line rounded-2xl p-5 text-center hover:shadow-xs transition duration-300 space-y-4 flex flex-col items-center"
              >
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={cleanName}
                    className="w-16 h-16 rounded-full object-cover border border-line"
                  />
                ) : (
                  <span className="w-16 h-16 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-xl uppercase border border-line">
                    {cleanName.charAt(0)}
                  </span>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-primary">{cleanName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                    {agent.agentProfile?.companyName || "Independent Agent"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white border border-line px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                  <span>{agent.agentProfile?.ratingAverage?.toFixed(1) ?? 0} Rating</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
