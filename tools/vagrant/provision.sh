#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

# install basic packages
apt-get update
apt-get install -y curl build-essential git make nginx
sed -i -e 's/sendfile\s\+on/sendfile off/' /etc/nginx/nginx.conf

# install latest node js version
curl -sL https://deb.nodesource.com/setup | bash -
apt-get install -y nodejs

# install jumpnrun
cd /vagrant && su vagrant -c "make install"

# configure nginx
ln -sf /vagrant/tools/vagrant/nginx.conf /etc/nginx/sites-enabled/jumpnrun
rm -f /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default
/etc/init.d/nginx restart
