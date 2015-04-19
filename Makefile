run:
	vagrant ssh -c "cd /vagrant && make run-server"

run-server:
	tmux new-session -n jumpnrun-dev -d 'npm run watch-backend'
	tmux split-window -v 'npm run start-frontend'
	tmux attach

clean:
	rm -rf node_modules/ bower_components/ tmp/
	npm cache clean

test:
	grunt test
