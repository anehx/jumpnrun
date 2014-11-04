# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu/trusty64"
  config.vm.guest = :ubuntu
  config.vm.hostname = 'jumpnrun.vm'

  begin
    if Vagrant.plugin("2").manager.config.has_key? :vbguest then
      config.vbguest.auto_update = false
    end
  rescue
  end

  config.vm.provider "virtualbox" do |v|
    v.customize ['storagectl', :id, '--name', 'SATAController', '--hostiocache', 'on']
    v.customize ["modifyvm", :id, "--rtcuseutc", "on"]
  end

  config.hostsupdater.remove_on_suspend = true
  #config.hostsupdater.aliases = ["hplus.vm"]

  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "https://vagrantcloud.com/ubuntu/trusty64/version/1/provider/virtualbox.box"

  # Create a forwarded port lapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  #config.vm.network :forwarded_port, guest: 80, host: 8080
  #config.vm.network :forwarded_port, guest: 22, host: 2222

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network :private_network, ip: "192.168.55.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  config.vm.network :public_network

  # If true, then any SSH connections made will enable agent forwarding.
  # Default value: false
  config.ssh.forward_agent = true

  config.vm.provision :shell, :path => 'tools/vagrant/install-lamp.sh'
  config.vm.provision :shell, :path => 'tools/vagrant/prepare-jumpnrun.sh'
end
