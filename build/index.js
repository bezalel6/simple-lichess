// import express from 'express'
// import { fetchGames, fetchUserInfo } from './Fetcher.js';
// import Game from './Game.js';
// abstract class App {
// 	static get port(): number { return 5002 }
// 	static init(): any {
// 		switch (process.argv[2]) {
// 			case 'start-server':
// 				return App.start_server()
// 			default:
// 				return App.display_help()
// 		}
// 	}
// 	static start_server(): void {
// 		const server = express()
// 		server.get('/make-vehicle', App.make_vehicle)
// 		server.get('/', async (req, res) => {
// 			(await fetchGames("bezalel6", { rated: 'rated', maxGames: 5 })).listen((game: Game) => {
// 				console.log(game.white, 'vs', game.black)
// 			})
// 			res.send("yupyup")
// 		})
// 		server.listen(App.port, () => { console.log('Listening on port ' + App.port) })
// 	}
// 	static make_vehicle(request: express.Request, response: express.Response) {
// 	}
// 	static display_help() { console.log('usage: index.ts [ start-server | list-vehicles ]') }
// }
// App.init()
// App.start_server()
export * from './Game.js';
export * from './Fetcher.js';
export * from './Misc.js';
export * from './UserData.js';
//# sourceMappingURL=index.js.map