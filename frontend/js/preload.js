const manifest = [
  { src: 'images/box_tile.png',    id: 'box_tile' }
, { src: 'images/goodie_tile.png', id: 'goodie_tile' }
]

let loader = new createjs.LoadQueue()
loader.loadManifest(manifest)

export default loader
