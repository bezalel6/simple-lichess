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
export function setup({ clientID, clientURL }: SetupProps): void {
  clientUrl = cleanUrl(clientURL);
  clientId = clientID;
  didSetup = true;
}

function cleanUrl(urlString: string): string {
  const url = new URL(urlString);
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
      throw new Error("Authentication not setup. Call setup() first with clientID and clientURL.");
    }
  }
  error?: any;
  accessContext?: AccessContext;

  email?: string;
  redraw?: () => void;

  async login(): Promise<void> {
    await this.oauth.fetchAuthorizationCode();
  }

  async init(): Promise<void> {
    try {
      const hasAuthCode = await this.oauth.isReturningFromAuthServer();
      if (hasAuthCode) {
        this.accessContext = await this.oauth.getAccessToken();
        this.tryRedraw();
      }
    } catch (err) {
      this.error = err;
      this.tryRedraw();
    }
  }
  private tryRedraw(): void {
    if (this.redraw) {
      this.redraw();
    }
  }

  async logout(): Promise<void> {
    const token = this.accessContext?.token?.value;
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
