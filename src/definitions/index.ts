type Field = {
  brethren: string;
  colorder: number;
  description: string;
  directname: string | null;
  enum_depth: number | null;
  enum_root: string | null;
  family: string;
  filterquery: string | null;
  filtervalue: string | null;
  inherited: boolean;
  level: number;
  mappedcol: string;
  name: string;
  nullable: boolean;
  refname: string | null;
  target: string | null;
  typename: string;
  value: string;
};

export type Family = {
  abstract: boolean;
  displaygender: string;
  displayname: string;
  displaynames: string;
  icon?: string;
  id: string;
  name: string;
  parent?: string;
  fields: Field[];
};

export type QuillDashboard = {
  apiUrl: string;
  families: Family[];
  currentFamily?: Family;
  currentData?: any[];
};
