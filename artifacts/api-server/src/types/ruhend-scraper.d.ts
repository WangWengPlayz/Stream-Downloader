declare module "ruhend-scraper" {
  export interface TtdlResult {
    title?: string;
    author?: string;
    username?: string;
    published?: string;
    like?: string | number;
    comment?: string | number;
    share?: string | number;
    views?: string | number;
    bookmark?: string | number;
    video?: string | string[];
    cover?: string;
    music?: string | string[];
    profilePicture?: string;
  }

  export interface YtResult {
    title?: string;
    audio?: string;
    video?: string;
    author?: string;
    description?: string;
    duration?: string;
    views?: string | number;
    upload?: string;
    thumbnail?: string;
  }

  export interface YtSearchVideo {
    type?: string;
    title?: string;
    url?: string;
    durationH?: string;
    publishedTime?: string;
    view?: string;
    thumbnail?: { url?: string }[];
    author?: { name?: string; url?: string };
  }

  export interface YtSearchChannel {
    type?: string;
    channelName?: string;
    url?: string;
    subscriberH?: string;
    videoCount?: string | number;
  }

  export interface YtSearchResult {
    video?: YtSearchVideo[];
    channel?: YtSearchChannel[];
  }

  export interface IgItem {
    url?: string;
    [key: string]: unknown;
  }

  export interface IgResult {
    data?: IgItem[];
  }

  export interface FbItem {
    url?: string;
    resolution?: string;
    [key: string]: unknown;
  }

  export interface FbResult {
    data?: FbItem[];
  }

  export function ttdl(url: string): Promise<TtdlResult>;
  export function ytmp3(url: string): Promise<YtResult>;
  export function ytmp4(url: string): Promise<YtResult>;
  export function ytsearch(query: string): Promise<YtSearchResult>;
  export function igdl(url: string): Promise<IgResult>;
  export function fbdl(url: string): Promise<FbResult>;
}
