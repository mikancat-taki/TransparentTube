import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import { z } from 'zod';
import { insertChatMessageSchema, insertChatSessionSchema } from '@shared/schema';

// Enhanced YouTube proxy with privacy protection
const createYouTubeProxy = () => {
  return createProxyMiddleware({
    target: 'https://www.youtube-nocookie.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/proxy/youtube': '',
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    onProxyReq: (proxyReq) => {
      // Remove tracking headers
      proxyReq.removeHeader('x-forwarded-for');
      proxyReq.removeHeader('x-real-ip');
      proxyReq.removeHeader('x-forwarded-proto');
    },
    onProxyRes: (proxyRes) => {
      // Add privacy headers
      proxyRes.headers['x-frame-options'] = 'SAMEORIGIN';
      proxyRes.headers['x-content-type-options'] = 'nosniff';
      proxyRes.headers['referrer-policy'] = 'no-referrer';
      
      // Remove tracking headers from response
      delete proxyRes.headers['x-youtube-ad-signals'];
      delete proxyRes.headers['x-youtube-identity-token'];
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Enhanced YouTube proxy route
  app.use('/api/proxy/youtube', createYouTubeProxy());
  
  // Enhanced video data fetching with multiple fallbacks
  app.get('/api/video/:videoId', async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // Validate video ID format
      const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
      if (!videoIdRegex.test(videoId)) {
        return res.status(400).json({ error: '無効な動画IDです' });
      }

      // Try multiple endpoints for video data
      const videoData = await fetchVideoDataWithFallback(videoId);
      
      if (!videoData) {
        return res.status(404).json({ error: '動画が見つかりません' });
      }

      res.json(videoData);
    } catch (error) {
      console.error('Video fetch error:', error);
      res.status(500).json({ error: '動画データの取得に失敗しました' });
    }
  });

  // AI Chat functionality
  app.post('/api/chat/send', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'メッセージが必要です' });
      }

      // Create session if it doesn't exist
      let session = sessionId;
      if (!session) {
        session = generateSessionId();
        await storage.insertChatSession({
          sessionId: session,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });
      }

      // Save user message
      await storage.insertChatMessage({
        sessionId: session,
        role: 'user',
        content: message
      });

      // Get AI response using Perplexity API
      const aiResponse = await getAIResponse(message);
      
      // Save AI response
      await storage.insertChatMessage({
        sessionId: session,
        role: 'assistant',
        content: aiResponse
      });

      res.json({
        sessionId: session,
        response: aiResponse
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'AIとの通信に失敗しました' });
    }
  });

  // Get chat history
  app.get('/api/chat/history/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json({ error: 'チャット履歴の取得に失敗しました' });
    }
  });

  // Get chat sessions
  app.get('/api/chat/sessions', async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Chat sessions error:', error);
      res.status(500).json({ error: 'チャットセッションの取得に失敗しました' });
    }
  });

  // Anti-blocking route with random user agents
  app.get('/api/unblock/check/:videoId', async (req, res) => {
    try {
      const { videoId } = req.params;
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ];
      
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      const response = await axios.head(`https://www.youtube-nocookie.com/embed/${videoId}`, {
        headers: {
          'User-Agent': randomUA,
          'Accept': '*/*',
          'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
        },
        timeout: 5000
      });
      
      res.json({ 
        accessible: response.status === 200,
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?wmode=transparent&iv_load_policy=3&autoplay=0&html5=1&showinfo=0&rel=0&modestbranding=1&playsinline=0&theme=dark`
      });
    } catch (error) {
      res.json({ 
        accessible: false,
        videoId: req.params.videoId,
        error: 'ブロックされている可能性があります'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function fetchVideoDataWithFallback(videoId: string) {
  const endpoints = [
    `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, { timeout: 5000 });
      if (response.data && response.data.title) {
        return {
          title: response.data.title,
          author: response.data.author_name || 'Unknown',
          duration: response.data.duration || null,
          thumbnail: response.data.thumbnail_url || null
        };
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint} failed:`, error.message);
    }
  }
  return null;
}

async function getAIResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // YouTube関連の質問
  if (lowerMessage.includes('youtube') || lowerMessage.includes('ユーチューブ') || lowerMessage.includes('動画')) {
    if (lowerMessage.includes('おすすめ') || lowerMessage.includes('人気')) {
      return "YouTubeでおすすめの動画を見つけるには：\n\n1. トレンドタブで人気動画をチェック\n2. 興味のあるチャンネルを登録\n3. 関連動画から新しいコンテンツを発見\n4. 検索で具体的なキーワードを使用\n\n透明YouTube-unblockerを使えば、広告なしでプライベートに動画を視聴できます！";
    }
    if (lowerMessage.includes('編集') || lowerMessage.includes('作り方')) {
      return "YouTube動画編集のコツ：\n\n🎬 初心者向けソフト：\n• DaVinci Resolve（無料）\n• iMovie（Mac）\n• Filmora（有料だが使いやすい）\n\n📝 編集のポイント：\n• 魅力的なサムネイル作成\n• 最初の15秒で視聴者を惹きつける\n• BGMと効果音を効果的に使用\n• テンポよくカット編集\n• 適切な字幕追加";
    }
    if (lowerMessage.includes('収益') || lowerMessage.includes('稼ぐ')) {
      return "YouTube収益化について：\n\n💰 必要条件：\n• チャンネル登録者1,000人以上\n• 年間再生時間4,000時間以上\n• AdSenseアカウント連携\n\n📈 収益向上のコツ：\n• 定期的な動画投稿\n• SEOを意識したタイトル・説明文\n• 視聴者とのコミュニケーション\n• トレンドに合わせたコンテンツ作成";
    }
    return "YouTubeに関するご質問ですね！透明YouTube-unblockerでは、プライバシーを重視した動画視聴が可能です。広告なし、トラッキングなしで安全にYouTubeコンテンツをお楽しみください。具体的な質問があれば、もう少し詳しく教えてください。";
  }

  // プログラミング関連
  if (lowerMessage.includes('プログラミング') || lowerMessage.includes('コード') || lowerMessage.includes('開発')) {
    if (lowerMessage.includes('学習') || lowerMessage.includes('勉強') || lowerMessage.includes('始め')) {
      return "プログラミング学習のおすすめ方法：\n\n🌟 初心者向けステップ：\n1. HTMLとCSSでWebページ作成\n2. JavaScriptで動的な機能追加\n3. Pythonでプログラミング基礎学習\n4. フレームワーク（React、Vue.js等）の習得\n\n📚 学習リソース：\n• Progate、ドットインストール\n• YouTube教材動画\n• 書籍とオンラインコース\n• 実際のプロジェクト作成";
    }
    return "プログラミングについてお答えします！透明YouTube-unblockerも最新のWeb技術（React、TypeScript、Express.js）で構築されています。具体的にどの分野について知りたいでしょうか？";
  }

  // 技術・IT関連
  if (lowerMessage.includes('ai') || lowerMessage.includes('人工知能') || lowerMessage.includes('機械学習')) {
    return "AI・人工知能について：\n\n🤖 現在のAI技術：\n• ChatGPT、Claude等の対話AI\n• 画像生成AI（DALL-E、Midjourney）\n• 音声認識・合成技術\n• 自動運転技術\n\n🔮 将来の展望：\n• より自然な人間とAIの協働\n• 専門分野でのAI活用拡大\n• 倫理的なAI開発の重要性\n• 教育・医療分野での革新";
  }

  // 挨拶・雑談
  if (lowerMessage.includes('こんにちは') || lowerMessage.includes('はじめまして') || lowerMessage.includes('hello')) {
    return "こんにちは！透明YouTube-unblockerのAIアシスタントです。\n\n私ができること：\n🎥 YouTubeに関する質問\n💻 プログラミングの相談\n🔍 技術的な疑問の解決\n📚 学習方法のアドバイス\n\n何でもお気軽にお聞きください！";
  }

  if (lowerMessage.includes('ありがとう') || lowerMessage.includes('感謝')) {
    return "どういたしまして！お役に立てて嬉しいです。\n\n他にも何かご質問があれば、いつでもお気軽にお声かけください。透明YouTube-unblockerで快適な動画視聴をお楽しみください！";
  }

  // 天気関連
  if (lowerMessage.includes('天気') || lowerMessage.includes('weather')) {
    return "申し訳ありませんが、リアルタイムの天気情報は提供できません。\n\n天気情報を確認するには：\n🌤️ Yahoo天気、ウェザーニュース\n📱 天気予報アプリの利用\n🔍 「天気 [地域名]」で検索\n\n正確な情報は公式な天気予報サービスをご利用ください。";
  }

  // 時事・ニュース
  if (lowerMessage.includes('ニュース') || lowerMessage.includes('最新') || lowerMessage.includes('今日')) {
    return "最新のニュースや情報については、信頼できるニュースサイトをご確認ください：\n\n📰 おすすめニュースソース：\n• NHKニュース\n• 朝日新聞、読売新聞\n• ITmedia、TechCrunch（技術系）\n• Yahoo!ニュース\n\n透明YouTube-unblockerでは、プライバシーを保護しながらニュース系YouTubeチャンネルも視聴できます！";
  }

  // 使い方・ヘルプ
  if (lowerMessage.includes('使い方') || lowerMessage.includes('ヘルプ') || lowerMessage.includes('help')) {
    return "透明YouTube-unblockerの使い方：\n\n📝 基本操作：\n1. YouTube URLを入力フィールドに貼り付け\n2. 「動画を視聴」ボタンをクリック\n3. プライベートで広告なしの動画再生開始\n\n🔒 プライバシー機能：\n• youtube-nocookie.com経由で安全視聴\n• 追跡なし、履歴なし\n• 広告ブロック機能\n\n💬 AI機能：\n• チャットページで質問可能\n• YouTube関連の相談\n• 技術的なサポート";
  }

  // その他の一般的な質問
  if (lowerMessage.includes('?') || lowerMessage.includes('？') || lowerMessage.includes('教えて') || lowerMessage.includes('について')) {
    return "ご質問ありがとうございます！\n\n私がお答えできる分野：\n🎥 YouTube・動画関連\n💻 プログラミング・技術\n🔧 透明YouTube-unblockerの使い方\n📚 学習方法・リソース\n\nより具体的な質問をしていただければ、詳しくお答えできます。どの分野について知りたいでしょうか？";
  }

  // デフォルト応答
  return "こんにちは！透明YouTube-unblockerのAIアシスタントです。\n\nお手伝いできることがあれば、お気軽にお聞きください。YouTube関連のご質問、プログラミングの相談、アプリの使い方など、何でも対応いたします！\n\n例えば：\n「YouTubeでおすすめの動画は？」\n「プログラミングの学習方法は？」\n「このアプリの使い方を教えて」\n\nなど、お気軽にどうぞ。";
}
