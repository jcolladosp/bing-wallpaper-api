import { JSONSchemaType } from 'ajv';
import { resolutions } from './resolutions.const';
import { QuerystringType } from '../types/querystring';

export const QUERYSTRING_SCHEMA: JSONSchemaType<QuerystringType> = {
  type: 'object',
  properties: {
    resolution: {
      type: 'string',
      nullable: true,
      enum: resolutions,
      default: '1920x1080',
    },
    w: {
      type: 'integer',
      minimum: 0,
      nullable: true,
    },
    h: {
      type: 'integer',
      minimum: 0,
      nullable: true,
    },
    qlt: {
      type: 'integer',
      nullable: true,
      minimum: 0,
      maximum: 100,
    },
    index: {
      type: ['integer', 'string'] as any,
      anyOf: [
        { type: 'integer' },
        {
          type: 'string',
          const: 'random',
        },
      ],
      default: 0,
      nullable: true,
    },
    date: {
      type: 'string',
      pattern: '\\d{8}',
      nullable: true,
    },
    format: {
      type: 'string',
      nullable: true,
      enum: ['json'],
    },
  },
  additionalProperties: false,
};
