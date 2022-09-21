import {
  AccessContext,
  HttpClient,
  OAuth2AuthCodePKCE,
} from "@bity/oauth2-auth-code-pkce";

export const lichessHost = "https://lichess.org";
export const scopes = [];

export let clientId: string; // "example.com";
export let clientUrl: string; //"http://localhost:5173/";
export interface SetupProps {
  clientID: string;
  clientURL: string;
}
let didSetup = false;
/**
 *
 * @param setup:
 *  clientId: string; // "example.com"
 *  clientUrl: string; //"http://localhost:5173/"
 */
export function setup({ clientID, clientURL }: SetupProps) {
  clientUrl = a(clientURL);
  clientId = clientID;
  didSetup = true;
}

function a(u: string) {
  const url = new URL(u);
  url.search = "";
  return url.href;
}
export class Ctrl {
  oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes,
    redirectUrl: clientUrl,
    onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
    onInvalidGrant: (_retry) => {},
  });
  constructor() {
    if (!didSetup) {
      throw "didnt setup";
    }
  }
  error?: any;
  accessContext?: AccessContext;

  email?: string;
  redraw?: () => void;

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
      } else {
        console.log("has no auth");
      }
    } catch (err) {
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
  async useApi(fetch: HttpClient) {
    // Example request using @bity/oauth2-auth-code-pkce decorator:
    // Lookup email associated with the Lichess account.
    // Requests will fail with 401 Unauthorized if the access token expired
    // or was revoked. Make sure to offer a chance to reauthenticate.
    // const res = await fetch(`${lichessHost}/api/account/`);
    // this.email = (await res.json()).email;
    this.tryRedraw();
  }

  async logout() {
    const token = this.accessContext?.token?.value;
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
