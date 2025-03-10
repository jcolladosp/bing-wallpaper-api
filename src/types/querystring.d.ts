import { resolutions } from '../constants/resolutions.const';

export type QuerystringType = {
  resolution?: (typeof resolutions)[number];
  w?: number;
  h?: number;
  qlt?: number;
  index?: number | 'random';
  date?: string;
  format?: 'json';
};
