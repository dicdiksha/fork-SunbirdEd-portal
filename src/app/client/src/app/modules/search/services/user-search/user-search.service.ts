
import {map} from 'rxjs/operators';
import { Injectable, EventEmitter } from '@angular/core';
import { ConfigService } from '@sunbird/shared';
import { LearnerService } from '@sunbird/core';
import { PublicDataService } from '../../../../modules/core/services/public-data/public-data.service'
/**
 * Service to get course consumption dashboard
 *
 * It responsible to make http call
 */
@Injectable()

/**
 * @class UserSearchService
 */
export class UserSearchService {

  userDetailsObject: any;

    /**
   * To listen event
   */
  userDeleteEvent = new EventEmitter();


  /**
   * To get api urls
   */
  public config: ConfigService;

  constructor(private learnerService: LearnerService,private publicDataService: PublicDataService,
  config: ConfigService) {
    this.config = config;
  }

  deleteUser(requestParam) {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.DELETE_USER,
      data: {
        'request': {
          'userId': requestParam.userId
        }
      }
    };

    return this.learnerService.post(option).pipe(map(data => {
      this.userDeleteEvent.emit(requestParam.userId);
      return data;
    }));
  }

  blockUser(requestParam) {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.DELETE_USER,
      data: {
        'request': {
          'userId': requestParam.userId
        }
      }
    };
    console.log("blockUser option=====",option)
    return this.publicDataService.post(option).pipe(map(data => {
      this.userDeleteEvent.emit(requestParam.userId);
      return data;
    }));
  }

  updateRoles(requestParam) {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.UPDATE_USER_ORG_ROLES,
      data: {
          'request': {
            'userId': requestParam.userId,
            'organisationId': requestParam.orgId,
            'roles': requestParam.roles
          }
        }
    };

    return this.learnerService.post(option);
  }

  getUserById(requestParam) {
    const option = {
      url: this.config.urlConFig.URLS.USER.GET_PROFILE + requestParam.userId + '?fields=organisations,roles,locations'
    };

    return this.learnerService.get(option);
  }

  getUserByIdV5(requestParam) {
    const option = {
      url: this.config.urlConFig.URLS.USER.GET_PROFILE_V5 + requestParam.userId + '?fields=organisations,roles,locations'
    };
    return this.learnerService.get(option);
  }

  getUserType() {
    const option = {
      url: this.config.urlConFig.URLS.USER.TYPE
    };

    return this.learnerService.get(option);
  }
}
