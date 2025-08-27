import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TechStackChip } from "./TechStackChip";
import { WelcomeScreen } from "./WelcomeScreen";
import { ResumeUpload } from "./ResumeUpload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";
import { ApplicationsSidebar, Application } from "./ApplicationsSidebar";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  experience: string;
  position: string;
  location: string;
  techStack: string[];
}

type ConversationStage = 
  | 'welcome'
  | 'resumeUpload'
  | 'name'
  | 'email' 
  | 'phone'
  | 'experience'
  | 'position'
  | 'location'
  | 'techStack'
  | 'techStackSelection'
  | 'technicalQuestions'
  | 'completed';

const COMMON_TECH_STACK = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 'Vue', 'Angular',
  'Node.js', 'Express', 'Django', 'Spring Boot', '.NET', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Redis', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git'
];

const TECHNICAL_QUESTIONS = {
  'JavaScript': [
    'Explain the difference between let, const, and var in JavaScript.',
    'What is event delegation and why is it useful?',
    'How do closures work in JavaScript? Provide an example.'
  ],
  'TypeScript': [
    'What are the benefits of using TypeScript over JavaScript?',
    'Explain the difference between interface and type in TypeScript.',
    'How do you handle generic types in TypeScript?'
  ],
  'Python': [
    'What is the difference between a list and a tuple in Python?',
    'Explain how Python\'s GIL (Global Interpreter Lock) works.',
    'What are decorators in Python and how do you use them?'
  ],
  'React': [
    'Explain the difference between functional and class components.',
    'What are React hooks and why were they introduced?',
    'How do you optimize React component performance?'
  ],
  'Node.js': [
    'Explain the event loop in Node.js.',
    'What is the difference between require() and import in Node.js?',
    'How do you handle asynchronous operations in Node.js?'
  ]
};

export function HiringAssistant() {
  const [stage, setStage] = useState<ConversationStage>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [candidateInfo, setCandidateInfo] = useState<Partial<CandidateInfo>>({});
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentTech, setCurrentTech] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser = false) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = (callback: () => void, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleStart = () => {
    setStage('resumeUpload');
  };

  const handleResumeInfoExtracted = (extractedInfo: any) => {
    // Pre-fill the candidate info with extracted data
    setCandidateInfo(prev => ({
      ...prev,
      ...extractedInfo,
      techStack: extractedInfo.skills || []
    }));
    
    if (extractedInfo.skills && extractedInfo.skills.length > 0) {
      setSelectedTechStack(extractedInfo.skills);
    }
    
    // Move to technical questions if we have tech stack, otherwise continue with manual flow
    if (extractedInfo.skills && extractedInfo.skills.length > 0) {
      setStage('technicalQuestions');
      const firstTechWithQuestions = extractedInfo.skills.find((tech: string) => 
        TECHNICAL_QUESTIONS[tech as keyof typeof TECHNICAL_QUESTIONS]
      );
      
      if (firstTechWithQuestions) {
        setCurrentTech(firstTechWithQuestions);
        setCurrentQuestionIndex(0);
        
        const questions = TECHNICAL_QUESTIONS[firstTechWithQuestions as keyof typeof TECHNICAL_QUESTIONS];
        simulateTyping(() => {
          addMessage(`Hello ${extractedInfo.name || 'there'}! I've reviewed your resume and can see you're skilled in ${extractedInfo.skills.join(', ')}. Let's dive into some technical questions.\n\nStarting with ${firstTechWithQuestions}:\n\n${questions[0]}`);
        }, 1000);
      } else {
        setStage('completed');
        simulateTyping(() => {
          addMessage(`Thank you for uploading your resume, ${extractedInfo.name || 'there'}! I've extracted your information successfully. Our team will review your profile and get back to you soon.`);
        });
      }
    } else {
      // Ask for missing information
      setStage('name');
      simulateTyping(() => {
        addMessage("Hello! I've processed your resume. Let me ask a few questions to complete your profile.\n\nWhat's your full name?");
      });
    }
  };

  const handleContinueManually = () => {
    setStage('name');
    simulateTyping(() => {
      addMessage("Hello! I'm the TalentScout AI assistant. I'll help screen your application today. Let's start with some basic information.\n\nWhat's your full name?");
    });
  };

  const handleUserMessage = (message: string) => {
    addMessage(message, true);
    
    switch (stage) {
      case 'name':
        setCandidateInfo(prev => ({ ...prev, name: message }));
        setStage('email');
        simulateTyping(() => {
          addMessage(`Nice to meet you, ${message}! What's your email address?`);
        });
        break;
        
      case 'email':
        setCandidateInfo(prev => ({ ...prev, email: message }));
        setStage('phone');
        simulateTyping(() => {
          addMessage("Great! What's your phone number?");
        });
        break;
        
      case 'phone':
        setCandidateInfo(prev => ({ ...prev, phone: message }));
        setStage('experience');
        simulateTyping(() => {
          addMessage("Perfect! How many years of professional experience do you have?");
        });
        break;
        
      case 'experience':
        setCandidateInfo(prev => ({ ...prev, experience: message }));
        setStage('position');
        simulateTyping(() => {
          addMessage("Excellent! What position(s) are you interested in applying for?");
        });
        break;
        
      case 'position':
        setCandidateInfo(prev => ({ ...prev, position: message }));
        setStage('location');
        simulateTyping(() => {
          addMessage("Great choice! What's your current location?");
        });
        break;
        
      case 'location':
        setCandidateInfo(prev => ({ ...prev, location: message }));
        setStage('techStackSelection');
        simulateTyping(() => {
          addMessage("Perfect! Now let's talk about your technical skills. Please select the technologies you're proficient in from the options below:");
        });
        break;
        
      case 'technicalQuestions':
        if (selectedTechStack.length > 0) {
          const nextQuestionIndex = currentQuestionIndex + 1;
          if (nextQuestionIndex < 3 && currentTech) {
            setCurrentQuestionIndex(nextQuestionIndex);
            const questions = TECHNICAL_QUESTIONS[currentTech as keyof typeof TECHNICAL_QUESTIONS];
            if (questions && questions[nextQuestionIndex]) {
              simulateTyping(() => {
                addMessage(questions[nextQuestionIndex]);
              });
            }
          } else {
            // Move to next tech or complete
            const currentTechIndex = selectedTechStack.findIndex(tech => tech === currentTech);
            const nextTechIndex = currentTechIndex + 1;
            
            if (nextTechIndex < selectedTechStack.length) {
              const nextTech = selectedTechStack[nextTechIndex];
              setCurrentTech(nextTech);
              setCurrentQuestionIndex(0);
              
              const questions = TECHNICAL_QUESTIONS[nextTech as keyof typeof TECHNICAL_QUESTIONS];
              if (questions) {
                simulateTyping(() => {
                  addMessage(`Great! Now let's move on to ${nextTech}.\n\n${questions[0]}`);
                });
              }
            } else {
              setStage('completed');
              simulateTyping(() => {
                addMessage("Excellent! That completes our technical screening. Thank you for your time and detailed responses. Our team will review your information and get back to you within 2-3 business days.\n\nHave a wonderful day!");
              }, 1500);
            }
          }
        }
        break;
    }
  };

  const handleTechStackSelection = (tech: string) => {
    if (selectedTechStack.includes(tech)) {
      setSelectedTechStack(prev => prev.filter(t => t !== tech));
    } else {
      setSelectedTechStack(prev => [...prev, tech]);
    }
  };

  const handleContinueWithTechStack = () => {
    if (selectedTechStack.length === 0) return;
    
    setCandidateInfo(prev => ({ ...prev, techStack: selectedTechStack }));
    
    // Find first tech with questions
    const firstTechWithQuestions = selectedTechStack.find(tech => 
      TECHNICAL_QUESTIONS[tech as keyof typeof TECHNICAL_QUESTIONS]
    );
    
    if (firstTechWithQuestions) {
      setCurrentTech(firstTechWithQuestions);
      setCurrentQuestionIndex(0);
      setStage('technicalQuestions');
      
      const questions = TECHNICAL_QUESTIONS[firstTechWithQuestions as keyof typeof TECHNICAL_QUESTIONS];
      simulateTyping(() => {
        addMessage(`Perfect! I can see you're skilled in ${selectedTechStack.join(', ')}. Let's dive into some technical questions.\n\nStarting with ${firstTechWithQuestions}:\n\n${questions[0]}`);
      }, 1000);
    } else {
      setStage('completed');
      simulateTyping(() => {
        addMessage("Thank you for sharing your tech stack! While I don't have specific questions for those technologies, our team will review your profile. We'll be in touch soon!");
      });
    }
  };

  const downloadSummary = () => {
    const summary = `
CANDIDATE SCREENING SUMMARY
==========================

Personal Information:
- Name: ${candidateInfo.name}
- Email: ${candidateInfo.email}
- Phone: ${candidateInfo.phone}
- Location: ${candidateInfo.location}
- Experience: ${candidateInfo.experience}
- Position: ${candidateInfo.position}

Technical Stack:
${selectedTechStack.map(tech => `- ${tech}`).join('\n')}

Screening Date: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateInfo.name?.replace(/\s+/g, '_')}_screening_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to handle final submission and save to backend
  const handleFinalSubmit = async (candidate: CandidateInfo, summary: string) => {
    const app: Application = {
      id: Date.now().toString(),
      name: candidate.name || "",
      email: candidate.email || "",
      submittedAt: new Date().toISOString(),
      summary,
    };
    setApplications((prev) => [app, ...prev]);
    // Send to backend logs
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
    } catch (err) {
      // Handle error (optional)
    }
  };

  if (stage === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (stage === 'resumeUpload') {
    return (
      <ResumeUpload 
        onInfoExtracted={handleResumeInfoExtracted}
        onContinueManually={handleContinueManually}
      />
    );
  }

  return (
    <div className="flex h-full">
      <ApplicationsSidebar
        applications={applications}
        onSelect={(id) => {/* Optionally show details */}}
      />
      <main className="flex-1">
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <div className="bg-card border-b border-border p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">TalentScout Assistant</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Screening</p>
                </div>
              </div>
              {stage === 'completed' && (
                <Button onClick={downloadSummary} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Summary
                </Button>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isTyping && (
                <ChatMessage
                  message=""
                  isUser={false}
                  isTyping={true}
                />
              )}
              
              {/* Tech Stack Selection */}
              {stage === 'techStackSelection' && !isTyping && (
                <div className="p-4">
                  <Card className="p-6 border-border bg-card">
                    <h3 className="font-semibold mb-4 text-card-foreground">Select Your Tech Stack:</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {COMMON_TECH_STACK.map((tech) => (
                        <TechStackChip
                          key={tech}
                          tech={tech}
                          selected={selectedTechStack.includes(tech)}
                          onClick={() => handleTechStackSelection(tech)}
                        />
                      ))}
                    </div>
                    {selectedTechStack.length > 0 && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Selected:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedTechStack.map((tech) => (
                              <TechStackChip
                                key={`selected-${tech}`}
                                tech={tech}
                                selected={true}
                                onRemove={() => handleTechStackSelection(tech)}
                              />
                            ))}
                          </div>
                        </div>
                        <Button 
                          onClick={handleContinueWithTechStack}
                          className="bg-primary hover:bg-primary-glow text-primary-foreground"
                        >
                          Continue with Selected Technologies
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              )}
              
              {/* Completion Status */}
              {stage === 'completed' && (
                <div className="p-4">
                  <Card className="p-6 border-border bg-card text-center">
                    <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2 text-card-foreground">Screening Complete!</h3>
                    <p className="text-muted-foreground">
                      Thank you for completing the TalentScout screening process.
                    </p>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            {!['welcome', 'techStackSelection', 'completed'].includes(stage) && (
              <ChatInput
                onSendMessage={handleUserMessage}
                disabled={isTyping}
                placeholder={
                  stage === 'technicalQuestions' 
                    ? "Share your technical knowledge..." 
                    : "Type your response..."
                }
                messages={messages}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}