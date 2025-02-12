import { join } from 'path';

import { SeedConfig } from './seed.config';
import { ExtendPackages } from './seed.config.interfaces';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  constructor() {
    super();
    this.APP_TITLE = 'Hmix';
    // this.GOOGLE_ANALYTICS_ID = 'Your site's ID';

    /* Enable typeless compiler runs (faster) between typed compiler runs. */
    // this.TYPED_COMPILE_INTERVAL = 5;

    // Add `NPM` third-party libraries to be injected/bundled.
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      // {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
      // {src: 'lodash/lodash.min.js', inject: 'libs'},
      {src: '@angular/material/prebuilt-themes/indigo-pink.css', inject: true},
      {src: 'web-animations-js/web-animations.min.js', inject: 'shims'},
      {src: 'hammerjs/hammer.js', inject: 'libs'},
    ];

    // Add `local` third-party libraries to be injected/bundled.
    this.APP_ASSETS = [
      {src: `${this.APP_SRC}/ext/solc.bundle.js`, inject: true, vendor: false},
      {src: `${this.APP_SRC}/ext/htmlcoinjs.bundle.js`, inject: true, vendor: false},
      {src: `${this.CSS_SRC}/font-awesome.min.css`, inject: true, vendor: false},
      {src: `${this.CSS_SRC}/materialize.min.css`, inject: true, vendor: false}
    ];

    this.ROLLUP_INCLUDE_DIR = [
      ...this.ROLLUP_INCLUDE_DIR,
      //'node_modules/moment/**'
    ];

    this.ROLLUP_NAMED_EXPORTS = [
      ...this.ROLLUP_NAMED_EXPORTS,
      //{'node_modules/immutable/dist/immutable.js': [ 'Map' ]},
    ];

    // Add packages (e.g. ng2-translate)
    const additionalPackages: ExtendPackages[] = [
      {
        name: 'brace',
        path: 'node_modules/brace',
        packageMeta: {
          defaultExtension: 'js',
          main: 'index'
        }
      },
      {
        name: 'angular2-uuid',
        path: 'node_modules/angular2-uuid',
        packageMeta: {
          defaultExtension: 'js',
          main: 'index'
        }
      },
      {
        name: 'webworkify',
        path: 'node_modules/webworkify',
        packageMeta: {
          defaultExtension: 'js',
          main: 'index'
        }
      },
      {
        name: '@angular/material',
        path: 'node_modules/@angular/material/bundles/material.umd.js'
      },
      {
        name: '@angular/cdk',
        path: 'node_modules/@angular/cdk/bundles/cdk.umd.js'
      },
      {
        name: '@angular/cdk/a11y',
        path: 'node_modules/@angular/cdk/bundles/cdk-a11y.umd.js'
      },
      {
        name: '@angular/cdk/accordion',
        path: 'node_modules/@angular/cdk/bundles/cdk-accordion.umd.js'
      },
      {
        name: '@angular/cdk/bidi',
        path: 'node_modules/@angular/cdk/bundles/cdk-bidi.umd.js'
      },
      {
        name: '@angular/cdk/coercion',
        path: 'node_modules/@angular/cdk/bundles/cdk-coercion.umd.js'
      },
      {
        name: '@angular/cdk/collections',
        path: 'node_modules/@angular/cdk/bundles/cdk-collections.umd.js'
      },
      {
        name: '@angular/cdk/keycodes',
        path: 'node_modules/@angular/cdk/bundles/cdk-keycodes.umd.js'
      },
      {
        name: '@angular/cdk/layout',
        path: 'node_modules/@angular/cdk/bundles/cdk-layout.umd.js'
      },
      {
        name: '@angular/cdk/observers',
        path: 'node_modules/@angular/cdk/bundles/cdk-observers.umd.js'
      },
      {
        name: '@angular/cdk/overlay',
        path: 'node_modules/@angular/cdk/bundles/cdk-overlay.umd.js'
      },
      {
        name: '@angular/cdk/platform',
        path: 'node_modules/@angular/cdk/bundles/cdk-platform.umd.js'
      },
      {
        name: '@angular/cdk/portal',
        path: 'node_modules/@angular/cdk/bundles/cdk-portal.umd.js'
      },
      {
        name: '@angular/cdk/scrolling',
        path: 'node_modules/@angular/cdk/bundles/cdk-scrolling.umd.js'
      },
      {
        name: '@angular/cdk/stepper',
        path: 'node_modules/@angular/cdk/bundles/cdk-stepper.umd.js'
      },
      {
        name: '@angular/cdk/table',
        path: 'node_modules/@angular/cdk/bundles/cdk-table.umd.js'
      }
    ];
    this.addPackagesBundles(additionalPackages);

    /* Add proxy middleware */
    // this.PROXY_MIDDLEWARE = [
    //   require('http-proxy-middleware')('/api', { ws: false, target: 'http://localhost:3003' })
    // ];

    /* Add to or override NPM module configurations: */
    // this.PLUGIN_CONFIGS['browser-sync'] = { ghostMode: false };
  }

}
