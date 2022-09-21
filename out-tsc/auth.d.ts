import { AccessContext, HttpClient, OAuth2AuthCodePKCE } from "@bity/oauth2-auth-code-pkce";
export declare const lichessHost = "https://lichess.org";
export declare const scopes: any[];
export declare let clientId: string;
export declare let clientUrl: string;
export interface SetupProps {
    clientID: string;
    clientURL: string;
}
/**
 *
 * @param setup:
 *  clientId: string; // "example.com"
 *  clientUrl: string; //"http://localhost:5173/"
 */
export declare function setup({ clientID, clientURL }: SetupProps): void;
export declare class Ctrl {
    oauth: OAuth2AuthCodePKCE;
    constructor();
    error?: any;
    accessContext?: AccessContext;
    email?: string;
    redraw?: () => void;
    login(): Promise<void>;
    init(): Promise<void>;
    tryRedraw(): void;
    useApi(fetch: HttpClient): Promise<void>;
    logout(): Promise<void>;
}
