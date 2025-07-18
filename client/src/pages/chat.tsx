import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  Sparkles, 
  MessageSquare,
  Trash2,
  Plus,
  ChevronLeft
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: number;
  sessionId: string;
  title: string | null;
  createdAt: string;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get chat sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/chat/sessions'],
    queryFn: () => apiRequest('/api/chat/sessions') as Promise<ChatSession[]>
  });

  // Get current chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chat/history', currentSessionId],
    queryFn: () => apiRequest(`/api/chat/history/${currentSessionId}`) as Promise<ChatMessage[]>,
    enabled: !!currentSessionId
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId?: string }) => {
      return apiRequest('/api/chat/send', {
        method: 'POST',
        body: { message, sessionId }
      }) as Promise<{ sessionId: string; response: string }>;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history', data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
      setMessage("");
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: error.message || "メッセージの送信に失敗しました",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    sendMessageMutation.mutate({ 
      message: message.trim(), 
      sessionId: currentSessionId || undefined 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessage("");
    inputRef.current?.focus();
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentSessionId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  戻る
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-accent" />
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  AI チャット
                </h1>
              </div>
            </div>
            <Button
              onClick={startNewChat}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              新しいチャット
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          
          {/* Chat Sessions Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                チャット履歴
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-3">
                  {sessions.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      まだチャットがありません
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.sessionId}
                        onClick={() => selectSession(session.sessionId)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          currentSessionId === session.sessionId
                            ? 'bg-accent text-accent-foreground border-accent'
                            : 'hover:bg-muted border-transparent'
                        }`}
                      >
                        <div className="font-medium text-sm truncate">
                          {session.title || '新しいチャット'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(session.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-accent" />
                AIアシスタント
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {!currentSessionId && messages.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">AIアシスタントへようこそ</h3>
                      <p className="text-muted-foreground mb-4">
                        何でも質問してください。YouTubeやその他のトピックについてお答えします。
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {[
                          "YouTubeでおすすめの動画編集ソフトは？",
                          "プログラミングを学ぶ最良の方法は？",
                          "今日の天気について教えて",
                          "人工知能の将来について"
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setMessage(suggestion)}
                            className="p-3 text-sm text-left bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === 'user'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-muted">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                            <span className="text-sm">考え中...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="メッセージを入力..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Enter キーで送信 • AI が質問にお答えします
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}