import {AfterContentInit, AfterViewInit, Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {BoardService} from "core-app/modules/boards/board/board.service";
import {Board} from "core-app/modules/boards/board/board";
import {BoardCacheService} from "core-app/modules/boards/board/board-cache.service";
import {NotificationsService} from "core-app/modules/common/notifications/notifications.service";
import {OpModalService} from "core-components/op-modals/op-modal.service";
import {NewBoardModalComponent} from "core-app/modules/boards/new-board-modal/new-board-modal.component";
import {BannersService} from "core-app/modules/common/enterprise/banners.service";
import {LoadingIndicatorService} from "core-app/modules/common/loading-indicator/loading-indicator.service";

@Component({
  templateUrl: './boards-index-page.component.html',
  styleUrls: ['./boards-index-page.component.sass']
})
export class BoardsIndexPageComponent implements AfterViewInit {

  public text = {
    name: this.I18n.t('js.modals.label_name'),
    board: this.I18n.t('js.label_board'),
    boards: this.I18n.t('js.label_board_plural'),
    type: this.I18n.t('js.boards.label_board_type'),
    type_free: this.I18n.t('js.boards.board_type.free'),
    action_by_attribute: (attr:string) => this.I18n.t('js.boards.board_type.action_by_attribute',
      {attribute: attr}),
    createdAt: this.I18n.t('js.label_created_on'),
    delete: this.I18n.t('js.button_delete'),
    areYouSure: this.I18n.t('js.text_are_you_sure'),
    deleteSuccessful: this.I18n.t('js.notice_successful_delete'),
    noResults: this.I18n.t('js.notice_no_results_to_display'),
    upsaleBoards: this.I18n.t('js.boards.upsale.boards'),
    upsaleCheckOutLink: this.I18n.t('js.boards.upsale.check_out_link')
  };

  public boards$:Observable<Board[]> = this.boardCache.observeAll();

  constructor(private readonly boardService:BoardService,
              private readonly boardCache:BoardCacheService,
              private readonly I18n:I18nService,
              private readonly notifications:NotificationsService,
              private readonly opModalService:OpModalService,
              private readonly loadingIndicatorService:LoadingIndicatorService,
              private readonly injector:Injector,
              private readonly bannerService:BannersService) {
  }

  ngAfterViewInit():void {
    const loadingIndicator = this.loadingIndicatorService.indicator('boards-module');
    loadingIndicator.promise = this.boardService.loadAllBoards();
  }

  get canManage() {
    return this.boardService.canManage;
  }

  newBoard() {
    this.opModalService.show(NewBoardModalComponent, this.injector);
  }

  destroyBoard(board:Board) {
    if (!window.confirm(this.text.areYouSure)) {
      return;
    }

    this.boardService
      .delete(board)
      .then(() => {
        this.boardCache.clearSome(board.id!);
        this.notifications.addSuccess(this.text.deleteSuccessful);
      })
      .catch((error) => this.notifications.addError("Deletion failed: " + error));
  }

  public showBoardIndexView() {
    return !this.bannerService.eeShowBanners;
  }
}
