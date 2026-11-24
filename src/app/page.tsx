'use client';

import { useState, useEffect } from 'react';
import { auth, remoteConfig, db } from '@/lib/firebase';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { detectAndRedactPII, runCloudReasoning, runOfflineLocalTask, RedactedEntity, RedactionResult } from '@/lib/cloak-engine';
import { saveAuditLog, AuditLog, subscribeToAuditLogs } from '@/lib/firestore-audit';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldCheck, Cloud, Zap, History, LogOut, Globe, Cpu, AlertTriangle, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SAMPLES = [
  {
    title: "Clinical Handoff",
    text: "Patient: John Doe (SSN: 444-00-1234). Admitted to St. Jude Hospital. Email: j.doe@gmail.com. Symptoms: Severe abdominal pain since 8 AM."
  },
  {
    title: "Legal NDA",
    text: "Founders Alice Vance and Bob Smith agree to an acquisition price of $50,000,000 by TechCorp Inc. Wire info: Chase Bank Acct 99283741."
  },
  {
    title: "Security Incident",
    text: "Engineer Sarah reported sk-live-51Mz2fW2s exposed in log. Internal IP 10.0.1.45 accessed from johnd@corp.com at midnight."
  }
];

export default function WorkspacePage() {
  const [user, setUser] = useState<User | null>(null);
  const [rawText, setRawText] = useState("");
  const [isStrict, setStrict] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [redaction, setRedaction] = useState<RedactionResult | null>(null);
  const [cloudResult, setCloudResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [nanoStatus, setNanoStatus] = useState<string>("probing...");
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    
    if (auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    }
    
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (remoteConfig) {
      fetchAndActivate(remoteConfig).catch(() => {});
    }

    const checkNano = async () => {
      const lm = (window as any).ai?.languageModel;
      if (!lm) {
        setNanoStatus("Not Available");
        return;
      }
      try {
        const capabilities = await lm.capabilities();
        setNanoStatus(capabilities.available === "readily" ? "Ready" : "Downloadable");
      } catch {
        setNanoStatus("Unavailable");
      }
    };
    checkNano();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (user && auth && db) {
      return subscribeToAuditLogs(setAuditLogs);
    }
  }, [user]);

  const handleRedact = async () => {
    if (!rawText) return;
    setIsLoading(true);
    try {
      const fallback = remoteConfig ? getValue(remoteConfig, 'cloud_fallback_model').asString() : "gemini-3.5-flash-lite";
      const result = await detectAndRedactPII(rawText, { strictOnDevice: isStrict, fallbackModel: fallback });
      setRedaction(result);
      toast({ title: "Local Scan Complete", description: `${result.entities.length} entities cloaked.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Redaction Error", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudTask = async (task: string) => {
    if (!redaction) return;
    setIsLoading(true);
    try {
      const model = remoteConfig ? getValue(remoteConfig, 'cloud_reasoning_model').asString() : "gemini-3.8-flash";
      const result = await runCloudReasoning(redaction.sanitizedText, task, redaction.entities, model);
      setCloudResult(result);
      
      await saveAuditLog({
        taskTitle: task,
        redactSource: redaction.inferenceSource,
        reasonSource: result.inferenceSource,
        entityCount: redaction.entities.length,
        bytesKeptLocal: redaction.bytesKeptLocal,
        latencyMs: result.durationMs,
        sanitizedPreview: redaction.sanitizedText.substring(0, 140)
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Cloud AI Error", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineTask = async () => {
    setIsLoading(true);
    try {
      const fallback = remoteConfig ? getValue(remoteConfig, 'cloud_fallback_model').asString() : "gemini-3.5-flash-lite";
      const result = await runOfflineLocalTask(rawText, "Summarize this securely", fallback);
      toast({ title: "Offline Summary Complete", description: "All logic ran locally." });
      setCloudResult({ 
        rehydratedResponse: result.response, 
        sanitizedResponse: "Ran entirely offline - no sanitized version sent to cloud.",
        inferenceSource: result.inferenceSource, 
        modelUsed: "local-nano", 
        durationMs: result.durationMs 
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Local AI Error", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-slate-950">
        <Card className="max-w-md border-amber-500/50 bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle /> Firebase Config Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-200/70 leading-relaxed">
              CloakRelay requires Firebase environment variables to initialize. Please copy <code className="bg-amber-900/40 px-1">.env.example</code> to <code className="bg-amber-900/40 px-1">.env.local</code> and fill in your project credentials.
            </p>
            <div className="text-xs font-mono bg-black/40 p-3 rounded overflow-x-auto text-amber-500 space-y-1">
              NEXT_PUBLIC_FIREBASE_API_KEY=your_key<br/>
              NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
            </div>
            <p className="text-[10px] text-amber-500/60 italic">
              Note: Using NEXT_PUBLIC_ prefix for Next.js environment compatibility.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-slate-200 bg-slate-950">
      {/* Telemetry Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <ShieldCheck className="text-accent h-6 w-6" />
              <span className="text-white">Cloak<span className="text-accent">Relay</span></span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 border-l border-slate-800 ml-4">
              <Badge variant="outline" className={`gap-1 ${nanoStatus === 'Ready' ? 'border-emerald-500 text-emerald-500' : 'text-slate-500'}`}>
                <Cpu className="h-3 w-3" /> {nanoStatus === 'Ready' ? 'Gemini Nano Ready' : nanoStatus}
              </Badge>
              <Badge variant="outline" className={`gap-1 ${isOnline ? 'border-blue-500 text-blue-500' : 'border-amber-500 text-amber-500'}`}>
                <Globe className="h-3 w-3" /> {isOnline ? 'Online' : 'Offline Mode'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => auth && signInAnonymously(auth)}>Guest</Button>
                <Button size="sm" onClick={() => auth && signInWithPopup(auth, new GoogleAuthProvider())} className="bg-accent hover:bg-accent/90 text-white">Sign In</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center relative">
                  <img 
                    src={user.photoURL || "https://picsum.photos/seed/avatar/32/32"} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs text-slate-400 hidden lg:inline">{user.email || 'Guest Session'}</span>
                <Button variant="ghost" size="icon" onClick={() => auth && signOut(auth)}><LogOut className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
        
        {/* Column 1: Confidential Source */}
        <section className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                1. Confidential Source
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Inputs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map(s => (
                  <Button key={s.title} variant="secondary" size="sm" className="text-[10px] h-7" onClick={() => setRawText(s.text)}>
                    {s.title}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Textarea 
                  placeholder="Paste sensitive data here..." 
                  className="min-h-[250px] bg-slate-950 border-slate-800 focus:border-accent resize-none font-mono text-sm"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-slate-500">
                  {rawText.length} chars
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">Strict On-Device Shield</div>
                  <div className="text-[10px] text-slate-500">Redaction MUST happen on-device</div>
                </div>
                <Switch checked={isStrict} onCheckedChange={setStrict} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleRedact} disabled={isLoading || !rawText} className="bg-accent hover:bg-accent/90 text-white">
                  <Zap className="h-4 w-4 mr-2" /> Scan & Cloak
                </Button>
                <Button variant="outline" onClick={handleOfflineTask} disabled={isLoading || !rawText}>
                  Offline Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Column 2: Local Privacy Vault */}
        <section className="space-y-6">
          <Card className={`border-slate-800 bg-slate-900/40 transition-all ${redaction ? 'ring-1 ring-emerald-500/50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                2. Local Privacy Vault
                {redaction && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{redaction.inferenceSource}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!redaction ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
                  <ShieldCheck className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">No active scan</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Latency</div>
                      <div className="text-xs font-mono">{redaction.durationMs}ms</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Protected</div>
                      <div className="text-xs font-mono text-emerald-500">{redaction.bytesKeptLocal} B</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 min-h-[150px] text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                    {redaction.sanitizedText.split(/(\[.*?\])/).map((part, i) => (
                      part.startsWith('[') ? <span key={i} className="bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/30 mx-0.5">{part}</span> : part
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-400">Entities Identified ({redaction.entities.length})</div>
                    <div className="max-h-[150px] overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                      {redaction.entities.map((e, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800 text-[10px]">
                          <span className="text-slate-500 font-mono">{e.placeholder}</span>
                          <span className="truncate max-w-[80px] text-slate-300">{e.original}</span>
                          <Badge variant="outline" className="text-[8px] h-4">{e.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Column 3: Cloud Reasoning */}
        <section className="space-y-6">
          <Card className={`border-slate-800 bg-slate-900/40 transition-all ${cloudResult ? 'ring-1 ring-indigo-500/50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                3. Cloud Reasoning
                {cloudResult && <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">{cloudResult.inferenceSource}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {["Executive Brief", "Risk Audit", "Action Items", "Reply Draft"].map(task => (
                  <Button key={task} variant="outline" size="sm" className="text-[10px]" disabled={!redaction || isLoading} onClick={() => handleCloudTask(task)}>
                    {task}
                  </Button>
                ))}
              </div>

              <div className="min-h-[300px] flex flex-col">
                <Tabs defaultValue="rehydrated" className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <TabsList className="bg-slate-950 border border-slate-800">
                      <TabsTrigger value="rehydrated" className="text-[10px]">Local Output</TabsTrigger>
                      <TabsTrigger value="sanitized" className="text-[10px]">Cloud View</TabsTrigger>
                    </TabsList>
                    {cloudResult && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigator.clipboard.writeText(cloudResult.rehydratedResponse)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4 rounded-lg bg-slate-950 border border-slate-800 text-sm font-sans min-h-[250px] max-h-[400px] overflow-y-auto">
                    {!cloudResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 italic text-xs text-center pt-20">
                        {isLoading ? <div className="animate-pulse">Reasoning in progress...</div> : "Waiting for sanitized input"}
                      </div>
                    ) : (
                      <>
                        <TabsContent value="rehydrated" className="m-0 whitespace-pre-wrap">
                          {cloudResult.rehydratedResponse}
                        </TabsContent>
                        <TabsContent value="sanitized" className="m-0 whitespace-pre-wrap font-mono text-xs text-slate-400">
                          {cloudResult.sanitizedResponse}
                        </TabsContent>
                      </>
                    )}
                  </div>
                </Tabs>
                {cloudResult && (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Model: {cloudResult.modelUsed}</span>
                    <span>{cloudResult.durationMs}ms</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Audit History Slider/Bottom */}
      <footer className="border-t border-slate-800 bg-slate-950 p-4">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <History className="h-3 w-3" /> Security Audit Logs (Local Context)
            </h3>
            <span className="text-[10px] text-slate-600">Syncing with Firestore ({auditLogs.length})</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium truncate">{log.taskTitle}</div>
                  <Badge variant="outline" className="text-[8px] px-1 h-3">{log.reasonSource}</Badge>
                </div>
                <div className="text-[10px] text-slate-500 truncate italic">
                  "{log.sanitizedPreview}..."
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 uppercase font-mono">
                  <span>{log.entityCount} Entities</span>
                  <span>{log.latencyMs}ms</span>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-slate-600 italic">
                Securely store audit trails without raw PII
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
