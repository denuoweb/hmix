export interface IFileItem {
  name: string;
  itemType: string;

  toObject(): Object;
}
