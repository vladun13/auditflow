import { ArrowRight } from "lucide-react"

const steps = [
    {
        number: "01",
        title: "Input URL",
        description: "Simply enter the URL of the website or page you want to audit.",
    },
    {
        number: "02",
        title: "Run Audit",
        description: "Our engine scans your site against WCAG 2.1 guidelines in seconds.",
    },
    {
        number: "03",
        title: "Get Fixes",
        description: "Receive a detailed report with AI-generated code snippets to fix issues.",
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        How it works
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Three simple steps to a more accessible web.
                    </p>
                </div>

                <div className="relative grid gap-8 md:grid-cols-3">
                    {/* Connector Line (Desktop) */}
                    <div className="absolute top-12 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-border md:block" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative bg-background pt-4 md:pt-0">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border bg-background text-xl font-bold shadow-sm md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                                {step.number}
                            </div>
                            <div className="rounded-lg border bg-card p-6 text-center shadow-sm md:mt-12">
                                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <ArrowRight className="absolute top-1/2 -right-4 hidden h-6 w-6 -translate-y-1/2 text-muted-foreground md:hidden" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
