export interface IFileObject {
  id: string;
  name: string;
  content: string;
  isOpen: boolean;
}

export interface IFile {
  id: string;
  name: string;
  content: string;
  tempContent: string;

  isSaved: boolean;
  isOpen: boolean;

  toObject(): IFileObject;
}

export class File implements IFile {
  id: string;
  name: string;
  content: string;
  tempContent: string;

  isSaved: boolean;
  isOpen: boolean;

  constructor(fileObject: IFileObject) {
    this.id = fileObject.id;
    this.name = fileObject.name;
    this.content = fileObject.content;
    this.isOpen = fileObject.isOpen;

    this.isSaved = true;
    this.tempContent = this.content;
  }

  toObject(): IFileObject {
    return {
      id: this.id,
      name: this.name,
      content: this.content,
      isOpen: this.isOpen
    };
  }
}
