import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Shield, 
  Ban, 
  History, 
  Zap, 
  UserX, 
  Monitor, 
  Smartphone,
  Link as LinkIcon,
  X,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Brain,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [urlValue, setUrlValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const YOUTUBE_NOCOOKIE_BASE = 'https://www.youtube-nocookie.com/embed/';
  const EMBED_PARAMS = '?wmode=transparent&iv_load_policy=3&autoplay=0&html5=1&showinfo=0&rel=0&modestbranding=1&playsinline=0&theme=dark';

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Validate URL and update state
  useEffect(() => {
    if (urlValue.trim()) {
      const extractedId = extractVideoId(urlValue.trim());
      setIsValidUrl(!!extractedId);
    } else {
      setIsValidUrl(false);
    }
  }, [urlValue]);

  const handleWatch = async () => {
    const url = urlValue.trim();
    
    if (!url) {
      setError('YouTube URLを入力してください。');
      return;
    }
    
    const extractedId = extractVideoId(url);
    if (!extractedId) {
      setError('有効なYouTube URLを入力してください。');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check video accessibility with enhanced proxy
      setIsCheckingAccess(true);
      
      // Try to get video metadata
      try {
        const videoMeta = await fetch(`/api/video/${extractedId}`).then(res => res.json());
        setVideoData(videoMeta);
      } catch (metaError) {
        // Metadata fetch failed, but continue with basic playback
        console.log('Metadata fetch failed:', metaError);
      }
      
      setVideoId(extractedId);
      setIsLoading(false);
      setIsCheckingAccess(false);
      
      // Scroll to video section
      setTimeout(() => {
        document.getElementById('videoSection')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
      
    } catch (error) {
      console.error('Video access check failed:', error);
      // Even if check fails, try to play the video
      setVideoId(extractedId);
      setIsLoading(false);
      setIsCheckingAccess(false);
      
      setTimeout(() => {
        document.getElementById('videoSection')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const closeVideo = () => {
    setVideoId(null);
  };

  const loadNewVideo = () => {
    setUrlValue("");
    setVideoId(null);
    setError(null);
    setIsValidUrl(false);
    
    // Focus on input
    setTimeout(() => {
      document.getElementById('urlInput')?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWatch();
    }
  };

  useEffect(() => {
    // Auto-focus on URL input when component mounts
    document.getElementById('urlInput')?.focus();
  }, []);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                透明YouTube-unblocker
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                高速・プライベート・広告なしでYouTube動画を視聴
              </p>
            </div>
            <div className="hidden md:block">
              <Link href="/chat">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Brain className="h-4 w-4 mr-2" />
                  AI チャット
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* URL Input Section */}
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">YouTube URLを入力</h2>
              <p className="text-muted-foreground text-sm">様々なYouTube URL形式に対応しています</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Input
                  id="urlInput"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`pr-10 ${isValidUrl ? 'border-success' : ''}`}
                />
                {isValidUrl && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleWatch}
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isCheckingAccess ? 'アクセス確認中...' : '読み込み中...'}
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    動画を視聴
                  </>
                )}
              </Button>
            </div>
            
            {/* Error Message */}
            {error && (
              <Alert className="mt-4 border-destructive bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <span className="font-medium">エラー:</span> {error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Privacy Indicator */}
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-success mr-1" />
                <span>プライバシー保護</span>
              </div>
              <div className="flex items-center">
                <Ban className="h-4 w-4 text-success mr-1" />
                <span>広告ブロック</span>
              </div>
              <div className="flex items-center">
                <History className="h-4 w-4 text-success mr-1" />
                <span>履歴なし</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Video Player Section */}
        {videoId && (
          <Card id="videoSection" className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex-1">
                <CardTitle className="text-lg">動画プレーヤー</CardTitle>
                {videoData && (
                  <div className="mt-2">
                    <h3 className="font-semibold text-foreground">{videoData.title}</h3>
                    {videoData.author && (
                      <p className="text-sm text-muted-foreground mt-1">
                        投稿者: {videoData.author}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeVideo}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <div className="aspect-video bg-black">
                  <iframe
                    src={`${YOUTUBE_NOCOOKIE_BASE}${videoId}${EMBED_PARAMS}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-muted">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-success" />
                    <span>youtube-nocookie.com経由で安全に視聴中</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link href="/chat">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent/80"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        AI に質問
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadNewVideo}
                      className="text-accent hover:text-accent/80"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      新しい動画
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Mobile AI Chat Button */}
        {!videoId && (
          <div className="md:hidden mb-6">
            <Link href="/chat">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Brain className="h-4 w-4 mr-2" />
                AI チャットで質問する
              </Button>
            </Link>
          </div>
        )}
        
        {/* Instructions Section - only show when no video is playing */}
        {!videoId && (
          <div className="space-y-6">
            
            {/* About Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Info className="text-accent mr-2 h-5 w-5" />
                  このアプリについて
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  透明YouTube-unblockerは、プライバシーを重視した高速なYouTube視聴アプリです。
                  ブロックされた動画の視聴、広告の除去、トラッキングなしでの動画再生が可能です。
                  すべてクライアントサイドで処理され、視聴履歴は保存されません。
                </p>
              </CardContent>
            </Card>
            
            {/* Features Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Star className="text-accent mr-2 h-5 w-5" />
                  特徴
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="text-warning mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-medium">高速読み込み</h4>
                      <p className="text-muted-foreground text-sm">プロキシ強化で素早く安全な動画再生</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <UserX className="text-purple-400 mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-medium">完全プライベート</h4>
                      <p className="text-muted-foreground text-sm">データ収集なし、履歴保存なし</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Ban className="text-red-400 mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-medium">広告ブロック</h4>
                      <p className="text-muted-foreground text-sm">煩わしい広告なしで視聴</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Brain className="text-accent mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-medium">AI アシスタント</h4>
                      <p className="text-muted-foreground text-sm">YouTube関連やその他の質問に回答</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="text-success mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-medium">規制回避</h4>
                      <p className="text-muted-foreground text-sm">強化されたプロキシで制限を突破</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Smartphone className="text-success mt-1 h-5 w-5" />
                    <div>
                      <h4 className="font-medium">レスポンシブ</h4>
                      <p className="text-muted-foreground text-sm">デスクトップ・モバイル対応</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Supported Formats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <LinkIcon className="text-accent mr-2 h-5 w-5" />
                  対応URL形式
                </h3>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    <div className="text-muted-foreground mb-1">通常のYouTube URL:</div>
                    <div className="text-foreground">https://www.youtube.com/watch?v=VIDEO_ID</div>
                  </div>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    <div className="text-muted-foreground mb-1">短縮URL:</div>
                    <div className="text-foreground">https://youtu.be/VIDEO_ID</div>
                  </div>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    <div className="text-muted-foreground mb-1">モバイルURL:</div>
                    <div className="text-foreground">https://m.youtube.com/watch?v=VIDEO_ID</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </div>
        )}
        
      </main>
      
      {/* Footer */}
      <footer className="bg-primary border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">
              プライバシーを重視したYouTube視聴体験
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>© 2024 透明YouTube-unblocker</span>
              <span>•</span>
              <span>オープンソース</span>
              <span>•</span>
              <span>プライバシー第一</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
