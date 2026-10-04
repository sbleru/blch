# セキュリティ運用

## ローカルのセットアップ

Git と `gitleaks git` に対応した gitleaks（8.19 以上）が必要です。パッケージマネージャーで導入できます。macOS では次を使用できます。

```console
brew install gitleaks
git config --local --get core.hooksPath
```

既存 hook の設定・内容を確認し、併用が不要であれば次を実行します。

```console
git config --local core.hooksPath .githooks
```

hook は clone ごとの設定です。`.githooks/pre-commit` が gitleaks を直接実行し、staged 差分をチェックします。gitleaks が未導入の場合もコミットを停止します。`.tools/gitleaks` があれば優先し、それ以外は PATH の gitleaks を使います。

バイナリを直接ダウンロードする場合は版と SHA-256 を固定し、実行前に照合してください。独自のインストールスクリプトや Node.js のラッパーは設けません。

## チェックの範囲

| コマンド | 対象 |
| --- | --- |
| `npm run security:staged` | index の staged 差分。hook と同じチェック |
| `npm run security:history` | ローカルに取得済みの全参照の Git 履歴（`--all`） |
| `npm run security:scan` | `security:history` の別名 |

すべて `--redact` を指定します。終了コードは問題なしなら 0、検出時やツール不足は非ゼロです。未コミット・未追跡ファイルの全体スキャンは行いません。コミットする内容は staged チェックで確認します。検出できる秘密情報の種類には限りがあります。

履歴はローカルにある範囲が対象です。shallow clone は `git fetch --unshallow` で必要な履歴を取得してください。CI は `fetch-depth: 0` を設定します。

## GitHub Actions と Push Protection

`Secret scan` は main / develop / master への push、pull request、手動実行で動きます。npm のインストールは不要です。CI 内で gitleaks 8.30.1 の Linux x64 アーカイブを固定の SHA-256 と照合し、全 Git 履歴をチェックします。版を更新するときは workflow の版とハッシュを合わせて更新します。

[gitleaks/gitleaks-action](https://github.com/gitleaks/gitleaks-action/blob/e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e/src/gitleaks.js) もありますが、確認した v3 の実装は取得バイナリの SHA-256 を検証しません。AGENTS.md の検証条件を満たすため、workflow に短い取得・検証処理を置いて CLI を直接使います。

ローカル hook は未設定や `--no-verify` で回避できます。CI がその漏れを補いますが、push 後の実行なので公開そのものを止めるものではありません。GitHub の Push Protection は対応する秘密情報の push をブロックします。[public repo では無料](https://github.blog/changelog/2023-05-09-secret-scannings-push-protection-is-available-on-public-repositories-for-free/)で利用でき、Settings のセキュリティ設定で確認できます。

GitHub 上の workflow 成功確認と、ブランチ保護への必須チェック登録は別作業です。ローカル検証だけで GitHub 上の実行済みとは扱いません。

全 workflow の既定権限は `{}`、ジョブごとに必要な権限を付与します。checkout は `persist-credentials: false` とし、チェック後に Git の認証設定を残しません。Actions は full-length commit SHA に固定します。npm 公開ジョブの `contents: read` と `id-token: write`、provenance を維持します。依存は lockfile と `npm ci` で再現し、Dependabot と Dependency review を維持します。

## 秘密情報の取り扱いと検出時の対応

- 実際の token・cookie・API key・秘密鍵をコード・データ・文書・会話・ログへ記載しません。
- `.env` / `.env.*`、ローカル `.npmrc`、`.aws/`、`*.pem`、`*.key` は除外します。環境変数の example には変数名と安全なダミー値だけを記載します。
- `.gitignore` は追跡済みの情報を消しません。`data/` は公開データとして管理し、認証情報を混ぜません。
- レポートを作る場合も必ず redact し、Git に含めません。
- エージェントは実値を読まず、ファイル名・追跡状況・変数名で確認します。[AGENTS.md](../AGENTS.md) の指示は OS による強制的な読み取り拒否とは異なります。

検出した実値を貼り付けず、ファイル名・ルール名などで報告します。未コミットなら staged 差分から取り除いて再チェックします。コミット済み・公開済みなら失効／ローテーションを検討します。履歴の書き換えや外部サービスの認証情報操作は、対象と影響を確認して別途実施します。

誤検知の除外は根拠を確認し、対象を限定します。設定ファイルは置かず、gitleaks の標準ルールを使います。追加の除外はありません。脆弱性の報告先は [SECURITY.md](../SECURITY.md) を参照してください。

- [gitleaks 8.30.1 の公式リリース](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1)
- [gitleaks のコマンド・設定](https://github.com/gitleaks/gitleaks/tree/v8.30.1)
