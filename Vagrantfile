# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.hostname = 'jumpnrun'

  config.vm.box = 'ubuntu/trusty64'
  config.vm.box_url = 'https://vagrantcloud.com/ubuntu/boxes/trusty64/versions/14.04/providers/virtualbox.box'

  config.vm.box = 'ubuntu/trusty64'

  config.hostsupdater.aliases = [ 'jumpnrun.vm' ]
  config.hostsupdater.remove_on_suspend = true

  config.vm.provider 'virtualbox' do |v|
    v.customize [ 'storagectl', :id, '--name',   'SATAController', '--hostiocache', 'on' ]
    v.customize [ 'modifyvm',   :id, '--cpus',   2 ]
    v.customize [ 'modifyvm',   :id, '--memory', 2048 ]
  end

  config.vm.network :private_network, :ip => '192.168.10.10'
  config.vm.network :public_network

  config.ssh.forward_agent = true

  config.vm.synced_folder '.', '/vagrant', :nfs => { :mount_options => [ 'rw', 'vers=3', 'tcp', 'fsc' ] }

  config.vm.provision :shell, :path => 'tools/vagrant/provision.sh'
  config.vm.provision :shell, :inline => 'service nginx restart', :run => 'always'
end
