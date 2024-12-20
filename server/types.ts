export interface DatabaseType {
  data: string;
  integrity: string;
  timestamp: string;
}

export interface DatabaseMasterType {
  current: DatabaseType;
  history: DatabaseType[];
}
