import { IFileItem } from './file-item.model';
import { IFile, File } from './file.model';
import { UUID } from 'angular2-uuid';

export interface IFolder extends IFileItem {
  contents: (IFile|IFolder)[];
}

export class Folder implements IFolder {
  itemType = 'folder';
  id: string;
  expanded: boolean;
  name: string;
  contents: (File|Folder)[];

  constructor(name: string, contents: (File|Folder)[] = [], expanded: boolean = false, id: string = UUID.UUID()) {
    this.id = id;
    this.name = name;
    this.contents = contents;
    this.expanded = expanded;
  }

  toObject(): Object { 
    return {
      itemType: this.itemType,
      name: this.name,
      contents: this.contents.map((item: File|Folder) => {
        return item.toObject();
      }),
      expanded: this.expanded
    }
  }

  deleteFileItem(fileItem: File|Folder): void {
    for (let i = 0; i < this.contents.length; i++) {
      let _fileItem = this.contents[i];
      if (_fileItem instanceof File && _fileItem === fileItem) {
        this.contents.splice(i, 1);
        i--;
      } else if (_fileItem instanceof Folder) {
        if (_fileItem === fileItem) {
          this.contents.splice(i, 1);
          i--;
        } else {
          _fileItem.deleteFileItem(fileItem);
        }
      }
    }
  }

  getFileById(fileId: string): File {
    let file;
    this.contents.forEach((fileItem: File|Folder) => {
      if (fileItem instanceof File && fileItem.id === fileId) {
        file = fileItem;
      } else if (fileItem instanceof Folder) {
        const matchingFile = fileItem.getFileById(fileId);
        if (matchingFile) {
          file = matchingFile;
        }
      }
    });
    return file;
  }

  getItemDepth(fileItem: File|Folder, depth: number = 1): number {
    for (let i = 0; i < this.contents.length; i++) {
      let _fileItem = this.contents[i];
      if (_fileItem.id === fileItem.id) {
        return depth;
      } else if (_fileItem instanceof Folder) {
        const _depth = _fileItem.getItemDepth(fileItem, depth + 1);
        if (_depth) {
          return _depth;
        }
      }
    }
    return undefined;
  }
  
  get files(): File[] {
    let files: File[] = [];
    this.contents.forEach((fileItem: File|Folder) => {
      if (fileItem instanceof File) {
        files.push(fileItem);
      } else if (fileItem instanceof Folder) {
        files = files.concat(fileItem.openFiles);
      }
    });
    return files;
  }

  get openFiles(): File[] {
    return this.files.filter((file) => {
      return file.open;
    });
  }

  get sortedContents(): (File|Folder)[] {
    return this.contents.sort((a, b) => {
      const isFolder = (fileItem: File|Folder) => {
        return fileItem instanceof Folder;
      };
      if (isFolder(a) && !isFolder(b)) {
        return -1;
      } else if (!isFolder(a) && isFolder(b)) {
        return 1;
      } else if (a.name === b.name) {
        return a.id.localeCompare(b.id);
      }
      return a.name.localeCompare(b.name);
    });
  }
}
