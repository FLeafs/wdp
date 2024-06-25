echo "Installing dependencies"
yes | pkg update
yes | pkg upgrade
pkg install git -y
pkg install nodejs -y

echo "Cloning repository"
git clone https://github.com/FLeafs/wdp.git

echo "NPM install"
npm i

echo "Done... skrg run : cd && cd wdp && node main.js"
