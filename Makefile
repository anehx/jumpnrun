build: cache-clean install-frontend
	rm -rf frontend/dist
	cd frontend && ./node_modules/.bin/broccoli build dist

update: pull build install-backend

pull:
	git pull

cache-clean:
	npm cache clean
	bower cache clean

install: install-frontend install-backend

install-frontend:
	rm -rf frontend/tmp frontend/node_modules frontend/bower_components
	cd frontend && npm install
	cd frontend && bower install --allow-root

install-backend:
	rm -rf backend/node_modules
	cd backend && npm install

run:
	vagrant ssh -c "cd /vagrant && make run-server"

run-server:
	tmux new-session -n jumpnrun-dev -d 'make run-backend'
	tmux split-window -v 'make run-frontend'
	tmux attach

run-backend:
	cd backend && npm run start

run-frontend:
	cd frontend && npm run start

vagrant:
	rm -rf frontend/tmp frontend/node_modules frontend/bower_components backend/node_modules
	vagrant plugin install vagrant-hostsupdater
	vagrant up
