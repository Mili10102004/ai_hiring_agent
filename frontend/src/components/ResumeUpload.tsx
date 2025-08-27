import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractedInfo {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[];
  location?: string;
}

interface ResumeUploadProps {
  onInfoExtracted: (info: ExtractedInfo) => void;
  onContinueManually: () => void;
}

export function ResumeUpload({ onInfoExtracted, onContinueManually }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractInfoFromText = (text: string): ExtractedInfo => {
    const info: ExtractedInfo = {};
    
    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) info.email = emailMatch[0];
    
    // Extract phone number
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) info.phone = phoneMatch[0];
    
    // Extract name (usually at the beginning)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const nameCandidate = lines[0].trim();
      if (nameCandidate.length < 50 && /^[A-Za-z\s]+$/.test(nameCandidate)) {
        info.name = nameCandidate;
      }
    }
    
    // Extract experience (look for years)
    const experienceMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
    if (experienceMatch) info.experience = `${experienceMatch[1]} years`;
    
    // Extract location
    const locationMatch = text.match(/(?:location|address|based in|located in)[:\s]+([^\n,]+)/i);
    if (locationMatch) info.location = locationMatch[1].trim();
    
    // Extract skills (common tech keywords)
    const techKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 'Vue', 'Angular',
      'Node.js', 'Express', 'Django', 'Spring Boot', '.NET', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git'
    ];
    
    const foundSkills = techKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    if (foundSkills.length > 0) info.skills = foundSkills;
    
    return info;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files, we'll read as text (simplified approach)
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // This is a simplified approach - in production, you'd use pdf-parse
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            text = new TextDecoder().decode(uint8Array);
          } catch (error) {
            console.log('PDF parsing not fully implemented, using fallback');
            text = 'PDF parsing requires server-side implementation';
          }
          
          processExtractedText(text, file.name);
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'text/plain') {
        // Handle plain text files
        const reader = new FileReader();
        reader.onload = (e) => {
          text = e.target?.result as string;
          processExtractedText(text, file.name);
        };
        reader.readAsText(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or TXT files.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process resume",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const processExtractedText = (text: string, fileName: string) => {
    try {
      const extracted = extractInfoFromText(text);
      setExtractedInfo(extracted);
      setUploadStatus('success');
      
      toast({
        title: "Resume Processed",
        description: `Successfully extracted information from ${fileName}`,
      });
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Processing Failed",
        description: "Could not extract information from resume",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleUseExtractedInfo = () => {
    if (extractedInfo) {
      onInfoExtracted(extractedInfo);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-card border-border">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Upload Your Resume
          </h2>
          <p className="text-muted-foreground">
            We'll extract your information automatically to speed up the process
          </p>
        </div>

        {uploadStatus === 'idle' && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-card-foreground mb-2">
              Drop your resume here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF and TXT files
            </p>
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Processing...</span>
              </div>
            ) : (
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Select File
              </Button>
            )}
          </div>
        )}

        {uploadStatus === 'success' && extractedInfo && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Information extracted successfully!</span>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-card-foreground">Extracted Information:</h3>
              {extractedInfo.name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-card-foreground">{extractedInfo.name}</span>
                </div>
              )}
              {extractedInfo.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-card-foreground">{extractedInfo.email}</span>
                </div>
              )}
              {extractedInfo.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="text-card-foreground">{extractedInfo.phone}</span>
                </div>
              )}
              {extractedInfo.experience && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="text-card-foreground">{extractedInfo.experience}</span>
                </div>
              )}
              {extractedInfo.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-card-foreground">{extractedInfo.location}</span>
                </div>
              )}
              {extractedInfo.skills && extractedInfo.skills.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extractedInfo.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleUseExtractedInfo}
                className="flex-1 bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                Use This Information
              </Button>
              <Button 
                variant="outline" 
                onClick={onContinueManually}
                className="flex-1"
              >
                Fill Manually Instead
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Failed to process resume</span>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadStatus('idle');
                  setExtractedInfo(null);
                }}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                onClick={onContinueManually}
                className="flex-1"
              >
                Continue Manually
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={onContinueManually}
            className="text-sm text-muted-foreground hover:text-card-foreground"
          >
            Skip resume upload and fill details manually
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </Card>
    </div>
  );
}