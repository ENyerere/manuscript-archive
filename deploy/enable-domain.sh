#!/usr/bin/env bash
# 域名切换:备案通过、DNS 解析生效后在服务器上执行一次
# 用法(服务器上 root 执行):
#   bash <(curl -fsSL https://raw.githubusercontent.com/ENyerere/manuscript-archive/main/deploy/enable-domain.sh)
# 前置条件:yshenyi.ink 与 www.yshenyi.ink 的 A 记录已指向本机,安全组 80/443 已放行
set -euo pipefail

DOMAIN=yshenyi.ink

echo "==> 预检:域名解析是否已指向本机"
RESOLVED=$(getent hosts "${DOMAIN}" | awk '{print $1}' | head -1 || true)
if [ "${RESOLVED}" != "123.56.44.30" ]; then
  echo "!! ${DOMAIN} 当前解析到 [${RESOLVED:-无记录}],不是 123.56.44.30"
  echo "!! 请先在阿里云 DNS 控制台添加 A 记录,生效后再运行本脚本"
  exit 1
fi

echo "==> 写入域名版 Caddyfile(Caddy 将自动签发 HTTPS 证书)"
cat > /etc/caddy/Caddyfile <<'EOF'
# 手稿档案 · yshenyi.ink
# www 与裸域统一跳转到主域 HTTPS
www.yshenyi.ink {
    redir https://yshenyi.ink{uri} permanent
}

# 裸 IP 访问统一跳转到主域
:80 {
    redir https://yshenyi.ink{uri} permanent
}

yshenyi.ink {
    root * /var/www/blog
    encode gzip zstd

    # 构建期为文章/标签等路由预生成了 {path}.html;其余前端路由回退到 index.html
    # {path}.html 必须在前:/tags 同时存在 tags.html 与 tags/ 目录
    try_files {path}.html {path} /index.html
    file_server

    # 带哈希构建产物长缓存;其余文件每次协商
    @hashed path /assets/*
    header @hashed Cache-Control "public, max-age=31536000, immutable"
    @unhashed not path /assets/*
    header @unhashed Cache-Control "no-cache"

    header {
        Strict-Transport-Security "max-age=31536000"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        X-Frame-Options "SAMEORIGIN"
        -Server
    }
}
EOF

systemctl reload caddy

echo "==> 等待证书签发(约 10-30 秒)"
sleep 15
curl -sI "https://${DOMAIN}/" | head -3 || true

echo "==> 完成。若上面返回 HTTP/2 200,HTTPS 已生效"
echo "    剩余步骤: GitHub 变量 SITE_URL 改为 https://${DOMAIN},页脚挂备案号"
