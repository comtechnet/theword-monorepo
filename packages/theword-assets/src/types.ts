export interface thewordeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

export interface EncodedImage {
  filename: string;
  data: string;
}

export interface TheWordData {
  parts: EncodedImage[];
  background: string;
}
