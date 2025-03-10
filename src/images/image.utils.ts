import { ImageType } from '../types/image-type';

export const getImageByIndex = (data: ImageType[], index: number) => {
  const len = data.length;

  if (index >= len) {
    throw new Error(`Out of 'index' range!`);
  }

  if (index < 0) {
    return data[len + index];
  }

  return data[index];
};

export const getImageByDate = (data: ImageType[], date: string) => {
  const image = data.find((item) => item.startdate === date);

  if (!image) {
    throw new Error(`Out of 'date' range!`);
  }

  return image;
};

export const getImageRandom = (data: ImageType[]) => {
  const len = data.length;
  const idx = Math.floor(len * Math.random());

  return getImageByIndex(data, idx);
};
