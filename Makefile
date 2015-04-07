install:
	@npm install

run: build-frontend
	@vagrant ssh -c "cd /vagrant; node_modules/.bin/babel-node backend/app.js"

vagrant:
	@vagrant plugin install vagrant-hostsupdater
	@vagrant up

build-frontend:
	@rm -r frontend/dist
	@broccoli build frontend/dist
