import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuiModule } from 'ng2-semantic-ui-v9';
import { TelemetryModule } from '@sunbird/telemetry';
import {
  ContentCreditsComponent, PlayerComponent, ContentPlayerMetadataComponent,
  FancyTreeComponent, CollectionPlayerMetadataComponent,
  ContentRatingComponent, CommingSoonComponent,
  CreditsAndLicenceComponent, ContentActionsComponent, ContentPlayerComponent,
  ContentPlayerPageComponent, ContentChapterlistComponent, ContentLicenceComponent,
  CurriculumInfoComponent, CourseInfoComponent
} from './components';
import { SharedModule } from '@sunbird/shared';
import { CoreModule } from '@sunbird/core';
import { FormsModule } from '@angular/forms';
import { CommonConsumptionModule } from '@dicdikshaorg/common-consumption';
// import {SunbirdPdfPlayerModule} from '@project-sunbird/sunbird-pdf-player-v9';
import { SunbirdPdfPlayerModule} from '@dictrigyn/pdf-player';
import { SunbirdVideoPlayerModule } from 'dictrigyn-video-player-v9';
import { SunbirdEpubPlayerModule } from '@dicdikshaorg/epub-player-v9';
import { QumlPlayerService } from './service/quml-player/quml-player.service';
import { QumlLibraryModule, QuestionCursor } from '@project-sunbird/sunbird-quml-player-v9';
// import { EditorCursor } from '@project-sunbird/sunbird-collection-editor-v9';
import { EditorCursor } from '@dicdikshaorg/sunbird-collection-editor';


@NgModule({
  providers: [
    { provide: QuestionCursor, useExisting: QumlPlayerService },
    { provide: EditorCursor, useExisting: QumlPlayerService }
  ],
  imports: [
    CommonModule,
    SuiModule,
    TelemetryModule,
    SharedModule,
    CoreModule,
    FormsModule,
    CommonConsumptionModule,
    SunbirdPdfPlayerModule,
    SunbirdVideoPlayerModule,
    SunbirdEpubPlayerModule,
   QumlLibraryModule
  ],
  declarations: [ContentCreditsComponent, PlayerComponent, ContentPlayerMetadataComponent,
    FancyTreeComponent, CollectionPlayerMetadataComponent, ContentRatingComponent,
    CommingSoonComponent, CreditsAndLicenceComponent, ContentActionsComponent,
    ContentPlayerComponent, ContentPlayerPageComponent, ContentChapterlistComponent,
    ContentLicenceComponent,
    CurriculumInfoComponent,
    CourseInfoComponent],
  exports: [ContentCreditsComponent, PlayerComponent, ContentPlayerMetadataComponent,
    FancyTreeComponent, CollectionPlayerMetadataComponent, ContentRatingComponent,
    CommingSoonComponent, CreditsAndLicenceComponent, ContentActionsComponent,
    ContentPlayerComponent, ContentPlayerPageComponent, ContentChapterlistComponent,
    ContentLicenceComponent, CurriculumInfoComponent, CourseInfoComponent]
})
export class PlayerHelperModule { }
