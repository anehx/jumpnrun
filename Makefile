install:
	@npm install

run:
	@vagrant ssh -c "cd /vagrant; nodemon --harmony app.js"

vagrant:
	@vagrant plugin install vagrant-hostsupdater
	@vagrant up
