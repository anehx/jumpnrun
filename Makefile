install:
	@npm install

run:
	@vagrant ssh -c "cd /vagrant; nodemon app.js"

vagrant:
	@vagrant plugin install vagrant-hostsupdater
	@vagrant up
