export interface IPropertyType {
  id: string;
  name: string;
}

export interface IPropertyTypeRepo {
  getAll(): Promise<IPropertyType[]>;
  findByName(name: string): Promise<IPropertyType | null>;
  findById(id: string): Promise<IPropertyType | null>;
  save(data: IPropertyType): Promise<void>;
  delete(id: string): Promise<void>;
}
