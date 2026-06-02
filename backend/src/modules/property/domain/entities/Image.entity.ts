import { v7 as uuidv7 } from 'uuid';

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
    id = id ? id : uuidv7();
    return new ImageEntity(id, data);
  }

  get data() {
    return this._data;
  }

  get id() {
    return this._id;
  }
}
