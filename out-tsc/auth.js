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
    clientUrl = a(clientURL);
    clientId = clientID;
    didSetup = true;
}
function a(u) {
    const url = new URL(u);
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
            throw "didnt setup";
        }
    }
    async login() {
        // Redirect to authentication prompt.
        await this.oauth.fetchAuthorizationCode();
    }
    async init() {
        try {
            const hasAuthCode = await this.oauth.isReturningFromAuthServer();
            if (hasAuthCode) {
                // Might want to persist accessContext.token until the user logs out.
                this.accessContext = await this.oauth.getAccessToken();
                console.log(this.accessContext);
                this.tryRedraw();
                // Can also use this convenience wrapper for fetch() instead of
                // using manually using getAccessToken() and setting the
                // "Authorization: Bearer ..." header.
                // const fetch = this.oauth.decorateFetchHTTPClient(window.fetch);
                // await this.useApi(fetch);
            }
            else {
                console.log("has no auth");
            }
        }
        catch (err) {
            this.error = err;
            console.error(err);
            this.tryRedraw();
        }
    }
    tryRedraw() {
        if (this.redraw) {
            this.redraw();
        }
    }
    async useApi(fetch) {
        // Example request using @bity/oauth2-auth-code-pkce decorator:
        // Lookup email associated with the Lichess account.
        // Requests will fail with 401 Unauthorized if the access token expired
        // or was revoked. Make sure to offer a chance to reauthenticate.
        // const res = await fetch(`${lichessHost}/api/account/`);
        // this.email = (await res.json()).email;
        this.tryRedraw();
    }
    async logout() {
        var _a, _b;
        const token = (_b = (_a = this.accessContext) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.value;
        this.accessContext = undefined;
        this.error = undefined;
        this.email = undefined;
        this.tryRedraw();
        // Example request using vanilla fetch: Revoke access token.
        await fetch(`${lichessHost}/api/token`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}
//# sourceMappingURL=auth.js.map