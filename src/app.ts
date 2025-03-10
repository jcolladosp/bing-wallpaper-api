import { promises as fs } from 'fs';
import path from 'path';
import { ImageType } from './types/image-type';
import { QuerystringType } from './types/querystring';
import { QUERYSTRING_SCHEMA } from './constants/querystring-schema.const';

const BASE_URL = 'https://www.bing.com';

const dataFilePath = path.join(__dirname, '..', 'json', 'data.json');

const getImageByIndex = (data: ImageType[], index: number) => {
  const len = data.length;

  if (index >= len) {
    throw new Error(`Out of 'index' range!`);
  }

  if (index < 0) {
    return data[len + index];
  }

  return data[index];
};

const getImageByDate = (data: ImageType[], date: string) => {
  const image = data.find((item) => item.startdate === date);

  if (!image) {
    throw new Error(`Out of 'date' range!`);
  }

  return image;
};

const getImageRandom = (data: ImageType[]) => {
  const len = data.length;
  const idx = Math.floor(len * Math.random());

  return getImageByIndex(data, idx);
};

export const createApp = (options: FastifyServerOptions = {}) => {
  const app = Fastify({
    ignoreTrailingSlash: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
    ...options,
  });

  app.register(cors, { origin: true, methods: ['GET'] });
  app.register(sensible);

  app.get('/favicon.ico', (req, res) => res.code(204).send());

  app.get(
    '/',
    {
      schema: {
        querystring: QUERYSTRING_SCHEMA,
      },
    },
    async (
      request: FastifyRequest<{
        Querystring: QuerystringType;
      }>,
      reply: FastifyReply
    ) => {
      const { date, index, format, resolution, ...params } = request.query;

      const data = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));

      let image: ImageType & { url?: string };

      if (index === 'random') {
        image = getImageRandom(data);
      } else if (date) {
        image = getImageByDate(data, date);
      } else {
        image = getImageByIndex(data, index || 0);
      }

      const imgPath = `${image.urlbase}_${resolution}.jpg`;
      const search = new URLSearchParams(params as any).toString();

      const url = `${BASE_URL}${imgPath}` + (search ? `&${search}` : '');
      console.log('url: ', url);

      if (format === 'json') {
        return { ...image, url };
      }

      return reply.redirect(307, url);
    }
  );

  return app;
};
