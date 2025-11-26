export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-KdwdSmRVpjrQKL2zMmLwvY"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && unzip -q upload/tablet-sweeptouch.zip -d . && ls -la tablet-sweeptouch
source /home/ubuntu/.user_env && cd . && ls -la /home/ubuntu/ | grep -E "tablet|sweep"
source /home/ubuntu/.user_env && cd . && unzip -l /home/ubuntu/upload/tablet-sweeptouch.zip | head -30
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && unzip -o -q upload/tablet-sweeptouch.zip && ls -la
source /home/ubuntu/.user_env && cd . && find /home/ubuntu/src -type f -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | head -30
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && zip -r tablet-sweeptouch-corregido.zip . -x "node_modules/*" ".next/*" ".git/*" "upload/*" ".browser_data_dir/*" ".cache/*" ".logs/*" ".npm/*" ".nvm/*" ".pki/*" ".secrets/*" "Downloads/*" "sandbox.txt" ".user_env" ".zshrc" ".bash_logout" ".bashrc" ".profile" ".gitignore" ".local/*" ".config/*" && ls -lh tablet-sweeptouch-corregido.zip
