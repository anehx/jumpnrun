#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

# install basic packages
apt-get update
apt-get install -y curl build-essential git make nginx tmux cachefilesd
echo "RUN=yes" > /etc/default/cachefilesd
sed -i -e 's/sendfile\s\+on/sendfile off/' /etc/nginx/nginx.conf

# install latest node js version
curl -sL https://deb.nodesource.com/setup | bash -
apt-get install -y nodejs

# install jumpnrun and its dependencies
npm install -g npm broccoli-cli bower nodemon
cd /vagrant && su vagrant -c "make install"

# configure nginx
ln -sf /vagrant/tools/vagrant/nginx.conf /etc/nginx/sites-enabled/jumpnrun
rm -f /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default
/etc/init.d/nginx restart
