"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorRoutes = exports.connectionRoutes = exports.browseRoutes = exports.mediaRoutes = exports.playlistRoutes = exports.beatRoutes = exports.userRoutes = exports.authRoutes = void 0;
var auth_routes_1 = require("./auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var user_routes_1 = require("./user.routes");
Object.defineProperty(exports, "userRoutes", { enumerable: true, get: function () { return __importDefault(user_routes_1).default; } });
var beat_routes_1 = require("./beat.routes");
Object.defineProperty(exports, "beatRoutes", { enumerable: true, get: function () { return __importDefault(beat_routes_1).default; } });
var playlist_routes_1 = require("./playlist.routes");
Object.defineProperty(exports, "playlistRoutes", { enumerable: true, get: function () { return __importDefault(playlist_routes_1).default; } });
var media_routes_1 = require("./media.routes");
Object.defineProperty(exports, "mediaRoutes", { enumerable: true, get: function () { return __importDefault(media_routes_1).default; } });
var browse_routes_1 = require("./browse.routes");
Object.defineProperty(exports, "browseRoutes", { enumerable: true, get: function () { return __importDefault(browse_routes_1).default; } });
var connection_routes_1 = require("./connection.routes");
Object.defineProperty(exports, "connectionRoutes", { enumerable: true, get: function () { return __importDefault(connection_routes_1).default; } });
var creator_routes_1 = require("./creator.routes");
Object.defineProperty(exports, "creatorRoutes", { enumerable: true, get: function () { return __importDefault(creator_routes_1).default; } });
//# sourceMappingURL=index.js.map