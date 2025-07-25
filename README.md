# 透明YouTube-ブロック解除アプリケーション
概要
これは、React（フロントエンド）、Express.js（バックエンド）、インメモリストレージを使用した最新のフルスタックアーキテクチャで構築された、強化されたYouTubeブロック解除アプリケーションです。このアプリケーションは、プライバシーを重視した埋め込み機能、強化されたプロキシルーティング機能、YouTubeやその他のトピックに関する質問に答える統合AIアシスタントを通じて、ユーザーがYouTubeコンテンツにアクセスできるよう設計されています。

# ユーザー設定
好ましいコミュニケーションスタイル: シンプルで日常的な言葉遣い
テクノロジーフォーカス：最先端のアンチブロッキング技術を搭載した2025年最新スタック
優先度: サードパーティのブロッキング耐性を備えたブロック不可能なプロキシパフォーマンス
# システムアーキテクチャ
フロントエンドアーキテクチャ
フレームワーク: TypeScript を使用した React 18
ビルドツール: 高速開発と最適化されたビルドのための Vite
UI フレームワーク: Radix UI プリミティブ上に構築された Shadcn/ui コンポーネント
スタイリング: テーマ設定用の CSS カスタム プロパティを備えた Tailwind CSS
状態管理：サーバー状態用のTanStackクエリ（Reactクエリ）
ルーティング: 軽量クライアント側ルーティング用の Wouter
フォーム処理: Zod 検証を使用した React Hook Form
# バックエンドアーキテクチャ
ランタイム: Express.js フレームワークを使用した Node.js
言語: TypeScript（ESモジュール付き）
開発: TypeScript実行用のTSX
ビルド: プロダクションバンドル用の ESBuild
アーキテクチャパターン: RESTful API設計
# データベース層
データベース: PostgreSQL (Drizzle 経由で構成)
ORM : PostgreSQL方言を使用したDrizzle ORM
移行: スキーマ管理のためのDrizzle Kit
接続: Neon データベース サーバーレス ドライバー
主要コンポーネント
フロントエンドコンポーネント
ホームページ: YouTube URL入力と動画埋め込みのメインインターフェース
UI コンポーネント: 以下を含む包括的な Shadcn/ui コンポーネント ライブラリ:
フォーム コントロール (入力、ボタン、選択など)
レイアウト コンポーネント (カード、ダイアログ、シートなど)
データ表示（表、トースト、進捗状況など）
ナビゲーション (アコーディオン、タブ、メニューバーなど)
バックエンドコンポーネント
ストレージインターフェース: メモリベースの実装による抽象化されたストレージ層
ユーザー管理: ユーザー名/パスワード認証による基本的なユーザースキーマ
ルート登録: エラー処理を備えたモジュール式ルート設定
開発サーバー: ホットリロードのための Vite 統合
# コア機能
強化された YouTube URL 処理: リアルタイム検証により、さまざまな YouTube URL 形式から動画 ID を抽出します。
2025アンチブロッキングテクノロジー：動的なヘッダーローテーション、フィンガープリントスプーフィング、高度なユーザーエージェントサイクリングを備えた最新のマルチレイヤープロキシシステム
プライバシー重視の埋め込み：強化されたパラメータとオリジン検証を備えたyoutube-nocookie.comドメインを使用
マルチエンドポイント フォールバック システム: 複数の YouTube ドメイン間での自動フェイルオーバーにより、最大限の信頼性を実現します。
AIアシスタント：外部APIに依存しない、YouTubeや一般的な質問のための高度なルールベースのチャットシステム
強化されたビデオメタデータの取得: 高度なエラー処理とサムネイルの最適化を備えた複数のエンドポイントフォールバック
リアルタイムアクセス検証：エンドポイントステータス監視による動的なビデオアクセシビリティチェック
高度なセッションセキュリティ: 暗号化セッションフィンガープリンティングと追跡防止対策
レスポンシブデザイン: ダークテーマとシームレスなAIチャット統合を備えたモバイルファーストのアプローチ
チャットセッション管理: 固有のセッション識別子による永続的なチャット履歴
包括的なエラー処理: 詳細なステータスレポートによる適切なフォールバック
データフロー
# ビデオ再生フロー
ユーザー入力: ユーザーは入力フィールドに YouTube の URL を貼り付けます。
URL検証: フロントエンドがリアルタイムフィードバックでビデオIDを抽出して検証します
強化されたアクセスチェック: バックエンドはプロキシルーティングを使用してビデオのアクセシビリティを検証します
メタデータの取得: 複数のエンドポイントからビデオのメタデータ (タイトル、作成者) を取得しようとします
埋め込み生成: 強化されたパラメータを備えた youtube-nocookie.com を使用して、プライバシー重視の埋め込み URL を作成します。
ビデオ表示: メタデータ表示とカスタムコントロールを備えた埋め込みビデオをレンダリングします
状態管理: TanStack Query は、エラーフォールバックを使用して API リクエストとキャッシュを管理します。
# AIチャットフロー
メッセージ入力: ユーザーはチャットインターフェースに質問を入力します
セッション管理: 一意のIDでチャットセッションを作成または継続します
ルールベース処理: キーワードマッチングとコンテキスト検出を使用してメッセージの内容を分析します
応答生成: 事前に定義された知識ベースに基づいて関連する回答を提供します
履歴保存: チャットメッセージとセッションをメモリストレージに保存します
リアルタイム更新: インスタントメッセージ表示でチャットインターフェースを更新します
# 外部依存関係
コア依存関係
@neondatabase/serverless : サーバーレス環境向けの PostgreSQL 接続
@tanstack/react-query : サーバー状態管理
drizzle-orm : データベース操作のための型安全な ORM
@radix-ui/ *: ヘッドレスUIコンポーネントプリミティブ
react-hook-form : フォームの状態管理
zod : 実行時の型検証
# 開発依存関係
vite : ビルドツールと開発サーバー
typescript : 型チェックとコンパイル
tailwindcss : ユーティリティファーストの CSS フレームワーク
eslint : コードのリンティングとフォーマット
# 展開戦略
発達
ホットモジュール交換機能を備えたVite開発サーバーを使用
サーバー側実行のためのTSXを使用したTypeScriptコンパイル
開発特有のエラーオーバーレイとデバッグツール
プロダクションビルド
フロントエンド: ViteはReactアプリを静的アセットにビルドしますdist/public
バックエンド: ESBuildはExpressサーバーをバンドルし、dist/index.js
データベース:db:pushコマンド経由でDrizzleマイグレーションを適用
提供: ExpressはAPIルートと静的フロントエンドアセットの両方を提供します
# 構成
環境ベースの構成NODE_ENV
DATABASE_URL環境変数経由のデータベース接続
クラウド展開のためのReplit固有の最適化
生産の安全性のための CORS とセキュリティミドルウェア
主要なアーキテクチャ上の決定
モノレポ構造: フロントエンド ( client/)、バックエンド ( server/)、共有 ( shared/) コードを単一のリポジトリにまとめる
型安全性: フロントエンドとバックエンド間で型を共有する完全な TypeScript カバレッジ
プライバシー重視: トラッキングを最小限に抑えるために YouTube の nocookie ドメインを使用します
サーバーレス対応: サーバーレス PostgreSQL デプロイメントに Neon データベースを使用
コンポーネントアーキテクチャ: 一貫したデザインシステムを備えたモジュール式UIコンポーネント
エラー境界: 複数のアプリケーション層での包括的なエラー処理
