install:
	@npm install

run:
	@node app.js

vagrant:
	@vagrant plugin install vagrant-hostsupdater
	@vagrant up
