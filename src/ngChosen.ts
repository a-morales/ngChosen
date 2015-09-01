/// <reference path="../typings/angularjs/angular.d.ts" />
module ngChosen {
	"use strict";

	class AngularChosenDirective implements ng.IDirective {
		private updateState(element: any, loading: boolean, disabled: boolean, showNoResultsText: boolean): void {
			element.toggleClass("loading", loading).attr("disabled", disabled);

			var defaultText = element.data("placeholder");
			var noResultsText = element.attr("no-results-text");
			this.updatePlaceholder(element, showNoResultsText ? noResultsText : defaultText);

			this.triggerUpdate(element);
		}

		private isEmpty(object: any): boolean {
			if (angular.isArray(object)) {
				return object.length === 0;
			} else if (angular.isObject(object)) {
				var key;
				for (key in object) {
					if (object.hasOwnProperty(key)) {
						return false;
					}
				}
			}
			return true;
		}

		private triggerUpdate(element: any): void {
			if (element) {
				element.trigger("chosen:updated");
			}
		}

		private updatePlaceholder(element: any, text: string): void {
			element.attr("data-placeholder", text);
		}

        restrict = "A";
        require = "?ngModel";
        scope = {
			noResultsText: "@",
			datasource: "=",
			placeholder: "@",
			allowSingleDeselect: "@",
			disableSearch: "@"
        };
        link = (scope: any, element: any, attributes: any, ngModelCtrl: ng.INgModelController) => {
			var elem = element;
			elem.addClass("ng-chosen").chosen({
				no_results_text: scope.noResultsText,
				allow_single_deselect: scope.allowSingleDeselect,
				disable_search: scope.disableSearch
			});

			scope.$watchCollection("datasource", (newValue, oldValue) => {
				if (angular.isUndefined(newValue)) {
					this.updateState(elem, true, true, true);
				} else if (this.isEmpty(newValue)) {
					this.updateState(elem, false, true, true);
				} else {
					this.updateState(elem, false, false, false);
				}
			});

			attributes.$observe("placeholder", (newValue) => {
				this.updatePlaceholder(elem, newValue);
				this.triggerUpdate(elem);
			});

			if (ngModelCtrl) {
				var origRender = ngModelCtrl.$render;
				ngModelCtrl.$render = () => {
					origRender();
					this.triggerUpdate(elem);
				};
				if (attributes.multiple) {
					scope.$watch(function() {
						ngModelCtrl.$viewValue;
					}, ngModelCtrl.$render, true);
				}
			}
        }
    }

    /*@ngInject*/
    function directive(): ng.IDirective {
        return new AngularChosenDirective();
    }

    angular.module("ngChosen", []);
    angular.module("ngChosen").directive("ngChosen", directive);
}