import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import * as _ from 'lodash-es';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourceService, UtilService } from '@sunbird/shared';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { upperCase } from 'lodash';

@Component({
  selector: 'app-global-search-selected-filter',
  templateUrl: './global-search-selected-filter.component.html',
  styleUrls: ['./global-search-selected-filter.component.scss']
})
export class GlobalSearchSelectedFilterComponent implements OnInit {
  @Input() facets: { name: string, label: string, index: string, placeholder: string, values: { name: string, count?: number }[] }[];
  @Input() selectedFilters;
  @Input() queryParamsToOmit;
  @Output() filterChange: EventEmitter<{ status: string, filters?: any }> = new EventEmitter();
  private unsubscribe$ = new Subject<void>();

  upperCaseObj = ["igot-health","cbse/ncert","cbse","ncert","cisce","nios","cpd","ut (dnh and dd)", "ict", "nss volunteers", "aas pass (evs)", "craft", "ecce", "evs", "gka", "ict", "tamil (at)", "tamil (bt)","spcc", "nyks","nursing", "nep", "manipuri lairek laisu (meetei mayek)", "looking around (evs)", "kannada (bt)", "ircs"]
  constructor(private router: Router, private activatedRoute: ActivatedRoute, public resourceService: ResourceService, private utilService: UtilService) { }

  ngOnInit() {
    if(this.selectedFilters.se_boards && !_.isArray(this.selectedFilters.se_boards && this.selectedFilters.se_boards)){
      this.selectedFilters.se_boards = [this.selectedFilters.se_boards];
    }
    if(this.selectedFilters.se_mediums && !_.isArray(this.selectedFilters.se_mediums && this.selectedFilters.se_mediums)){
      this.selectedFilters.se_mediums = [this.selectedFilters.se_mediums];
    }
    if(this.selectedFilters.se_gradeLevels && !_.isArray(this.selectedFilters.se_gradeLevels && this.selectedFilters.se_gradeLevels)){
      this.selectedFilters.se_gradeLevels = [this.selectedFilters.se_gradeLevels];
    }
    
    this.resourceService.languageSelected$.pipe(takeUntil(this.unsubscribe$)).subscribe((languageData) => {
      if (this.facets) {
        this.facets.forEach((facet) => {
          facet['label'] = this.utilService.transposeTerms(facet['label'], facet['label'], this.resourceService.selectedLang);
        });
      }
    });
  }
  
  toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }
  formetText(selectedFilters:any):string{
    if (typeof selectedFilters != "string") {
      selectedFilters = selectedFilters[0];
    }
    
    if(this.upperCaseObj.includes(selectedFilters)){
      return selectedFilters.toUpperCase();
    } else if(selectedFilters.toLowerCase() ==='cbse training'){
      return 'CBSE Training'
    } else if( selectedFilters.startsWith("ut") || selectedFilters.startsWith("UT")){
      let text1 = selectedFilters.split(' ')
      let firstPart = text1.shift()
      let secondPart = text1.join(' ')
      return (firstPart.toUpperCase()+(' ').concat(this.toTitleCase(secondPart)))
    }
    else {
      return selectedFilters
    }
  }

  removeFilterSelection(data) {
    _.map(this.selectedFilters, (value, key) => {
      if (this.selectedFilters[data.type] && !_.isEmpty(this.selectedFilters[data.type])) {
        _.remove(value, (n) => {
          return n === data.value && data.type === key;
        });
      }
      if (_.isEmpty(value)) { delete this.selectedFilters[key]; }
    });
    this.filterChange.emit({ status: 'FETCHED', filters: this.selectedFilters });
    this.updateRoute();
  }

  public updateRoute() {
    let queryFilters = _.get(this.activatedRoute, 'snapshot.queryParams');
    if (this.selectedFilters.channel) {
      const channelIds = [];
      const facetsData = _.find(this.facets, {'name': 'channel'});
      _.forEach(this.selectedFilters.channel, (value, index) => {
        const data = _.find(facetsData.values, {'name': value});
        channelIds.push(data.identifier);
      });
      this.selectedFilters.channel = channelIds;
    }
    if (!_.get(this.selectedFilters, 'selectedTab') && _.get(queryFilters, 'selectedTab')) {
      this.selectedFilters['selectedTab'] = _.get(queryFilters, 'selectedTab');
    }
    if (this.queryParamsToOmit) {
      queryFilters = _.omit(_.get(this.activatedRoute, 'snapshot.queryParams'), this.queryParamsToOmit);
    }
    queryFilters = {...queryFilters, ...this.selectedFilters};
    this.router.navigate([], {
      queryParams: queryFilters,
      relativeTo: this.activatedRoute.parent
    });
  }

  showLabel() {
    if((Object.keys(this.selectedFilters).length == 0) || (Object.keys(this.selectedFilters).length == 1 && _.get(this.selectedFilters, 'selectedTab') == 'all')) {
      return false
    } else {
      return true;
    }
  }

  checkDataType(selectedVar:any){
    return typeof(selectedVar) === 'string';
  }
}
