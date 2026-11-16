///app/(main)/pricing/page.tsx
import Link from "next/link";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { db } from "@/db";
import { subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Pricing - TheTathyaNews",
  description: "Choose the perfect plan for your satirical news needs",
};

export const revalidate = 3600; // Revalidate every hour

async function getPlans() {
  return await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.displayOrder);
}

const planIcons = {
  free: Sparkles,
  basic: Zap,
  premium: Crown,
};

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your Satire Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Get unlimited access to the world's finest satirical journalism. No ads, no paywalls, just pure satire.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.length > 0 ? (
          plans.map((plan) => {
            const Icon = planIcons[plan.slug as keyof typeof planIcons] || Sparkles;
            const isFeatured = plan.isFeatured;
            const features = (plan.features as string[]) || [];
            const price = parseFloat(plan.price);

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border p-8 ${
                  isFeatured
                    ? "border-primary shadow-lg scale-105 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      <Crown className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  
                  <div className="text-4xl font-bold mb-1">
                    ${price.toFixed(0)}
                    <span className="text-base font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                  
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={price === 0 ? "/signup" : `/subscribe/${plan.slug}`}
                  className={`block w-full text-center rounded-md px-6 py-3 font-medium transition-colors ${
                    isFeatured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {price === 0 ? "Get Started" : "Subscribe Now"}
                </Link>
              </div>
            );
          })
        ) : (
          // Default plans if database is empty
          <>
            <DefaultPlanCard
              name="Free"
              price={0}
              interval="forever"
              description="Perfect for casual readers"
              features={[
                "5 articles per month",
                "Basic access to all categories",
                "Email newsletter",
                "Community access",
              ]}
              icon={Sparkles}
            />
            
            <DefaultPlanCard
              name="Premium"
              price={9}
              interval="month"
              description="Best for regular readers"
              features={[
                "Unlimited articles",
                "Ad-free experience",
                "Early access to new content",
                "Exclusive newsletters",
                "Comment on articles",
                "Bookmark articles",
              ]}
              isFeatured
              icon={Crown}
              slug="pro-monthly"
            />
            
            <DefaultPlanCard
              name="Annual"
              price={90}
              interval="year"
              description="Save 17% with annual billing"
              features={[
                "Everything in Premium",
                "2 months free",
                "Priority support",
                "Exclusive events access",
                "Early feature access",
              ]}
              icon={Zap}
              slug="pro-annual"
            />
          </>
        )}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <FAQItem
            question="Can I cancel anytime?"
            answer="Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
          />
          
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, PayPal, and various other payment methods depending on your region."
          />
          
          <FAQItem
            question="Is there a student discount?"
            answer="Yes! Students get 50% off any paid plan. Contact our support team with your student ID for verification."
          />
          
          <FAQItem
            question="Can I switch plans later?"
            answer="Absolutely! You can upgrade or downgrade your plan at any time from your account settings."
          />
        </div>
      </div>
    </div>
  );
}

interface DefaultPlanCardProps {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  icon: any;
  slug?: string;
}

function DefaultPlanCard({
  name,
  price,
  interval,
  description,
  features,
  isFeatured = false,
  icon: Icon,
  slug = "pro-monthly",
}: DefaultPlanCardProps) {
  return (
    <div
      className={`relative rounded-lg border p-8 shadow-sm flex flex-col justify-between ${
        isFeatured
          ? "border-primary bg-card ring-2 ring-primary"
          : "border-border bg-card"
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            <Crown className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        
        <div className="text-4xl font-bold mb-1">
          ${price}
          <span className="text-base font-normal text-muted-foreground">
            /{interval}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={price === 0 ? "/signup" : `/subscribe/${slug}`}
        className={`block w-full text-center rounded-md px-6 py-3 font-medium transition-colors ${
          isFeatured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        {price === 0 ? "Get Started" : "Subscribe Now"}
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{question}</h3>
      <p className="text-muted-foreground text-sm">{answer}</p>
    </div>
  );
}