#!/usr/bin/env bash
# 服务器一次性初始化:Caddy + 站点目录 + CI 部署公钥
# 用法(服务器上 root 执行):
#   bash <(curl -fsSL https://raw.githubusercontent.com/ENyerere/manuscript-archive/main/deploy/setup-server.sh)
# 或手动粘贴本文件内容执行。幂等,可重复运行。
set -euo pipefail

SITE_DIR=/var/www/blog
PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDc3MOqgGDOIlIj8cE37bAEQdqW+Gzwk/vGMS5E/0+D1 github-actions-deploy"

echo "==> 安装 Caddy 与 rsync"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq caddy rsync

echo "==> 创建站点目录 ${SITE_DIR}"
mkdir -p "${SITE_DIR}"

echo "==> 写入 Caddyfile(当前为 IP 阶段,仅 HTTP;域名备案完成后把 :80 换成域名即可自动 HTTPS)"
cat > /etc/caddy/Caddyfile <<'EOF'
# 手稿档案 · 自有服务器
# IP 阶段:纯 HTTP 监听 80 端口
# 域名阶段:把 ":80" 改为 "your-domain.com",Caddy 自动签发并续期 HTTPS 证书
:80 {
    root * /var/www/blog
    encode gzip zstd

    # SPA 路由回退:前端路由路径都回退到 index.html
    try_files {path} /index.html
    file_server

    # Vite 构建产物带内容哈希,可安全长缓存
    @hashed path /assets/*
    header @hashed Cache-Control "public, max-age=31536000, immutable"
}
EOF

systemctl enable caddy
systemctl reload caddy || systemctl restart caddy

echo "==> 授权 CI 部署公钥"
mkdir -p /root/.ssh && chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys
grep -qF "${PUBKEY}" /root/.ssh/authorized_keys || echo "${PUBKEY}" >> /root/.ssh/authorized_keys

echo "==> 完成。站点目录: ${SITE_DIR};HTTP 已监听 :80"
echo "    下一步: GitHub 仓库配置 secrets 后,push main 分支即可自动部署。"
