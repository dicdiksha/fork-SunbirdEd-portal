import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import * as _ from 'lodash-es';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourceService, UtilService } from '@sunbird/shared';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';

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

  constructor(private router: Router, private activatedRoute: ActivatedRoute, public resourceService: ResourceService, private utilService: UtilService) { }

  ngOnInit() {
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
  formetText(selectedFilters:string):string{
    if(selectedFilters.toLowerCase() ==='cbse training'){
      return 'CBSE Training'
    }
    else if (selectedFilters.toLowerCase() == 'igot-health' ) {
      return 'IGOT-Health';
    } else if (selectedFilters.toLowerCase() == 'cbse/ncert' ) {
      return 'CBSE/NCERT ';
    }
    else if(selectedFilters.toLowerCase() == 'cbse'){
      return 'CBSE'
    }
    else if(selectedFilters.toLowerCase() == 'ncert'){
      return 'NCERT'
    }
     else if (selectedFilters.toLowerCase() == 'cisce' ) {
      return 'CISCE ';
    } else if (selectedFilters.toLowerCase() == 'nios' ) {
      return 'NIOS ';
    }
    else if(selectedFilters.toLowerCase() === 'cpd'){
      return 'CPD'
    }
    else if(selectedFilters.toLowerCase() == 'ut (dnh and dd)'){
      return 'UT (DNH And DD) '
    }
    else if( selectedFilters.startsWith("ut") || selectedFilters.startsWith("UT")){
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
}
