declare module "nayan-media-downloaders" {
  export interface AlldownV2Media {
    title?: string;
    thumbnail?: string;
    token_info?: {
      token?: string;
      expires_at?: string;
      remaining?: string;
    };
    stream?: {
      video?: string;
      audio?: string;
    };
    download?: {
      video?: string;
      audio?: string;
    };
  }

  export interface AlldownV2Result {
    status: boolean;
    developer?: string;
    data?: AlldownV2Media;
  }

  export interface AlldownResult {
    status: boolean;
    developer?: string;
    media?: {
      title?: string;
      thumbnail?: string;
      low?: string;
      high?: string;
    };
  }

  export interface TikdownAuthor {
    id?: string;
    unique_id?: string;
    nickname?: string;
    avatar?: string;
  }

  export interface TikdownData {
    author?: TikdownAuthor;
    view?: number;
    comment?: number;
    play?: number;
    share?: number;
    download?: number;
    duration?: number;
    title?: string;
    video?: string;
    audio?: string;
  }

  export interface TikdownResult {
    status: boolean;
    developer?: string;
    data?: TikdownData;
  }

  export interface YtdownData {
    title?: string;
    thumbnail?: string;
    duration?: string | number;
    video?: string;
    audio?: string;
    low?: string;
    high?: string;
  }

  export interface YtdownResult {
    status: boolean;
    developer?: string;
    data?: YtdownData;
  }

  export interface TwitterData {
    HD?: string;
    SD?: string;
  }

  export interface TwitterResult {
    status: boolean;
    developer?: string;
    data?: TwitterData;
  }

  export interface NdownItem {
    resolution?: string;
    thumbnail?: string;
    url?: string;
    shouldRender?: boolean;
  }

  export interface NdownResult {
    status: boolean;
    developer?: string;
    data?: NdownItem[];
  }

  export interface InstagramItem {
    url?: string;
    thumbnail?: string;
    [key: string]: unknown;
  }

  export interface InstagramResult {
    status: boolean;
    developer?: string;
    data?: InstagramItem[];
  }

  export function alldownV2(url: string): Promise<AlldownV2Result>;
  export function alldown(url: string): Promise<AlldownResult>;
  export function tikdown(url: string): Promise<TikdownResult>;
  export function ytdown(url: string): Promise<YtdownResult>;
  export function twitterdown(url: string): Promise<TwitterResult>;
  export function ndown(url: string): Promise<NdownResult>;
  export function instagram(url: string): Promise<InstagramResult>;
  export function fbdown2(url: string, key: string): Promise<{ status: boolean; media?: { title?: string; hd?: string; sd?: string } }>;
  export function pintarest(url: string): Promise<AlldownResult>;
  export function capcut(url: string): Promise<AlldownResult>;
  export function likee(url: string): Promise<AlldownResult>;
  export function threads(url: string): Promise<AlldownResult>;
  export function GDLink(url: string): Promise<AlldownResult>;
  export function spotifySearch(query: string, limit?: number): Promise<unknown>;
  export function spotifyDl(url: string): Promise<unknown>;
  export function soundcloudSearch(query: string, limit?: number): Promise<unknown>;
  export function soundcloud(url: string): Promise<unknown>;
  export function terabox(url: string): Promise<unknown>;
}
