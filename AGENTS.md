# blch 作業方針

## 秘密情報

- `.env` / `.env.*`、認証情報を含む `.npmrc`、秘密鍵、`.aws/` などの実値を読んだり、会話・文書・ログ・外部ツールへ出力しない。
- 設定確認はファイル名・追跡状態・環境変数名で行う。値が必要な操作は、値を表示せずツールへ渡す。
- 秘密情報の検出には `npm run security:scan` / `npm run security:history` / `npm run security:staged` を使用する。検出値は常に redact する。
- Git 管理された秘密情報を検出した場合は、値を転載せず種類・ファイル・必要な対応を報告する。自動で履歴を書き換えたり、例外へ登録したりしない。
- 指示による読み取り制限は OS の隔離ではない。利用するエージェントの対応が確認できない拒否設定を推測で追加しない。

## 依存・CI

- npm 依存を変更したら `package-lock.json` を更新する。CI のインストールには `npm ci` を使う。
- GitHub Actions の `uses:` は full-length commit SHA で固定する。
- workflow の既定権限は `{}`、ジョブごとに必要な権限を付与する。checkout は `persist-credentials: false` を設定する。
- 取得して実行するバイナリは、版と SHA-256 を固定して検証する。
- `data/` は公開・配布する共通データとして管理する。秘密情報や音声生成サービスの認証情報を混ぜない。

## 検証

- セキュリティ設定を変えたら [docs/security.md](docs/security.md) を更新する。
- GitHub 上で未実行のチェックを検証済みとして報告しない。
- 通常の検証は `npm run typecheck`、`npm test`、`npm run pack:check`。
