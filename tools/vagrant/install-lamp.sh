#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

# Load pre-defined settings, so debconf / apt-get won't ask any questions
debconf-set-selections < /vagrant/tools/vagrant/debconf-set-selections.txt

apt-get update

apt-get -q -y install lamp-server^ phpmyadmin make

apt-get install php5-xdebug

a2enmod rewrite
a2enmod ssl

# Add www-data to vagrant group
usermod -a -G vagrant www-data

# Restart services
/etc/init.d/apache2 restart
