import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// Models
import {
  ICompilerContract
} from '../../../../models/index';

//component to get contract details from compilation

@Component({
  moduleId: module.id,
  selector: 'details-dialog',
  templateUrl: 'details-dialog.component.html',
  styleUrls: ['details-dialog.component.css']
})
export class DetailsDialogComponent {
  constructor(public dialogRef: MatDialogRef<DetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public contract: ICompilerContract) { }
}
