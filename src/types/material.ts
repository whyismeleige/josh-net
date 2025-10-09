export interface Subject {
  code: string;
  name: string;
  _id: string;
}

export interface MaterialsData {
  [semesterKey: string]: Subject[];
}
