import { IFileItem } from './file-item.model';
import { UUID } from 'angular2-uuid';

export interface IFile extends IFileItem {
  content: string;
  open: boolean;
  saved: boolean;
}

export class File implements IFile {
  itemType = 'file';
  id: string;
  name: string;
  tempContent: string;
  content: string;
  open: boolean;
  saved = true;

  constructor(name: string, content: string = '', open: boolean = false, id: string = UUID.UUID()) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.tempContent = content;
    this.open = open;
  }

  toObject(): Object {
    return {
      id: this.id,
      itemType: this.itemType,
      name: this.name,
      content: this.content,
      open: this.open
    };
  }
}
