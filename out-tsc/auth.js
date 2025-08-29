import { OAuth2AuthCodePKCE, } from "@bity/oauth2-auth-code-pkce";
export const lichessHost = "https://lichess.org";
export const scopes = [];
export let clientId; // "example.com";
export let clientUrl; //"http://localhost:5173/";
let didSetup = false;
/**
 *
 * @param setup:
 *  clientId: string; // "example.com"
 *  clientUrl: string; //"http://localhost:5173/"
 */
export function setup({ clientID, clientURL }) {
    clientUrl = cleanUrl(clientURL);
    clientId = clientID;
    didSetup = true;
}
function cleanUrl(urlString) {
    const url = new URL(urlString);
    url.search = "";
    return url.href;
}
export class Ctrl {
    constructor() {
        this.oauth = new OAuth2AuthCodePKCE({
            authorizationUrl: `${lichessHost}/oauth`,
            tokenUrl: `${lichessHost}/api/token`,
            clientId,
            scopes,
            redirectUrl: clientUrl,
            onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
            onInvalidGrant: (_retry) => { },
        });
        if (!didSetup) {
            throw new Error("Authentication not setup. Call setup() first with clientID and clientURL.");
        }
    }
    async login() {
        await this.oauth.fetchAuthorizationCode();
    }
    async init() {
        try {
            const hasAuthCode = await this.oauth.isReturningFromAuthServer();
            if (hasAuthCode) {
                this.accessContext = await this.oauth.getAccessToken();
                this.tryRedraw();
            }
        }
        catch (err) {
            this.error = err;
            this.tryRedraw();
        }
    }
    tryRedraw() {
        if (this.redraw) {
            this.redraw();
        }
    }
    async logout() {
        var _a, _b;
        const token = (_b = (_a = this.accessContext) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.value;
        this.accessContext = undefined;
        this.error = undefined;
        this.email = undefined;
        this.tryRedraw();
        if (token) {
            await fetch(`${lichessHost}/api/token`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    }
}
//# sourceMappingURL=auth.js.map