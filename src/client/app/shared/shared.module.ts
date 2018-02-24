import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ContextMenuModule } from './ext/ngx-contextmenu/ngx-contextmenu';

// Components
import { EditorComponent } from './components/editor/editor.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FileTabComponent } from './components/sidebar/file-tab/file-tab.component';
import { CompileTabComponent } from './components/sidebar/compile-tab/compile-tab.component';
import { RunTabComponent } from './components/sidebar/run-tab/run-tab.component';
import { TabsComponent } from './components/tabs/tabs.component';

// Services
import { StorageService } from './services/storage/storage.service';
import { FileService } from './services/file/file.service';
import { EditorService } from './services/editor/editor.service';
import { TabService } from './services/tab/tab.service';
import { CompilerService } from './services/compiler/compiler.service';
import { SolcVersionsService } from './services/solc-versions/solc-versions.service';

// Material imports
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule, MatSelectModule } from '@angular/material';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ContextMenuModule.forRoot(),
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatSelectModule
  ],
  declarations: [
    SidebarComponent,
    EditorComponent,
    TabsComponent,
    FileTabComponent,
    CompileTabComponent,
    RunTabComponent
  ],
  exports: [
    SidebarComponent,
    EditorComponent,
    TabsComponent,
    FileTabComponent,
    CompileTabComponent,
    RunTabComponent,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        StorageService,
        FileService,
        EditorService,
        TabService,
        CompilerService,
        SolcVersionsService
      ]
    };
  }
}
