import { Header } from "@/components/header"
import { HeroDemo } from "@/components/hero-demo"
import { ValueProps } from "@/components/value-props"
import { IntegrationSteps } from "@/components/integration-steps"
import { Features } from "@/components/features"
import { CodeExample } from "@/components/code-example"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroDemo />
        <ValueProps />
        <IntegrationSteps />
        <Features />
        <CodeExample />
      </main>
      <Footer />
    </div>
  )
}
