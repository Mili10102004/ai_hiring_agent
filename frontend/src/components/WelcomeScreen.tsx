import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, CheckCircle, Brain } from "lucide-react";
import heroImage from "@/assets/hiring-hero.jpg";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const features = [
    {
      icon: MessageSquare,
      title: "Interactive Screening",
      description: "Conversational approach to candidate assessment"
    },
    {
      icon: Brain,
      title: "Smart Questions", 
      description: "Technical questions tailored to your tech stack"
    },
    {
      icon: CheckCircle,
      title: "Efficient Process",
      description: "Streamlined initial screening in minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="AI-powered recruitment interface" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-subtle/80"></div>
      </div>
      
      <div className="max-w-2xl w-full space-y-8 text-center relative z-10">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full shadow-elegant">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">TalentScout</h1>
            <p className="text-xl text-muted-foreground">AI-Powered Hiring Assistant</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to our intelligent recruitment screening system. I'm here to help assess 
            your technical qualifications through a personalized conversation.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 border-border bg-card/90 backdrop-blur-sm hover:shadow-elegant transition-smooth">
              <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button 
            onClick={onStart}
            className="bg-gradient-primary hover:shadow-elegant transition-bounce text-primary-foreground px-8 py-3 text-lg"
          >
            Start Screening Process
          </Button>
          <p className="text-sm text-muted-foreground">
            This process typically takes 5-10 minutes to complete
          </p>
        </div>
      </div>
    </div>
  );
}