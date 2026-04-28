export interface IPropertyType {
  id: string;
  name: string;
}

export interface IPropertyTypeAllData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyTypeRepo {
  getAll(): Promise<IPropertyType[]>;
  findByName(name: string): Promise<IPropertyType | null>;
  findById(id: string): Promise<IPropertyType | null>;
  save(data: IPropertyType): Promise<IPropertyTypeAllData>;
  delete(id: string): Promise<IPropertyTypeAllData>;
}
