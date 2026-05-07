import { randomUUID } from 'crypto';

export interface IImage {
  id?: string;
  url: string;
}

export class ImageEntity {
  constructor(
    private readonly _id: string,
    private _data: Omit<IImage, 'id'>,
  ) {}

  static createImage(data: Omit<IImage, 'id'>, id?: string) {
    id = id ? id : randomUUID();
    return new ImageEntity(id, data);
  }

  get data() {
    return this._data;
  }

  get id() {
    return this._id;
  }
}
