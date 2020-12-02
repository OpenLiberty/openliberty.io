# Install the latest node version using nvm (Node Version Manager)
timer_start=$(date +%s)

echo "Install Node"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install --lts

echo "npm version:"
echo `npm -v`

timer_end=$(date +%s)
echo "Total execution time for installing Node: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"