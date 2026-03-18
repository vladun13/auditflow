import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { SocialProof } from "@/components/SocialProof"
import { StatsBar } from "@/components/StatsBar"
import { Features } from "@/components/Features"
import { ComplianceBadges } from "@/components/ComplianceBadges"
import { HowItWorks } from "@/components/HowItWorks"
import { Testimonials } from "@/components/Testimonials"
import { CtaBanner } from "@/components/CtaBanner"
import { Footer } from "@/components/Footer"

export function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <StatsBar />
        <Features />
        <ComplianceBadges />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
