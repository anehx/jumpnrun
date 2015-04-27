import config from './config'

let socket = io.connect(config.server.url)

export default socket
