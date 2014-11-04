#!/bin/bash

cd /vagrant

echo "Setting up Apache config..."
cp /vagrant/tools/vagrant/vhost.conf /etc/apache2/sites-available/default.conf
rm /etc/apache2/sites-enabled/000-default.conf
ln -s /etc/apache2/sites-available/default.conf /etc/apache2/sites-enabled/default.conf
service apache2 restart

echo "Setting up SSH permissions..."
su vagrant -c 'yes|ssh-keygen -f ~/.ssh/id_rsa -P ""'
su vagrant -c 'ssh-keyscan localhost >> ~/.ssh/known_hosts'
su vagrant -c 'cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys'
su vagrant -c 'cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys'
