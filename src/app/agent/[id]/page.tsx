import React from "react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/property/PropertyCard";
import { Award, Mail, Phone, CalendarRange, Star, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicAgentProfilePage({ params }: PageProps) {
  const { id: agentUserId } = await params;

  // Retrieve Agent details
  const agentUser = await prisma.user.findUnique({
    where: { id: agentUserId },
    include: {
      agentProfile: {
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!agentUser || !["AGENT", "OWNER"].includes(agentUser.role) || !agentUser.agentProfile) {
    return notFound();
  }

  // Retrieve active properties owned by this agent
  const properties = await prisma.property.findMany({
    where: {
      ownerId: agentUserId,
      status: "ACTIVE",
    },
    include: {
      city: true,
      locality: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimals to serializable numbers for React props
  const serializableProperties = properties.map(p => ({
    ...p,
    price: parseFloat(p.price.toString()),
    monthlyRent: p.monthlyRent ? parseFloat(p.monthlyRent.toString()) : null,
    securityDeposit: p.securityDeposit ? parseFloat(p.securityDeposit.toString()) : null,
    maintenanceCharges: p.maintenanceCharges ? parseFloat(p.maintenanceCharges.toString()) : null,
  }));

  const profile = agentUser.agentProfile;
  const ratingAvg = parseFloat(profile.ratingAverage.toString());

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          
          {/* Left Column: Agent Card & Details */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center space-y-3">
              {agentUser.avatar ? (
                <img 
                  src={agentUser.avatar} 
                  alt={agentUser.name} 
                  className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-accent" 
                />
              ) : (
                <span className="w-24 h-24 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-3xl border-2 border-line mx-auto uppercase">
                  {agentUser.name.charAt(0)}
                </span>
              )}

              <div>
                <h1 className="font-serif text-xl font-bold text-primary">{agentUser.name}</h1>
                <p className="text-xs font-mono font-bold text-accent uppercase mt-0.5 tracking-wider">Verified Property Agent</p>
              </div>

              {/* Rating aggregate */}
              <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-700">
                <Star className="w-4.5 h-4.5 text-accent fill-accent" />
                <span>{ratingAvg.toFixed(1)} / 5.0 ({profile.reviews.length} Reviews)</span>
              </div>
            </div>

            <div className="border-t border-line/60 pt-5 space-y-3 text-xs text-slate-600 font-semibold">
              {profile.companyName && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent shrink-0" />
                  <span>Company: {profile.companyName}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-accent shrink-0" />
                <span>Experience: {profile.experienceYears} Years</span>
              </div>

              {agentUser.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span>{agentUser.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>{agentUser.email}</span>
              </div>
            </div>

            {profile.bio && (
              <div className="border-t border-line/60 pt-5 text-xs text-slate-500 leading-relaxed text-left">
                <p className="font-serif font-semibold text-primary text-sm mb-1.5">About agent</p>
                <p className="italic">"{profile.bio}"</p>
              </div>
            )}
          </div>

          {/* Right Column: Listings and Reviews */}
          <div className="space-y-10 text-left">
            
            {/* Active Listings section */}
            <div>
              <h2 className="font-serif text-xl font-semibold text-primary mb-4">Active Listings ({serializableProperties.length})</h2>
              {serializableProperties.length === 0 ? (
                <div className="border border-line rounded-2xl p-10 text-center text-slate-400 bg-white">
                  No active properties listed by this agent.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {serializableProperties.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Testimonials/Reviews section */}
            <div className="border-t border-line/60 pt-8">
              <h2 className="font-serif text-xl font-semibold text-primary mb-4">Client Feedback ({profile.reviews.length})</h2>
              
              <div className="space-y-4">
                {profile.reviews.length === 0 ? (
                  <div className="border border-line rounded-2xl p-8 text-center text-slate-400 bg-white">
                    No reviews received yet.
                  </div>
                ) : (
                  profile.reviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-line rounded-xl p-4.5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {rev.reviewer.avatar ? (
                            <img src={rev.reviewer.avatar} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                              {rev.reviewer.name.charAt(0)}
                            </span>
                          )}
                          <span className="font-semibold text-primary text-xs">{rev.reviewer.name}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs leading-normal">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
